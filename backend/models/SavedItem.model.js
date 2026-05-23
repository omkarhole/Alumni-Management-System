const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['career', 'referral'],
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entitySnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  savedScore: {
    type: Number,
    default: null
  },
  lastKnownStatus: {
    type: String,
    default: ''
  },
  lastKnownDeadlineAt: {
    type: Date,
    default: null
  },
  lastDeadlineReminderFor: {
    type: Date,
    default: null
  },
  lastRecommendationEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  lastRecommendationScore: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

savedItemSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: true });
savedItemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedItem', savedItemSchema);