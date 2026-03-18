const mongoose = require('mongoose');

const analysisSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    analysisDate: {
      type: Date,
      required: true,
      index: true,
    },
    diversificationScore: {
      type: Number,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
    },
    portfolioHealth: {
      type: Number,
      required: true,
    },
    marketCapMix: {
      type: Object,
      required: true,
      default: {},
    },
    recommendations: {
      type: [String],
      required: true,
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

analysisSnapshotSchema.index({ user: 1, analysisDate: 1 }, { unique: true });

module.exports = mongoose.model('AnalysisSnapshot', analysisSnapshotSchema);
