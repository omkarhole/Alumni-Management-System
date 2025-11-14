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
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    comment: '0= Unverified, 1= Verified'
  }
}, { _id: false });

// Sub-schema for student bio
const studentBioSchema=new mongoose.Schema({
  gender:{
    type:String,
    enum:['male', 'female', 'other'],
    required: true
  },
  enrollment_year:{
    type:Number,
    required:true
  },
  course:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Course',
    required:true
  },
  roll_number:{
    type:String,
    unique:true
  },
  //  avatar: {
  //   type: String,
  //   default: ''
  // }

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
    enum: ['admin', 'alumnus','student'],
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
userSchema.index({ email: 1 });
userSchema.index({ type: 1 });

module.exports = mongoose.model('User', userSchema);
