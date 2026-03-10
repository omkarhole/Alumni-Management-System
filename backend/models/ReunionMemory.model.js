const mongoose = require('mongoose');

const reunionMemorySchema = new mongoose.Schema({
  reunion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reunion',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  year: {
    type: Number,
    default: function() {
      return new Date().getFullYear();
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
reunionMemorySchema.index({ reunion: 1 });
reunionMemorySchema.index({ user: 1 });
reunionMemorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReunionMemory', reunionMemorySchema);
