const mongoose = require('mongoose');

const mentorshipSessionSchema = new mongoose.Schema({
  mentorship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipMatch',
    required: true
  },
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
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  sessionType: {
    type: String,
    enum: ['career_guidance', 'mock_interview', 'resume_review', 'skill_development', 'networking', 'other'],
    default: 'career_guidance'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  meetingLocation: {
    type: String,
    default: ''
  },
  isVirtual: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  menteeNotes: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  mentorNotes: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  actionItems: [{
    description: {
      type: String,
      maxlength: 500
    },
    completed: {
      type: Boolean,
      default: false
    },
    assignedTo: {
      type: String,
      enum: ['mentor', 'mentee', 'both']
    }
  }],
  reminderSent: {
    type: Boolean,
    default: false
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
mentorshipSessionSchema.index({ mentorship: 1 });
mentorshipSessionSchema.index({ mentor: 1, scheduledDate: 1 });
mentorshipSessionSchema.index({ mentee: 1, scheduledDate: 1 });
mentorshipSessionSchema.index({ status: 1 });

module.exports = mongoose.model('MentorshipSession', mentorshipSessionSchema);
