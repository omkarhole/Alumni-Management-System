const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ==================== POLL ROUTES ====================

// Public routes
router.get('/categories', pollController.getCategories);
router.get('/stats', pollController.getPollStats);
router.get('/', pollController.getPolls);
router.get('/:pollId', pollController.getPollById);
router.get('/:pollId/results', pollController.getPollResults);

// Protected routes
router.post('/', authenticate, pollController.createPoll);
router.post('/:pollId/vote', authenticate, pollController.vote);
router.get('/my-polls', authenticate, pollController.getMyPolls);
router.put('/:pollId', authenticate, pollController.updatePoll);
router.patch('/:pollId/close', authenticate, pollController.closePoll);
router.delete('/:pollId', authenticate, pollController.deletePoll);

module.exports = router;
