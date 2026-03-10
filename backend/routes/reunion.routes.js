const express = require('express');
const router = express.Router();

const {
  listReunions,
  getReunionById,
  getReunionsByBatch,
  createReunion,
  updateReunion,
  deleteReunion,
  joinReunion,
  leaveReunion,
  addMemory,
  getMemories,
  deleteMemory,
  likeMemory,
  unlikeMemory,
  addComment,
  addContribution,
  getContributions,
  updateContributionStatus,
  addOrganizer,
  removeOrganizer,
  getUpcomingReunions
} = require('../controllers/reunion.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Reunion Routes
router.get('/', listReunions);
router.get('/upcoming', getUpcomingReunions);
router.get('/batch/:batch', getReunionsByBatch);
router.get('/:id', getReunionById);
router.post('/', authenticate, createReunion);
router.put('/:id', authenticate, updateReunion);
router.delete('/:id', authenticate, deleteReunion);

// RSVP Routes
router.post('/join', authenticate, joinReunion);
router.post('/leave', authenticate, leaveReunion);

// Memory Routes
router.post('/:reunionId/memories', authenticate, addMemory);
router.get('/:reunionId/memories', getMemories);
router.delete('/memories/:memoryId', authenticate, deleteMemory);
router.post('/memories/:memoryId/like', authenticate, likeMemory);
router.post('/memories/:memoryId/unlike', authenticate, unlikeMemory);
router.post('/memories/:memoryId/comment', authenticate, addComment);

// Contribution Routes
router.post('/:reunionId/contributions', authenticate, addContribution);
router.get('/:reunionId/contributions', getContributions);
router.put('/contributions/:contributionId/status', authenticate, updateContributionStatus);

// Organizer Routes
router.post('/:reunionId/organizers', authenticate, addOrganizer);
router.delete('/:reunionId/organizers/:organizerId', authenticate, removeOrganizer);

module.exports = router;
