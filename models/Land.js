const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  ownerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  size: { type: Number, required: true }, // in acres
  cropType: { type: String, required: true },
  status: { type: String, enum: ['available', 'contracted'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Land', landSchema);
