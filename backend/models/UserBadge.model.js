const mongoose = require('mongoose');

// UserBadge Schema - tracks which badges users have earned
const userBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  // Track the activity that earned this badge
  source: {
    type: {
      type: String,
      enum: ['achievement', 'mentorship', 'event', 'donation', 'referral', 'job', 'manual'],
      default: 'manual'
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only have each badge once
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

// Indexes for queries
userBadgeSchema.index({ user: 1 });
userBadgeSchema.index({ badge: 1 });
userBadgeSchema.index({ earnedAt: -1 });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
