const mongoose = require('mongoose');

// Track lesson completion
const completedLessonSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Track module completion
const completedModuleSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Quiz attempt tracking
const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    userAnswer: String,
    isCorrect: Boolean
  }],
  attemptDate: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [completedLessonSchema],
  completedModules: [completedModuleSchema],
  quizAttempts: [quizAttemptSchema],
  currentLessonIndex: {
    type: Number,
    default: 0
  },
  currentModuleIndex: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date,
    default: null
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedDate: {
    type: Date,
    default: null
  },
  certificateUrl: {
    type: String,
    default: ''
  },
  certificateId: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  review: {
    type: String,
    default: ''
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for common queries
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, isCompleted: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ enrollmentDate: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
