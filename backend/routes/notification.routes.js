const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getNotifications,
  markNotificationRead,
  getNotificationPreferences,
  updateNotificationPreferences
} = require('../controllers/opportunity.controller');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markNotificationRead);
router.get('/preferences', authenticate, getNotificationPreferences);
router.patch('/preferences', authenticate, updateNotificationPreferences);

module.exports = router;