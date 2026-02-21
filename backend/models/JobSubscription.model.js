const mongoose = require('mongoose');

// Job Subscription Schema - stores user job notification preferences
const jobSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Skills user is interested in (for matching)
  preferredSkills: {
    type: [String],
    default: []
  },
  // Job types user is interested in
  preferredJobTypes: {
    type: [String],
    enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
    default: ['full-time', 'part-time']
  },
  // Experience levels user is interested in
  preferredExperienceLevels: {
    type: [String],
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: ['entry', 'mid', 'senior']
  },
  // Preferred locations
  preferredLocations: {
    type: [String],
    default: []
  },
  // Whether to receive email notifications
  emailNotifications: {
    type: Boolean,
    default: true
  },
  // Notification frequency (immediate, daily, weekly)
  notificationFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate'
  },
  // Last notification sent timestamp
  lastNotificationSent: {
    type: Date,
    default: null
  },
  // Whether subscription is active
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
jobSubscriptionSchema.index({ user: 1 });
jobSubscriptionSchema.index({ preferredSkills: 1 });
jobSubscriptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('JobSubscription', jobSubscriptionSchema);
