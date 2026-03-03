const mongoose = require('mongoose');

// VerificationRequest Schema - tracks alumni verification requests
const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Credentials being verified
  credentials: {
    degree: {
      type: String,
      default: ''
    },
    batch: {
      type: Number,
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    graduationYear: {
      type: Number,
      required: true
    },
    rollNumber: {
      type: String,
      default: ''
    }
  },
  // Document uploads (URLs to stored files)
  documents: [{
    type: {
      type: String,
      enum: ['degree_certificate', 'id_card', 'transcript', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Status of the verification request
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  // Admin review details
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
verificationRequestSchema.index({ user: 1 });
verificationRequestSchema.index({ status: 1 });
verificationRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
