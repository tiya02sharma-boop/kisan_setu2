const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const { protect } = require('../middleware/authMiddleware');

router.post('/release', protect, async (req, res) => {
  try {
    const { contractId, milestoneId, amount } = req.body;
    const payment = new Payment({ contractRef: contractId, milestoneId, amount });
    await payment.save();
    
    await Contract.updateOne(
      { _id: contractId, "milestones._id": milestoneId },
      { $set: { "milestones.$.status": 'released' } }
    );
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
