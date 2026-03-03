const express = require('express');

const {
    createBadge,
    getAllBadges,
    getBadgeById,
    updateBadge,
    deleteBadge,
    awardBadge,
    getUserBadges,
    getMyBadges,
    removeUserBadge,
    getLeaderboard,
    submitVerificationRequest,
    getMyVerificationStatus,
    getVerificationRequests,
    reviewVerificationRequest,
    addVerificationDocument,
    initializeDefaultBadges
} = require('../controllers/badge.controller');

const { authenticate, isAdmin, isAlumnus } = require('../middlewares/auth.middleware');

const router = express.Router();

// ==================== BADGE ROUTES ====================

// Public route - Get all badges
router.get('/badges', getAllBadges);

// Get badge by ID
router.get('/badges/:id', getBadgeById);

// Admin routes - Badge management
router.post('/badges', authenticate, isAdmin, createBadge);
router.put('/badges/:id', authenticate, isAdmin, updateBadge);
router.delete('/badges/:id', authenticate, isAdmin, deleteBadge);

// Initialize default badges (admin)
router.post('/badges/initialize', authenticate, isAdmin, initializeDefaultBadges);

// ==================== USER BADGE ROUTES ====================

// Award badge to user (admin)
router.post('/award', authenticate, isAdmin, awardBadge);

// Get current user's badges
router.get('/my-badges', authenticate, getMyBadges);

// Get badges for a specific user
router.get('/user-badges/:userId', getUserBadges);

// Remove badge from user
router.delete('/user-badges/:id', authenticate, removeUserBadge);

// ==================== LEADERBOARD ROUTES ====================

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// ==================== VERIFICATION ROUTES ====================

// Submit verification request (alumni only)
router.post('/verification', authenticate, isAlumnus, submitVerificationRequest);

// Get current user's verification status
router.get('/verification/status', authenticate, getMyVerificationStatus);

// Add document to verification request
router.post('/verification/:requestId/documents', authenticate, addVerificationDocument);

// Admin routes - Verification management
router.get('/verification/requests', authenticate, isAdmin, getVerificationRequests);
router.put('/verification/requests/:id/review', authenticate, isAdmin, reviewVerificationRequest);

module.exports = router;
