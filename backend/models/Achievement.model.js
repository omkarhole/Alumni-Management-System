const mongoose = require('mongoose');

// Achievement Schema definition
const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['promotion', 'job_change', 'certification', 'award'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ user: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ createdAt: -1 });
achievementSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
