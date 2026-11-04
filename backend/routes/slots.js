const express = require('express');
const router = express.Router();
const { getPickupSlots } = require('../controllers/adminController');

// Public: anyone can view today's pickup slots
router.get('/', getPickupSlots);

module.exports = router;
