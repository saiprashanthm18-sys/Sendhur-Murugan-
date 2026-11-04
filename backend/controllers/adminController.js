const dbService = require('../services/dbService');

/**
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 * @query   status, date (YYYY-MM-DD)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const orders = await dbService.getAllOrders({
      status,
      limit: limit ? Number(limit) : 100
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    const order = await dbService.getOrderById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const updated = await dbService.updateOrderStatus(order.id, status, req.user?.name || 'Staff');

    // If order is cancelled, decrement slot booking
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const slotId = order.pickupSlot?.id || order.pickupSlot?._id;
      if (slotId) {
        await dbService.incrementSlotBookings(slotId, -1);
      }
    }

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} status updated to '${status}'`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await dbService.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/slots (also via /api/slots)
 * @access  Public
 */
const getPickupSlots = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const slots = await dbService.getPickupSlots(today);

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/admin/slots/reset
 * @access  Private/Admin
 */
const resetDailySlots = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await dbService.resetDailySlots(today);

    res.status(200).json({
      success: true,
      message: `Pickup slots reset for ${today}`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getStats,
  getPickupSlots,
  resetDailySlots,
};
