const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['coordinator', 'treasurer', 'member'],
    default: 'member'
  }
}, { _id: true });

const reunionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  batch: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  eventDate: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  virtualOption: {
    enabled: {
      type: Boolean,
      default: false
    },
    meetingLink: {
      type: String,
      default: ''
    }
  },
  organizers: [organizerSchema],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  budget: {
    total: {
      type: Number,
      default: 0
    },
    collected: {
      type: Number,
      default: 0
    }
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  banner: {
    type: String,
    default: ''
  },
  banner_public_id: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
reunionSchema.index({ batch: 1 });
reunionSchema.index({ eventDate: 1 });
reunionSchema.index({ status: 1 });
reunionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reunion', reunionSchema);
