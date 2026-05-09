const mongoose = require('mongoose');

const streamSessionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventCalendar',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['zoom', 'google_meet', 'custom'],
      default: 'custom',
      required: true,
    },
    meetingUrl: {
      type: String,
      default: '',
    },
    meetingPassword: {
      type: String,
      default: '',
    },
    streamKey: {
      // Optional key for embedding/RTMP workflows
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

streamSessionSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model('StreamSession', streamSessionSchema);

