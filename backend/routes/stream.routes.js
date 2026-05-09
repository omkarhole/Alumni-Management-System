const express = require('express');
const router = express.Router();

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const {
  createStreamSession,
  getStreamUrl,
  endStream,
} = require('../controllers/stream.controller');

// Attendees/admin access pattern:
// - Attendees: GET stream url is public
// - Organizer/Admin: create/end are protected (for now using isAdmin)

router.post('/sessions', authenticate, isAdmin, createStreamSession);
router.get('/sessions/:eventId/url', getStreamUrl);
router.post('/sessions/:eventId/end', authenticate, isAdmin, endStream);

module.exports = router;

