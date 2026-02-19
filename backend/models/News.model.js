const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['institutional', 'achievement', 'announcement'],
    default: 'announcement'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  banner: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
newsSchema.index({ category: 1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ isPublished: 1 });

module.exports = mongoose.model('News', newsSchema);
