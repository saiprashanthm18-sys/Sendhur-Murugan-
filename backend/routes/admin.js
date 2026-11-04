const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  getStats,
  resetDailySlots,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/stats', getStats);
router.post('/slots/reset', resetDailySlots);

module.exports = router;
