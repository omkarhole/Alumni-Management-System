const mongoose = require('mongoose');

// Service sub-schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: String,
    default: ''
  }
}, { _id: false });

// Alumni discount sub-schema
const alumniDiscountSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  discountCode: {
    type: String,
    default: ''
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  terms: {
    type: String,
    default: ''
  },
  validUntil: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Business profile schema
const businessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  tagline: {
    type: String,
    maxlength: 200,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technology',
      'consulting',
      'finance',
      'marketing',
      'healthcare',
      'education',
      'retail',
      'food',
      'real_estate',
      'legal',
      'manufacturing',
      'hospitality',
      'creative',
      'freelance',
      'other'
    ]
  },
  subCategory: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  logoPublicId: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  coverImagePublicId: {
    type: String,
    default: ''
  },
  location: {
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  contact: {
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    linkedIn: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    }
  },
  services: {
    type: [serviceSchema],
    default: []
  },
  alumniDiscount: alumniDiscountSchema,
  hasAlumniDiscount: {
    type: Boolean,
    default: false
  },
  yearEstablished: {
    type: Number,
    default: null
  },
  teamSize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+', ''],
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
businessSchema.index({ businessName: 'text', description: 'text', tagline: 'text' });
businessSchema.index({ category: 1 });
businessSchema.index({ 'location.city': 1 });
businessSchema.index({ 'location.country': 1 });
businessSchema.index({ user: 1 });
businessSchema.index({ isActive: 1 });
businessSchema.index({ isFeatured: 1 });
businessSchema.index({ rating: -1 });
businessSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Business', businessSchema);
