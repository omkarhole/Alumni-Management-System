const mongoose = require('mongoose');

const mentorshipMessageSchema = new mongoose.Schema({
  mentorship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipMatch',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipMessage',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
mentorshipMessageSchema.index({ mentorship: 1, createdAt: -1 });
mentorshipMessageSchema.index({ sender: 1 });
mentorshipMessageSchema.index({ receiver: 1, isRead: 1 });
mentorshipMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MentorshipMessage', mentorshipMessageSchema);
