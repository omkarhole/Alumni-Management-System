const DirectMessage = require('../models/DirectMessage.model');
const User = require('../models/User.model');

// Send a direct message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', fileUrl = '', fileName = '' } = req.body;
    const senderId = req.user.id;

    // Validate required fields
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Cannot send message to yourself
    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Create the message
    const message = new DirectMessage({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      fileUrl,
      fileName
    });

    await message.save();

    // Populate sender info for the response
    await message.populate('sender', 'name email alumnus_bio.avatar');
    await message.populate('receiver', 'name email alumnus_bio.avatar');

    res.status(201).json({ 
      message: 'Message sent successfully',
      data: message 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get messages with a specific user (conversation)
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find messages between the two users
    const messages = await DirectMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ],
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('sender', 'name email alumnus_bio.avatar')
    .populate('receiver', 'name email alumnus_bio.avatar');

    const total = await DirectMessage.countDocuments({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ],
      isDeleted: false
    });

    // Mark messages as read
    await DirectMessage.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Get all conversations (list of users with whom current user has exchanged messages)
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get the latest message from each conversation
    const latestMessages = await DirectMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ],
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', currentUserId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details for each conversation
    const conversations = await Promise.all(
      latestMessages.map(async (conv) => {
        const user = await User.findById(conv._id)
          .select('name email alumnus_bio.avatar alumnus_bio.batch alumnus_bio.course alumnus_bio.status')
          .populate('alumnus_bio.course', 'course');
        
        return {
          user,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    // Filter out any null users (deleted accounts)
    const validConversations = conversations.filter(conv => conv.user);

    res.json({ conversations: validConversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await DirectMessage.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Get total unread message count
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const count = await DirectMessage.countDocuments({
      receiver: currentUserId,
      isRead: false,
      isDeleted: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await DirectMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only the sender can delete the message
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  getUnreadCount,
  deleteMessage
};
