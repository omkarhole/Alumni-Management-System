const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image_path: {
    type: String,
    required: true
  },
  about: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
gallerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
