const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlist', 'cancelled'],
    default: 'confirmed'
  },
  rsvpDate: {
    type: Date,
    default: Date.now
  },
  numberOfGuests: {
    type: Number,
    default: 1
  }
}, { _id: false });

const eventCalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['workshop', 'reunion', 'networking', 'webinar', 'social'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  eventMode: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  virtualLink: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    required: true
  },
  rsvpDeadline: {
    type: Date,
    required: true
  },
  eventTags: {
    type: [String],
    default: []
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: null
  },
  recurrenceEndDate: {
    type: Date,
    default: null
  },
  banner: {
    type: String,
    default: ''
  },
  banner_public_id: {
    type: String,
    default: ''
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rsvps: [rsvpSchema],
  maxWaitlist: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
eventCalendarSchema.index({ startDate: 1 });
eventCalendarSchema.index({ eventType: 1 });
eventCalendarSchema.index({ tags: 1 });
eventCalendarSchema.index({ organizer: 1 });
eventCalendarSchema.index({ 'rsvps.alumni': 1 });
eventCalendarSchema.index({ rsvpDeadline: 1 });

// Virtual fields
eventCalendarSchema.virtual('confirmedCount').get(function() {
  return this.rsvps.filter(r => r.status === 'confirmed').length;
});

eventCalendarSchema.virtual('waitlistCount').get(function() {
  return this.rsvps.filter(r => r.status === 'waitlist').length;
});

eventCalendarSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.confirmedCount;
});

eventCalendarSchema.virtual('isFull').get(function() {
  return this.confirmedCount >= this.capacity;
});

eventCalendarSchema.virtual('isRsvpDeadlinePassed').get(function() {
  return new Date() > this.rsvpDeadline;
});

module.exports = mongoose.model('EventCalendar', eventCalendarSchema);
