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
  skills: {
    type: [String],
    default: [],
    description: 'Required skills for this job position'
  },
  job_type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
    default: 'full-time'
  },
  experience_level: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'mid'
  },
  salary_range: {
    type: String,
    default: ''
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
careerSchema.index({ skills: 1 });
careerSchema.index({ job_type: 1 });
careerSchema.index({ experience_level: 1 });

module.exports = mongoose.model('Career', careerSchema);
