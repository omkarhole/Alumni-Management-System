const { EventCalendar } = require('../models/Index');
const { User } = require('../models/Index');

// Create a new event
async function createEvent(req, res, next) {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      eventMode,
      location,
      virtualLink,
      capacity,
      rsvpDeadline,
      eventTags,
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
      banner,
      banner_public_id
    } = req.body;

    // Validate required fields
    if (!title || !description || !eventType || !startDate || !endDate || !eventMode || !capacity || !rsvpDeadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate eventMode specific fields
    if ((eventMode === 'in-person' || eventMode === 'hybrid') && !location) {
      return res.status(400).json({ message: 'Location is required for in-person or hybrid events' });
    }

    if ((eventMode === 'virtual' || eventMode === 'hybrid') && !virtualLink) {
      return res.status(400).json({ message: 'Virtual link is required for virtual or hybrid events' });
    }

    const newEvent = new EventCalendar({
      title,
      description,
      eventType,
      startDate,
      endDate,
      eventMode,
      location,
      virtualLink,
      capacity,
      rsvpDeadline,
      eventTags: eventTags || [],
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
      banner,
      banner_public_id,
      organizer: req.user._id,
      rsvps: [],
      status: 'published'
    });

    const savedEvent = await newEvent.save();
    
    // Populate organizer details
    await savedEvent.populate('organizer', 'name avatar');
    
    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (err) {
    next(err);
  }
}

// Get all events with filters
async function getAllEvents(req, res, next) {
  try {
    const { eventType, eventMode, tags, month, year, status } = req.query;
    
    const filter = { status: 'published' };

    if (eventType) filter.eventType = eventType;
    if (eventMode) filter.eventMode = eventMode;
    if (status) filter.status = status;
    
    if (tags) {
      filter.eventTags = { $in: tags.split(',') };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.startDate = { $gte: startDate, $lte: endDate };
    }

    const events = await EventCalendar.find(filter)
      .populate('organizer', 'name avatar')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    next(err);
  }
}

// Get events by calendar view (month/year)
async function getCalendarView(req, res, next) {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await EventCalendar.find({
      startDate: { $gte: startDate, $lte: endDate },
      status: 'published'
    })
      .populate('organizer', 'name avatar')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    next(err);
  }
}

// Get events for upcoming dates
async function getUpcomingEvents(req, res, next) {
  try {
    const { limit = 10, days = 30 } = req.query;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const events = await EventCalendar.find({
      startDate: { $gte: startDate, $lte: endDate },
      status: 'published'
    })
      .populate('organizer', 'name avatar')
      .limit(parseInt(limit))
      .sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    next(err);
  }
}

// Get event details by ID
async function getEventDetails(req, res, next) {
  try {
    const { id } = req.params;

    const event = await EventCalendar.findById(id)
      .populate('organizer', 'name avatar email')
      .populate('rsvps.alumni', 'name avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
}

// RSVP to an event
async function rsvpEvent(req, res, next) {
  try {
    const { eventId, numberOfGuests = 1 } = req.body;
    const userId = req.user._id;

    const event = await EventCalendar.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date() > event.rsvpDeadline) {
      return res.status(400).json({ message: 'RSVP deadline has passed' });
    }

    // Check if user already RSVPed
    const existingRsvp = event.rsvps.find(
      r => r.alumni.toString() === userId.toString()
    );

    if (existingRsvp) {
      return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }

    // Check capacity and add to waitlist if full
    const confirmedCount = event.rsvps.filter(r => r.status === 'confirmed').length;
    const status = confirmedCount >= event.capacity ? 'waitlist' : 'confirmed';

    if (status === 'waitlist') {
      const waitlistCount = event.rsvps.filter(r => r.status === 'waitlist').length;
      if (waitlistCount >= event.maxWaitlist) {
        return res.status(400).json({ message: 'Waitlist is full' });
      }
    }

    event.rsvps.push({
      alumni: userId,
      status,
      numberOfGuests,
      rsvpDate: new Date()
    });

    await event.save();

    await event.populate([
      { path: 'organizer', select: 'name avatar' },
      { path: 'rsvps.alumni', select: 'name avatar' }
    ]);

    res.status(201).json({
      message: status === 'confirmed' 
        ? 'Successfully RSVPed to event' 
        : 'Added to waitlist',
      event,
      status
    });
  } catch (err) {
    next(err);
  }
}

// Cancel RSVP
async function cancelRsvp(req, res, next) {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    const event = await EventCalendar.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const rsvpIndex = event.rsvps.findIndex(
      r => r.alumni.toString() === userId.toString()
    );

    if (rsvpIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    const cancelledRsvp = event.rsvps[rsvpIndex];
    event.rsvps.splice(rsvpIndex, 1);

    // If someone was removed from confirmed, move first person from waitlist to confirmed
    if (cancelledRsvp.status === 'confirmed') {
      const waitlistRsvp = event.rsvps.find(r => r.status === 'waitlist');
      if (waitlistRsvp) {
        waitlistRsvp.status = 'confirmed';
      }
    }

    await event.save();

    await event.populate([
      { path: 'organizer', select: 'name avatar' },
      { path: 'rsvps.alumni', select: 'name avatar' }
    ]);

    res.json({
      message: 'RSVP cancelled successfully',
      event
    });
  } catch (err) {
    next(err);
  }
}

// Get user's RSVPed events
async function getMyRsvps(req, res, next) {
  try {
    const userId = req.user._id;
    const { status = 'all' } = req.query;

    let filter = {
      'rsvps.alumni': userId
    };

    let events = await EventCalendar.find(filter)
      .populate('organizer', 'name avatar')
      .populate('rsvps.alumni', 'name avatar')
      .sort({ startDate: 1 });

    // If filtering by status, also filter the RSVPs
    if (status !== 'all') {
      events = events.map(event => {
        event.rsvps = event.rsvps.filter(
          r => r.alumni._id.toString() === userId.toString() && r.status === status
        );
        return event;
      }).filter(event => event.rsvps.length > 0);
    }

    res.json(events);
  } catch (err) {
    next(err);
  }
}

// Get event attendees (organizer only)
async function getEventAttendees(req, res, next) {
  try {
    const { eventId } = req.params;

    const event = await EventCalendar.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only organizer can view attendees' });
    }

    await event.populate('rsvps.alumni', 'name avatar email');

    const confirmed = event.rsvps.filter(r => r.status === 'confirmed');
    const waitlist = event.rsvps.filter(r => r.status === 'waitlist');

    res.json({
      confirmed,
      waitlist,
      confirmedCount: confirmed.length,
      waitlistCount: waitlist.length
    });
  } catch (err) {
    next(err);
  }
}

// Update event (organizer only)
async function updateEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      eventMode,
      location,
      virtualLink,
      capacity,
      rsvpDeadline,
      eventTags,
      status
    } = req.body;

    const event = await EventCalendar.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only organizer can update event' });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (eventMode) event.eventMode = eventMode;
    if (location) event.location = location;
    if (virtualLink) event.virtualLink = virtualLink;
    if (capacity) event.capacity = capacity;
    if (rsvpDeadline) event.rsvpDeadline = rsvpDeadline;
    if (eventTags) event.eventTags = eventTags;
    if (status) event.status = status;

    event.updatedAt = new Date();

    await event.save();

    await event.populate('organizer', 'name avatar');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (err) {
    next(err);
  }
}

// Delete event (organizer only)
async function deleteEvent(req, res, next) {
  try {
    const { eventId } = req.params;

    const event = await EventCalendar.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only organizer can delete event' });
    }

    await EventCalendar.findByIdAndDelete(eventId);

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
};
