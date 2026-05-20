const mongoose = require('mongoose');

const referralMessageSchema = new mongoose.Schema({
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobReferral',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4000
  }
}, {
  timestamps: true
});

referralMessageSchema.index({ referralId: 1, createdAt: 1 });
referralMessageSchema.index({ referralId: 1, sender: 1, createdAt: 1 });
referralMessageSchema.index({ referralId: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model('ReferralMessage', referralMessageSchema);