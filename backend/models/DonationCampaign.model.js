const mongoose = require('mongoose');

// DonationCampaign Schema - defines fundraising campaigns
const donationCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  detailedDescription: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['scholarship', 'infrastructure', 'event', 'research', 'sports', 'library', 'general', 'other'],
    required: true,
    index: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR'],
    default: 'USD'
  },
  image: {
    type: String,
    default: ''
  },
  image_public_id: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  beneficiary: {
    type: String,
    default: ''
  },
  donorCount: {
    type: Number,
    default: 0
  },
  usesPriceTiers: {
    type: Boolean,
    default: false
  },
  priceTiers: [{
    name: String,
    amount: Number,
    description: String,
    limit: Number,
    remaining: Number,
    icon: String
  }],
  allowAnonymous: {
    type: Boolean,
    default: true
  },
  displayDonors: {
    type: Boolean,
    default: true
  },
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  taxDeductible: {
    type: Boolean,
    default: true
  },
  taxId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate slug from title
donationCampaignSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Indexes
donationCampaignSchema.index({ status: 1, endDate: 1 });
donationCampaignSchema.index({ createdBy: 1 });
donationCampaignSchema.index({ category: 1 });
donationCampaignSchema.index({ featured: 1 });
donationCampaignSchema.index({ currentAmount: -1 });

module.exports = mongoose.model('DonationCampaign', donationCampaignSchema);
