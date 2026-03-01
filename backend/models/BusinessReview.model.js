const mongoose = require('mongoose');

const businessReviewSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 200,
    default: ''
  },
  comment: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    default: ''
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from same user for same business
businessReviewSchema.index({ business: 1, user: 1 }, { unique: true });
businessReviewSchema.index({ business: 1 });
businessReviewSchema.index({ createdAt: -1 });
businessReviewSchema.index({ rating: -1 });

module.exports = mongoose.model('BusinessReview', businessReviewSchema);
