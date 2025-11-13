const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const forumTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [forumCommentSchema]
}, {
  timestamps: true
});

// Indexes
forumTopicSchema.index({ user: 1 });
forumTopicSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
