const Order = require('../models/Order');
const PickupSlot = require('../models/PickupSlot');

/**
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 * @query   status, date (YYYY-MM-DD)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (date) {
      // Filter by createdAt date
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate('student', 'name email studentId')
      .populate('pickupSlot')
      .populate('items.menuItem', 'name price image')
      .populate('statusHistory.updatedBy', 'name role')
      .sort({ createdAt: -1 });

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

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const previousStatus = order.status;
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });

    await order.save();

    // If admin cancels, decrement slot
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await PickupSlot.findByIdAndUpdate(order.pickupSlot, {
        $inc: { currentBookings: -1 },
      });
    }

    const populated = await Order.findById(order._id)
      .populate('student', 'name email studentId')
      .populate('pickupSlot')
      .populate('items.menuItem', 'name price image')
      .populate('statusHistory.updatedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} status updated to '${status}'`,
      data: populated,
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
    const [total, pending, accepted, preparing, ready, completed, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'accepted' }),
      Order.countDocuments({ status: 'preparing' }),
      Order.countDocuments({ status: 'ready' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'cancelled' }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, accepted, preparing, ready, completed, cancelled },
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
    const slots = await PickupSlot.find({ date: today, isActive: true }).sort({ time: 1 });

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
    const result = await PickupSlot.updateMany(
      { date: today },
      { $set: { currentBookings: 0 } }
    );

    res.status(200).json({
      success: true,
      message: `Reset ${result.modifiedCount} slot(s) for ${today}`,
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
