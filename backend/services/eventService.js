const { Event } = require('../models/Index');
const { createCrudService, stripIdFields } = require('./baseService');

const eventCrud = createCrudService({
  model: Event,
  resourceName: 'Event',
  defaultPopulate: { path: 'commits.user', select: 'name' },
  defaultSort: { schedule: -1 },
});

const listEvents = async () => eventCrud.list();

const addEvent = async (payload) => eventCrud.create(payload);

const updateEvent = async (id, payload) => eventCrud.update(id, stripIdFields(payload));

const deleteEvent = async (id) => eventCrud.remove(id);

const participateEvent = async ({ eventId, userId }) => {
  const event = await eventCrud.findById(eventId);

  event.commits.push({ user: userId });
  await event.save();

  return event;
};

const checkParticipation = async ({ eventId, userId }) => {
  const event = await eventCrud.findById(eventId);

  return {
    participated: event.commits.some((commit) => commit.user.toString() === userId),
  };
};

const upcomingEvents = async () => {
  return eventCrud.list({
    filter: {
      schedule: { $gte: new Date() },
    },
    sort: { schedule: 1 },
  });
};

module.exports = {
  listEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  participateEvent,
  checkParticipation,
  upcomingEvents,
  eventCrud,
};