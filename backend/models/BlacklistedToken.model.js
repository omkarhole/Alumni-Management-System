const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);