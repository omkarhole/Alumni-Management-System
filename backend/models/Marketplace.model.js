const mongoose = require('mongoose');

const marketplaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Jobs', 'Services', 'Items', 'Space', 'Networking'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      default: 0
    },
    priceType: {
      type: String,
      enum: ['Fixed', 'Negotiable', 'Free'],
      default: 'Fixed'
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    images: {
      type: [String],
      default: []
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Sold', 'Archived'],
      default: 'Active'
    },
    location: {
      type: String,
      default: ''
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    views: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    featured: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Create text index for search functionality
marketplaceSchema.index({ title: 'text', description: 'text', tags: 'text' });
marketplaceSchema.index({ category: 1, status: 1 });
marketplaceSchema.index({ user: 1 });
marketplaceSchema.index({ createdAt: -1 });
marketplaceSchema.index({ featured: -1, views: -1 });

// Middleware to increment views
marketplaceSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save();
};

// Middleware to toggle like
marketplaceSchema.methods.toggleLike = async function (userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

module.exports = mongoose.model('Marketplace', marketplaceSchema);
