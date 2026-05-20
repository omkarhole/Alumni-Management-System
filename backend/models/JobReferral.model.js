const mongoose = require('mongoose');

const referralTimelineSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['posted', 'applied', 'accepted', 'rejected', 'filled', 'closed'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'accepted', 'rejected', 'filled', 'closed'],
    required: true
  },
  scope: {
    type: String,
    enum: ['referral', 'applicant'],
    default: 'referral'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actorName: {
    type: String,
    trim: true
  },
  actorType: {
    type: String,
    trim: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicantName: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    trim: true
  }
}, { _id: false });

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
  timeline: [referralTimelineSchema],
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

