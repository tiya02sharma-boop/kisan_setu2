const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  landownerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
  workScope: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalAmount: { type: Number, default: 0 },
  landownerShare: { type: Number },
  farmerShare: { type: Number },
  milestones: [{
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'released', 'disputed'], default: 'pending' }
  }],
  contractStatus: { type: String, enum: ['pending', 'active', 'completed', 'disputed'], default: 'pending' },
  otpVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
