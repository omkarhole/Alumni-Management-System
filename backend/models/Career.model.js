const mongoose = require('mongoose');


// Career Schema definition
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
  },
  // Applicants sub-schema to track students who applied for the career opportunity
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
careerSchema.index({ user: 1 });
careerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Career', careerSchema);
