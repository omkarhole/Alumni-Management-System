const mongoose = require('mongoose');

// Endorsement Schema definition
const endorsementSchema = new mongoose.Schema({
  endorser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endorsee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate endorsements
// A user can only endorse another user once for the same skill
endorsementSchema.index({ endorser: 1, endorsee: 1, skill: 1 }, { unique: true });

// Indexes for efficient querying
endorsementSchema.index({ endorsee: 1 });
endorsementSchema.index({ endorser: 1 });
endorsementSchema.index({ skill: 1 });

module.exports = mongoose.model('Endorsement', endorsementSchema);
