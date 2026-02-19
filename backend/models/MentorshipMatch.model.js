const mongoose = require('mongoose');

const mentorshipMatchSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    maxlength: 500,
    default: ''
  },
  responseMessage: {
    type: String,
    maxlength: 500,
    default: ''
  },
  goals: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  menteeFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    submittedAt: {
      type: Date
    }
  },
  mentorFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    submittedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
mentorshipMatchSchema.index({ mentor: 1, status: 1 });
mentorshipMatchSchema.index({ mentee: 1, status: 1 });
mentorshipMatchSchema.index({ mentor: 1, mentee: 1 }, { unique: true });

module.exports = mongoose.model('MentorshipMatch', mentorshipMatchSchema);
