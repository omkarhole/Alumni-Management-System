const mongoose = require('mongoose');

const eventCommitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  schedule: {
    type: Date,
    required: true
  },
  banner: {
    type: String,
    default: ''
  },
  commits: [eventCommitSchema]
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ schedule: 1 });
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);
