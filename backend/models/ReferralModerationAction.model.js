const mongoose = require('mongoose');

const referralModerationActionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobReferral',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: ['flag', 'hide', 'restore', 'suspend_poster'],
    required: true,
    index: true
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

referralModerationActionSchema.index({ referralId: 1, createdAt: -1 });

module.exports = mongoose.model('ReferralModerationAction', referralModerationActionSchema);