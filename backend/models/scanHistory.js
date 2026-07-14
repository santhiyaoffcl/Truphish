const mongoose = require('mongoose');

const ScanHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['url', 'text'],
    required: true
  },
  risk_score: {
    type: Number,
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  explanations: {
    type: [String],
    default: []
  },
  source: {
    type: String,
    enum: ['web', 'extension'],
    default: 'web'
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  latency_ms: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
