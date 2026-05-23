const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  deadlineApproaching: {
    type: Boolean,
    default: false
  },
  statusChanges: {
    type: Boolean,
    default: false
  },
  betterRecommendations: {
    type: Boolean,
    default: false
  },
  deadlineWindowDays: {
    type: Number,
    default: 3,
    min: 1,
    max: 30
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);