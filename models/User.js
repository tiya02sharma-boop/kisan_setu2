const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['landowner', 'farmer', 'worker'], required: true },
  passwordHash: { type: String, required: true },
  trustScore: { type: Number, default: 0 },
  location: { type: String },
  skills: { type: [String] },
  experience: { type: String },
  profilePic: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
