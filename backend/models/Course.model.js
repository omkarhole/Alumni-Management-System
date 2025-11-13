const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course: {
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

module.exports = mongoose.model('Course', courseSchema);
