const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  cover_img: {
    type: String,
    default: ''
  },
  about_content: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
