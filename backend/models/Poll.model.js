const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    options: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        text: {
          type: String,
          required: true
        },
        votes: {
          type: Number,
          default: 0
        }
      }
    ],
    // Vote tracking: maps user ID to selected option ID
    votes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        optionId: {
          type: mongoose.Schema.Types.ObjectId
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    anonymous: {
      type: Boolean,
      default: true
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    category: {
      type: String,
      enum: ['Feedback', 'Event', 'Decision', 'Interest', 'General'],
      default: 'General'
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    visibility: {
      type: String,
      enum: ['Public', 'Alumni Only', 'Admin Only'],
      default: 'Public'
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
pollSchema.index({ createdBy: 1 });
pollSchema.index({ status: 1, expiresAt: 1 });
pollSchema.index({ category: 1 });
pollSchema.index({ createdAt: -1 });
pollSchema.index({ 'votes.userId': 1 });

// Auto-close expired polls middleware
pollSchema.methods.checkAndClosePoll = async function () {
  if (this.status === 'Active' && new Date() > this.expiresAt) {
    this.status = 'Closed';
    await this.save();
  }
  return this;
};

// Vote on a poll
pollSchema.methods.vote = async function (userId, optionId, allowMultiple = false) {
  // Check if user already voted
  const existingVote = this.votes.find(v => v.userId.toString() === userId.toString());

  if (existingVote && !allowMultiple) {
    throw new Error('User has already voted on this poll');
  }

  // Check if option exists
  const option = this.options.find(o => o._id.toString() === optionId.toString());
  if (!option) {
    throw new Error('Invalid option');
  }

  if (existingVote) {
    // Update existing vote
    const oldOption = this.options.find(o => o._id.toString() === existingVote.optionId.toString());
    if (oldOption) oldOption.votes -= 1;
    existingVote.optionId = optionId;
    existingVote.votedAt = new Date();
  } else {
    // Record new vote
    this.votes.push({
      userId,
      optionId,
      votedAt: new Date()
    });
  }

  option.votes += 1;
  this.totalVotes = this.votes.length;

  return this.save();
};

// Get vote statistics
pollSchema.methods.getStats = function () {
  return {
    question: this.question,
    totalVotes: this.totalVotes,
    options: this.options.map(opt => ({
      _id: opt._id,
      text: opt.text,
      votes: opt.votes,
      percentage: this.totalVotes > 0 ? ((opt.votes / this.totalVotes) * 100).toFixed(2) : 0
    })),
    status: this.status,
    expiresAt: this.expiresAt,
    createdAt: this.createdAt
  };
};

// Get user's vote on this poll
pollSchema.methods.getUserVote = function (userId) {
  const vote = this.votes.find(v => v.userId.toString() === userId.toString());
  return vote ? vote.optionId : null;
};

module.exports = mongoose.model('Poll', pollSchema);
