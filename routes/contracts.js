const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const { protect } = require('../middleware/authMiddleware');

// Get contracts for user
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'farmer' ? { farmerRef: req.user.id } : { landownerRef: req.user.id };
    const contracts = await Contract.find(query).populate('landownerRef', 'name phone').populate('farmerRef', 'name location').populate('landRef');
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create contract
router.post('/', protect, async (req, res) => {
  try {
    const newContract = new Contract({ ...req.body, landownerRef: req.user.id });
    await newContract.save();
    res.status(201).json(newContract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept contract request
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    contract.otpVerified = true;
    contract.contractStatus = 'active';
    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update contract status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { contractStatus } = req.body;
    const contract = await Contract.findByIdAndUpdate(req.params.id, { contractStatus }, { new: true });
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
