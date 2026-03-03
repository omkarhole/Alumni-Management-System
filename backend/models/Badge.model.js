const mongoose = require('mongoose');

// Badge Schema - defines all available badges in the system
const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#6c757d' // default gray color
  },
  category: {
    type: String,
    enum: ['verification', 'career', 'mentorship', 'community', 'donation', 'events'],
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  criteria: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
badgeSchema.index({ category: 1 });
badgeSchema.index({ isActive: 1 });
badgeSchema.index({ points: -1 });

module.exports = mongoose.model('Badge', badgeSchema);
