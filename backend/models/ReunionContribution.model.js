const mongoose = require('mongoose');

const reunionContributionSchema = new mongoose.Schema({
  reunion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reunion',
    required: true
  },
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'bank_transfer', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
reunionContributionSchema.index({ reunion: 1 });
reunionContributionSchema.index({ contributor: 1 });
reunionContributionSchema.index({ status: 1 });

module.exports = mongoose.model('ReunionContribution', reunionContributionSchema);
