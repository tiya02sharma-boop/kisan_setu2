const express = require('express');
const router = express.Router();
const multer = require('multer');
const WorkLog = require('../models/WorkLog');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const { contractId, gpsLat, gpsLng, notes } = req.body;
    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    const log = new WorkLog({
      contractRef: contractId,
      farmerRef: req.user.id,
      photoUrl,
      gpsLat,
      gpsLng,
      notes
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:contractId', protect, async (req, res) => {
  try {
    const logs = await WorkLog.find({ contractRef: req.params.contractId }).populate('farmerRef', 'name').sort('-timestamp');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
