const mongoose = require('mongoose');

// JobPreference Schema - stores user preferences for job recommendations
const jobPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Preferred skills for job matching
  preferredSkills: {
    type: [String],
    default: []
  },
  // Preferred job types
  preferredJobTypes: {
    type: [String],
    enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
    default: ['full-time', 'part-time']
  },
  // Preferred locations
  preferredLocations: {
    type: [String],
    default: []
  },
  // Preferred experience levels
  preferredExperienceLevels: {
    type: [String],
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: ['entry', 'mid', 'senior']
  },
  // Willing to relocate
  willingToRelocate: {
    type: Boolean,
    default: false
  },
  // Remote preference: 'yes', 'no', 'both'
  remotePreference: {
    type: String,
    enum: ['yes', 'no', 'both'],
    default: 'both'
  },
  // Email notifications enabled
  emailNotifications: {
    type: Boolean,
    default: true
  },
  // When to send notifications: 'immediate', 'daily', 'weekly'
  notificationFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate'
  },
  // Last time recommendations were fetched
  lastFetchedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
jobPreferenceSchema.index({ user: 1 });

module.exports = mongoose.model('JobPreference', jobPreferenceSchema);
