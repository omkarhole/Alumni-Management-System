const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  job_title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
careerSchema.index({ user: 1 });
careerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Career', careerSchema);
