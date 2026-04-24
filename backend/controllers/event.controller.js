const {
    listEvents: listEventsService,
    addEvent: addEventService,
    updateEvent: updateEventService,
    deleteEvent: deleteEventService,
    participateEvent: participateEventService,
    checkParticipation: checkParticipationService,
    upcomingEvents: upcomingEventsService,
} = require('../services/eventService');

// all events details
async function listEvents(req, res, next) {
    try {
        const events = await listEventsService();
        res.json(events);
    } catch (err) {
        next(err);
    }
}

// add event
async function addEvent(req, res, next) {
    try {
        const event = await addEventService(req.body);
        res.status(201).json({ message: 'Created', event });
    } catch (err) {
        next(err);
    }
}

// update event
async function updateEvent(req, res, next) {
    try {
        const updated = await updateEventService(req.params.id, req.body);
        res.json({ message: 'Updated', event: updated });
    } catch (err) {
        next(err);
    }
}

// delete event
async function deleteEvent(req, res, next) {
    try {
        await deleteEventService(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
}

// participate event
async function participateEvent(req, res, next) {
    try {
        await participateEventService({ eventId: req.body.event_id, userId: req.body.user_id });
        res.json({ message: 'Participated' });
    } catch (err) {
        next(err);
    }
}

// check participation
async function checkParticipation(req, res, next) {
    try {
        const { participated } = await checkParticipationService({
            eventId: req.body.event_id,
            userId: req.body.user_id,
        });
        res.json({ participated: !!participated });
    } catch (err) {
        next(err);
    }
}

// upcomming events
async function upcomingEvents(req, res, next) {
    try {
        const events = await upcomingEventsService();
        res.json(events);
    } catch (err) {
        next(err);
    }
}

module.exports = { listEvents, addEvent, updateEvent, deleteEvent, participateEvent, checkParticipation, upcomingEvents };