const express = require('express');
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getCalendarView,
  getUpcomingEvents,
  getEventDetails,
  rsvpEvent,
  cancelRsvp,
  getMyRsvps,
  getEventAttendees,
  updateEvent,
  deleteEvent
} = require('../controllers/eventCalendar.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', getAllEvents);
router.get('/calendar-view', getCalendarView);
router.get('/upcoming', getUpcomingEvents);
router.get('/details/:id', getEventDetails);

// Authenticated routes
router.post('/', authenticate, isAdmin, createEvent);
router.put('/:eventId', authenticate, isAdmin, updateEvent);
router.delete('/:eventId', authenticate, isAdmin, deleteEvent);

// RSVP routes
router.post('/rsvp', authenticate, rsvpEvent);
router.post('/cancel-rsvp', authenticate, cancelRsvp);
router.get('/my-rsvps', authenticate, getMyRsvps);

// Organizer routes
router.get('/:eventId/attendees', authenticate, getEventAttendees);

module.exports = router;
