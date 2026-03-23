const DirectMessage = require('../models/DirectMessage.model');
const User = require('../models/User.model');

// Store active connections: { userId: socketId }
const activeUsers = new Map();
// Store conversation rooms: { conversationId: Set(socketIds) }
const conversationRooms = new Map();

/**
 * Initialize socket event handlers
 * Implements 9 socket events for real-time messaging:
 * 1. joinConversation - User joins a chat room
 * 2. leaveConversation - User leaves a chat room
 * 3. markAsRead - Mark messages as read
 * 4. addReaction - Add emoji reaction to message
 * 5. removeReaction - Remove emoji reaction
 * 6. voiceMessage - Send voice/audio message
 * 7. typingIndicator - Show user is typing
 * 8. messageDelete - Delete a message
 * 9. messageEdit - Edit a message
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ===== EVENT 1: JOIN CONVERSATION =====
    socket.on('joinConversation', (data) => {
      try {
        const { userId, conversationId } = data;

        if (!userId || !conversationId) {
          socket.emit('error', { message: 'User ID and Conversation ID are required' });
          return;
        }

        // Store user connection
        activeUsers.set(userId, socket.id);

        // Create room for conversation and join
        socket.join(conversationId);

        // Initialize room tracking
        if (!conversationRooms.has(conversationId)) {
          conversationRooms.set(conversationId, new Set());
        }
        conversationRooms.get(conversationId).add(socket.id);

        // Notify others that user is online
        io.to(conversationId).emit('userOnline', {
          userId,
          timestamp: new Date(),
          onlineUsersCount: conversationRooms.get(conversationId).size
        });

        console.log(`${userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in joinConversation:', error);
        socket.emit('connect_error', { message: 'Failed to join conversation' });
      }
    });

    // ===== EVENT 2: LEAVE CONVERSATION =====
    socket.on('leaveConversation', (data) => {
      try {
        const { userId, conversationId } = data;

        if (!conversationId) {
          return;
        }

        socket.leave(conversationId);

        if (conversationRooms.has(conversationId)) {
          conversationRooms.get(conversationId).delete(socket.id);

          // Notify others that user went offline
          io.to(conversationId).emit('userOffline', {
            userId,
            timestamp: new Date(),
            onlineUsersCount: conversationRooms.get(conversationId).size
          });
        }

        if (activeUsers.has(userId)) {
          activeUsers.delete(userId);
        }

        console.log(`${userId} left conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in leaveConversation:', error);
      }
    });

    // ===== EVENT 3: MARK AS READ =====
    socket.on('markAsRead', (data) => {
      try {
        const { conversationId, messageIds, userId } = data;

        if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
          socket.emit('error', { message: 'Invalid mark as read data' });
          return;
        }

        // Update messages in database (called separately via HTTP for DB persistence)
        // This emits notification to other users about read status
        io.to(conversationId).emit('messagesMarkedAsRead', {
          messageIds,
          userId,
          timestamp: new Date()
        });

        console.log(`Messages marked as read by ${userId} in ${conversationId}`);
      } catch (error) {
        console.error('Error in markAsRead:', error);
        socket.emit('connect_error', { message: 'Failed to mark messages as read' });
      }
    });

    // ===== EVENT 4: ADD REACTION =====
    socket.on('addReaction', (data) => {
      try {
        const { conversationId, messageId, userId, emoji } = data;

        if (!conversationId || !messageId || !userId || !emoji) {
          socket.emit('error', { message: 'Missing required fields for reaction' });
          return;
        }

        // Broadcast reaction to all users in conversation
        io.to(conversationId).emit('reactionAdded', {
          messageId,
          userId,
          emoji,
          timestamp: new Date()
        });

        console.log(`Reaction ${emoji} added by ${userId} to message ${messageId}`);
      } catch (error) {
        console.error('Error in addReaction:', error);
        socket.emit('connect_error', { message: 'Failed to add reaction' });
      }
    });

    // ===== EVENT 5: REMOVE REACTION =====
    socket.on('removeReaction', (data) => {
      try {
        const { conversationId, messageId, userId, emoji } = data;

        if (!conversationId || !messageId || !userId || !emoji) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        io.to(conversationId).emit('reactionRemoved', {
          messageId,
          userId,
          emoji,
          timestamp: new Date()
        });

        console.log(`Reaction ${emoji} removed by ${userId} from message ${messageId}`);
      } catch (error) {
        console.error('Error in removeReaction:', error);
        socket.emit('connect_error', { message: 'Failed to remove reaction' });
      }
    });

    // ===== EVENT 6: VOICE MESSAGE =====
    socket.on('voiceMessage', (data) => {
      try {
        const { conversationId, messageId, userId, audioUrl, duration } = data;

        if (!conversationId || !userId || !audioUrl) {
          socket.emit('error', { message: 'Missing required voice message data' });
          return;
        }

        // Broadcast voice message to conversation
        io.to(conversationId).emit('voiceMessageReceived', {
          messageId,
          userId,
          audioUrl,
          duration,
          timestamp: new Date()
        });

        console.log(`Voice message from ${userId} in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in voiceMessage:', error);
        socket.emit('connect_error', { message: 'Failed to send voice message' });
      }
    });

    // ===== EVENT 7: TYPING INDICATOR =====
    socket.on('typingIndicator', (data) => {
      try {
        const { conversationId, userId, isTyping } = data;

        if (!conversationId || !userId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Notify others (excluding sender) that user is typing
        socket.broadcast.to(conversationId).emit('userTyping', {
          userId,
          isTyping,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in typingIndicator:', error);
      }
    });

    // ===== EVENT 8: MESSAGE DELETE =====
    socket.on('messageDelete', (data) => {
      try {
        const { conversationId, messageId, userId } = data;

        if (!conversationId || !messageId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        io.to(conversationId).emit('messageDeleted', {
          messageId,
          userId,
          timestamp: new Date()
        });

        console.log(`Message ${messageId} deleted by ${userId}`);
      } catch (error) {
        console.error('Error in messageDelete:', error);
        socket.emit('connect_error', { message: 'Failed to delete message' });
      }
    });

    // ===== EVENT 9: MESSAGE EDIT =====
    socket.on('messageEdit', (data) => {
      try {
        const { conversationId, messageId, userId, newContent } = data;

        if (!conversationId || !messageId || !newContent) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        io.to(conversationId).emit('messageEdited', {
          messageId,
          userId,
          newContent,
          timestamp: new Date()
        });

        console.log(`Message ${messageId} edited by ${userId}`);
      } catch (error) {
        console.error('Error in messageEdit:', error);
        socket.emit('connect_error', { message: 'Failed to edit message' });
      }
    });

    // ===== DISCONNECT HANDLER =====
    socket.on('disconnect', () => {
      try {
        // Remove user from active users
        let userId;
        for (const [uid, sid] of activeUsers.entries()) {
          if (sid === socket.id) {
            userId = uid;
            activeUsers.delete(uid);
            break;
          }
        }

        // Remove from all conversation rooms
        for (const [conversationId, socketSet] of conversationRooms.entries()) {
          if (socketSet.has(socket.id)) {
            socketSet.delete(socket.id);
            io.to(conversationId).emit('userOffline', {
              userId,
              timestamp: new Date(),
              onlineUsersCount: socketSet.size
            });
          }
        }

        console.log(`User disconnected: ${socket.id} (${userId})`);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // ===== CONNECTION ERROR HANDLING =====
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      socket.emit('error', { message: 'Connection failed. Please try again.' });
    });
  });
};

// Helper function to get online status
const getOnlineUsers = (conversationId) => {
  if (!conversationRooms.has(conversationId)) {
    return [];
  }
  return Array.from(conversationRooms.get(conversationId));
};

// Helper function to get user socket ID
const getUserSocketId = (userId) => {
  return activeUsers.get(userId);
};

module.exports = {
  initializeSocket,
  getOnlineUsers,
  getUserSocketId,
  activeUsers,
  conversationRooms
};
