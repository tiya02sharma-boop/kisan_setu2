const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
  contractRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  farmerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photoUrl: { type: String },
  gpsLat: { type: Number, required: true },
  gpsLng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', workLogSchema);
