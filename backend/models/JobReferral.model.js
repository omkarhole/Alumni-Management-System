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

const referralBonusPolicySchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  payoutOn: {
    type: String,
    enum: ['accepted', 'filled'],
    default: 'filled'
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  companyMultiplier: {
    type: Number,
    default: 1,
    min: 0
  },
  companyFlatBonus: {
    type: Number,
    default: 0,
    min: 0
  },
  deadlineReductionPerDayPercent: {
    type: Number,
    default: 0,
    min: 0
  },
  deadlineReductionCapPercent: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const referralBonusComputationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'eligible', 'not-eligible'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  },
  baseAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  multiplier: {
    type: Number,
    default: 1,
    min: 0
  },
  flatBonus: {
    type: Number,
    default: 0,
    min: 0
  },
  deadlinePenaltyPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  deadlinePenaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  payoutEvent: {
    type: String,
    enum: ['accepted', 'filled'],
    default: 'filled'
  },
  eligibleApplicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  eligibleApplicantName: {
    type: String,
    trim: true,
    default: ''
  },
  computedAt: {
    type: Date,
    default: null
  },
  computedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  policySnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const referralModerationStateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['visible', 'flagged', 'hidden', 'removed'],
    default: 'visible'
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
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
  bonusPolicy: {
    type: referralBonusPolicySchema,
    default: () => ({})
  },
  bonusComputation: {
    type: referralBonusComputationSchema,
    default: () => ({ status: 'pending', amount: 0, baseAmount: 0, multiplier: 1, flatBonus: 0, deadlinePenaltyPercent: 0, deadlinePenaltyAmount: 0, payoutEvent: 'filled', eligibleApplicantId: null, eligibleApplicantName: '', computedAt: null, computedBy: null, reason: '', policySnapshot: {} })
  },
  moderation: {
    type: referralModerationStateSchema,
    default: () => ({ status: 'visible', reason: '', moderatedBy: null, moderatedAt: null })
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
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    }
  }],
  timeline: [referralTimelineSchema],
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  filledAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
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
jobReferralSchema.index({ 'moderation.status': 1 });
jobReferralSchema.index({ 'postedBy': 1 });
jobReferralSchema.index({ deadline: 1 });
jobReferralSchema.index({ 'jobTitle': 'text', 'company': 'text', 'description': 'text' });

module.exports = mongoose.model('JobReferral', jobReferralSchema);

