const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
}, { _id: false });

const mentorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  expertise: {
    type: [String],
    default: []
  },
  industries: {
    type: [String],
    default: []
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  currentPosition: {
    type: String,
    default: ''
  },
  currentCompany: {
    type: String,
    default: ''
  },
  availability: {
    type: [availabilitySlotSchema],
    default: []
  },
  maxMentees: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  currentMentees: {
    type: Number,
    default: 0,
    min: 0
  },
  preferredMenteeLevel: {
    type: String,
    enum: ['student', 'alumnus', 'both'],
    default: 'both'
  },
  sessionTypes: {
    type: [String],
    enum: ['career_guidance', 'mock_interview', 'resume_review', 'skill_development', 'networking', 'other'],
    default: ['career_guidance']
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
  linkedInUrl: {
    type: String,
    default: ''
  },
  achievements: {
    type: String,
    default: '',
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
mentorProfileSchema.index({ user: 1 });
mentorProfileSchema.index({ isActive: 1 });
mentorProfileSchema.index({ expertise: 1 });
mentorProfileSchema.index({ industries: 1 });

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
