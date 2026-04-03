const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  contractRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['released', 'pending', 'failed'], default: 'released' },
  releasedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
