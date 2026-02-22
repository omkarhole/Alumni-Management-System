const mongoose = require('mongoose');

// JobReferral Schema definition
const jobReferralSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
    required: true
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  candidatePhone: {
    type: String,
    default: ''
  },
  candidateResume: {
    type: String,
    default: ''
  },
  candidateLinkedIn: {
    type: String,
    default: ''
  },
  candidateExperience: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  outcome: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
jobReferralSchema.index({ job: 1 });
jobReferralSchema.index({ referrer: 1 });
jobReferralSchema.index({ status: 1 });
jobReferralSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobReferral', jobReferralSchema);
