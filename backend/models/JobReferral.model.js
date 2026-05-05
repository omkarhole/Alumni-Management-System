const mongoose = require('mongoose');

// JobReferral Schema for standalone referral opportunities
const jobReferralSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  referralBonus: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying and search
jobReferralSchema.index({ status: 1 });
jobReferralSchema.index({ 'postedBy': 1 });
jobReferralSchema.index({ deadline: 1 });
jobReferralSchema.index({ 'jobTitle': 'text', 'company': 'text', 'description': 'text' });

module.exports = mongoose.model('JobReferral', jobReferralSchema);

