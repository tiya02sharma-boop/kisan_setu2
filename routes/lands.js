const express = require('express');
const router = express.Router();
const Land = require('../models/Land');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const lands = await Land.find().populate('ownerRef', 'name');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const land = new Land({ ...req.body, ownerRef: req.user.id });
    await land.save();
    res.status(201).json(land);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
