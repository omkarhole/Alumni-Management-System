const mongoose = require('mongoose');

// Donation Schema - tracks individual donations
const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationCampaign',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR'],
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'check', 'other'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    default: '',
    sparse: true
  },
  stripeChargeId: {
    type: String,
    default: '',
    sparse: true
  },
  paypalTransactionId: {
    type: String,
    default: '',
    sparse: true
  },
  donorEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  donorName: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '',
    maxlength: 500
  },
  // Receipt tracking
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String,
    default: ''
  },
  taxReceiptId: {
    type: String,
    default: ''
  },
  // Recognition
  displayName: {
    type: String,
    default: ''
  },
  recognitionLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'none'],
    default: 'none'
  },
  awardedBadges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  // Recurrence
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    default: null
  },
  recurringEndDate: {
    type: Date,
    default: null
  },
  lastRecurringDonation: {
    type: Date,
    default: null
  },
  nextRecurringDonation: {
    type: Date,
    default: null
  },
  // Tracking
  donatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String // website, mobile_app, email, event, etc.
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
donationSchema.index({ donor: 1, donatedAt: -1 });
donationSchema.index({ campaign: 1, paymentStatus: 1 });
donationSchema.index({ paymentStatus: 1, completedAt: -1 });
donationSchema.index({ donorEmail: 1 });
donationSchema.index({ isRecurring: 1, nextRecurringDonation: 1 });

module.exports = mongoose.model('Donation', donationSchema);
