const mongoose = require('mongoose');

// Job Interaction Schema - tracks user interactions with job recommendations
// This data is used to improve recommendation algorithms
const jobInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
    required: true
  },
  // Type of interaction
  interactionType: {
    type: String,
    enum: ['view', 'save', 'dismiss', 'apply', 'click', 'share', 'not_interested'],
    required: true
  },
  // Relevance score given by user (1-5)
  relevanceScore: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  // Whether user found the recommendation useful
  isRelevant: {
    type: Boolean,
    default: null
  },
  // Additional feedback from user
  feedback: {
    type: String,
    default: ''
  },
  // Match score at the time of recommendation
  matchScore: {
    type: Number,
    default: 0
  },
  // Time spent viewing job details (in seconds)
  viewDuration: {
    type: Number,
    default: 0
  },
  // Device info for analytics
  deviceInfo: {
    type: String,
    default: ''
  },
  // Source of recommendation (dashboard, email, notification)
  source: {
    type: String,
    enum: ['dashboard', 'email', 'notification', 'search', 'direct'],
    default: 'dashboard'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
jobInteractionSchema.index({ user: 1, job: 1 }, { unique: true });
jobInteractionSchema.index({ user: 1, interactionType: 1 });
jobInteractionSchema.index({ job: 1 });
jobInteractionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobInteraction', jobInteractionSchema);
