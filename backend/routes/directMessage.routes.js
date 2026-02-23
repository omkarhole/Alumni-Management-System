const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  getUnreadCount,
  deleteMessage
} = require('../controllers/directMessage.controller');

// All routes require authentication
router.use(authenticate);

// Send a direct message
router.post('/messages', sendMessage);

// Get all conversations (inbox)
router.get('/conversations', getConversations);

// Get messages with a specific user
router.get('/messages/:userId', getMessages);

// Mark messages from a user as read
router.put('/messages/:userId/read', markAsRead);

// Get unread message count
router.get('/messages/unread-count', getUnreadCount);

// Delete a message
router.delete('/messages/:messageId', deleteMessage);

module.exports = router;
