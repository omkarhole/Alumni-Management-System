const mongoose = require('mongoose');


// Sub-schema for alumnus bio
const alumnusBioSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
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
  connected_to: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  avatar_public_id: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    comment: '0= Unverified, 1= Verified'
  },
  skills: {
    type: [String],
    default: []
  },
  // Advanced directory fields
  location: {
    type: String,
    default: '',
    trim: true,
    index: true,
    description: 'Current location (city, country)'
  },
  company: {
    type: String,
    default: '',
    trim: true,
    index: true,
    description: 'Current company name'
  },
  job_title: {
    type: String,
    default: '',
    trim: true,
    description: 'Current job title'
  },
  industry: {
    type: String,
    default: '',
    trim: true,
    index: true,
    description: 'Industry sector'
  },
  interests: {
    type: [String],
    default: [],
    description: 'Areas of interest for networking'
  },
  endorsementCount: {
    type: Number,
    default: 0,
    description: 'Denormalized count of endorsements received'
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500,
    description: 'Brief professional bio'
  },
  isSearchable: {
    type: Boolean,
    default: true,
    description: 'Whether profile appears in directory searches'
  }
}, { _id: false });

// Sub-schema for student bio
const studentBioSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  enrollment_year: {
    type: Number,
    required: true
  },
  current_year: {
    type: Number,
    min: 1,
    max: 6
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  roll_number: {
    type: String,
    trim: true,
    default: undefined
  },
  avatar: {
    type: String,
    default: ''
  },
  avatar_public_id: {
    type: String,
    default: ''
  }

})

// Main User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['admin', 'alumnus', 'student'],
    default: 'alumnus'
  },
  auto_generated_pass: {
    type: String,
    default: ''
  },
  alumnus_bio: alumnusBioSchema,
  // added student bio schema
  student_bio: studentBioSchema
}, {
  timestamps: true
});

// Indexes
userSchema.index({ type: 1 });
userSchema.index(
  { 'student_bio.roll_number': 1 },
  {
    unique: true,
    partialFilterExpression: {
      'student_bio.roll_number': { $exists: true, $type: 'string' }
    }
  }
);

// Advanced directory search indexes
userSchema.index({ 'alumnus_bio.location': 1 });
userSchema.index({ 'alumnus_bio.company': 1 });
userSchema.index({ 'alumnus_bio.industry': 1 });
userSchema.index({ 'alumnus_bio.batch': 1 });
userSchema.index({ 'alumnus_bio.skills': 1 });
userSchema.index({ 'alumnus_bio.endorsementCount': -1 });
userSchema.index({ 'alumnus_bio.isSearchable': 1 });

// Full-text search index for name, email, bio, location, company, job_title
userSchema.index({
  name: 'text',
  email: 'text',
  'alumnus_bio.bio': 'text',
  'alumnus_bio.location': 'text',
  'alumnus_bio.company': 'text',
  'alumnus_bio.job_title': 'text',
  'alumnus_bio.interests': 'text'
});

module.exports = mongoose.model('User', userSchema);
