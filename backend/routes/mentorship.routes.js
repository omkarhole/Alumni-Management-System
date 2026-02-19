const express = require('express');
const router = express.Router();
const { authenticate, isAdmin, isAlumnus } = require('../middlewares/auth.middleware');
const {
  // Mentor Profile
  createOrUpdateMentorProfile,
  getMentorProfile,
  getMyMentorProfile,
  toggleMentorStatus,
  listMentors,
  getMentorFilterOptions,
  
  // Mentorship Match
  requestMentorship,
  respondToMentorshipRequest,
  getMyMentorships,
  getMentorshipDetails,
  endMentorship,
  submitMentorshipFeedback,
  
  // Mentorship Session
  scheduleSession,
  getMentorshipSessions,
  getMyUpcomingSessions,
  updateSession,
  cancelSession,
  completeSession,
  
  // Mentorship Message
  sendMessage,
  getMessages,
  getUnreadMessageCount,
  editMessage,
  deleteMessage,
  
  // Admin
  getAllMentorships,
  getMentorshipStats,
  adminUpdateMentorshipStatus
} = require('../controllers/mentorship.controller');

// ==================== PUBLIC ROUTES ====================

// List all active mentors (public)
router.get('/mentors', listMentors);

// Get mentor filter options (public)
router.get('/mentors/filters', getMentorFilterOptions);

// Get mentor profile by user ID (public)
router.get('/mentors/:userId', getMentorProfile);

// ==================== PROTECTED ROUTES (All Authenticated Users) ====================

// Get my mentor profile
router.get('/my-profile', authenticate, getMyMentorProfile);

// Get my mentorships
router.get('/my-mentorships', authenticate, getMyMentorships);

// Get mentorship details
router.get('/mentorships/:matchId', authenticate, getMentorshipDetails);

// Request mentorship
router.post('/request', authenticate, requestMentorship);

// End mentorship
router.put('/mentorships/:matchId/end', authenticate, endMentorship);

// Submit feedback
router.post('/mentorships/feedback', authenticate, submitMentorshipFeedback);

// Get my upcoming sessions
router.get('/my-sessions', authenticate, getMyUpcomingSessions);

// Get sessions for a mentorship
router.get('/mentorships/:mentorshipId/sessions', authenticate, getMentorshipSessions);

// Schedule a session
router.post('/sessions', authenticate, scheduleSession);

// Update session
router.put('/sessions/:sessionId', authenticate, updateSession);

// Cancel session
router.put('/sessions/:sessionId/cancel', authenticate, cancelSession);

// Complete session
router.put('/sessions/:sessionId/complete', authenticate, completeSession);

// Send message
router.post('/messages', authenticate, sendMessage);

// Get messages for a mentorship
router.get('/mentorships/:mentorshipId/messages', authenticate, getMessages);

// Get unread message count
router.get('/messages/unread-count', authenticate, getUnreadMessageCount);

// Edit message
router.put('/messages/:messageId', authenticate, editMessage);

// Delete message
router.delete('/messages/:messageId', authenticate, deleteMessage);

// ==================== MENTOR ONLY ROUTES ====================

// Create or update mentor profile
router.post('/mentor-profile', authenticate, isAlumnus, createOrUpdateMentorProfile);

// Toggle mentor status (active/inactive)
router.put('/mentor-profile/toggle-status', authenticate, isAlumnus, toggleMentorStatus);

// Respond to mentorship request (accept/reject)
router.put('/respond-request', authenticate, isAlumnus, respondToMentorshipRequest);

// ==================== ADMIN ROUTES ====================

// Get all mentorships
router.get('/admin/mentorships', authenticate, isAdmin, getAllMentorships);

// Get mentorship statistics
router.get('/admin/stats', authenticate, isAdmin, getMentorshipStats);

// Admin: Update mentorship status
router.put('/admin/mentorships/:matchId/status', authenticate, isAdmin, adminUpdateMentorshipStatus);

module.exports = router;
