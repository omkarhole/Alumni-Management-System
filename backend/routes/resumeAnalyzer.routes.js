const express = require('express');
const { analyzeResume, getAnalysisHistory, getRecommendations } = require('../controllers/resumeAnalyzer.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Analyze resume text against a job requirement snapshot
router.post('/', authenticate, analyzeResume);

// Get last analyses for this user
router.get('/history', authenticate, getAnalysisHistory);

// Get derived recommendations for a past analysis
router.get('/:id/recommendations', authenticate, getRecommendations);

module.exports = router;

