const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-passwordHash');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
