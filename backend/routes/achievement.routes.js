const express = require('express');

const {
    createAchievement,
    getAchievements,
    getMyAchievements,
    getUserAchievements,
    updateAchievement,
    deleteAchievement,
    getAllAchievementsAdmin
} = require('../controllers/achievement.controller');

const { authenticate, isAdmin, isAlumnus } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public route - Get all published achievements (feed)
router.get('/', getAchievements);

// Authenticated routes
router.get('/my-achievements', authenticate, getMyAchievements);

// Get achievements for a specific user
router.get('/user/:userId', getUserAchievements);

// Admin routes - Get all achievements including unpublished
router.get('/admin/all', authenticate, isAdmin, getAllAchievementsAdmin);

// Create achievement (alumni and admin only)
router.post('/', authenticate, isAlumnus, createAchievement);

// Update achievement (owner or admin)
router.put('/:id', authenticate, updateAchievement);

// Delete achievement (owner or admin)
router.delete('/:id', authenticate, deleteAchievement);

module.exports = router;
