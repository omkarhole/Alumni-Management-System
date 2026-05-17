const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Optional: link to a job/career posting if user analyzed against one
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      default: null,
    },

    // Overall fit score (0-100)
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    skillExplanations: {
      type: [
        {
          skill: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            enum: ['matched', 'missing'],
            required: true,
          },
          matchedType: {
            type: String,
            enum: ['exact', 'partial', 'none'],
            default: 'none',
          },
          matchedBecause: {
            type: [String],
            default: [],
          },
          source: {
            type: String,
            default: 'jobRequirements',
          },
        },
      ],
      default: [],
    },

    // Free-form recommendations (e.g. skills to develop, course suggestions)
    recommendations: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },

    // Store minimal job requirements snapshot used during analysis
    jobRequirements: {
      type: [String],
      default: [],
    },

    // Store extracted resume skills snapshot used during analysis
    resumeSkills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

