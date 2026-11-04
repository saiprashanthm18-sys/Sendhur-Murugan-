const Order = require('../models/Order');
const PickupSlot = require('../models/PickupSlot');
const MenuItem = require('../models/MenuItem');

/**
 * @route   POST /api/orders
 * @access  Private (student)
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, pickupSlotId, pickupSlot, specialInstructions } = req.body;
    const resolvedSlotId = pickupSlotId || pickupSlot;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Order must contain at least one item');
    }
    if (!resolvedSlotId) {
      res.status(400);
      throw new Error('Pickup slot is required');
    }

    // Validate pickup slot
    const slot = await PickupSlot.findById(resolvedSlotId);
    if (!slot || !slot.isActive) {
      res.status(400);
      throw new Error('Invalid or inactive pickup slot');
    }
    if (slot.currentBookings >= slot.maxCapacity) {
      res.status(400);
      throw new Error('Selected pickup slot is full. Please choose another slot.');
    }

    // Validate each item and build order items array
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const resolvedMenuItemId = item.menuItemId || item.menuItem || item._id;
      if (!resolvedMenuItemId || !item.quantity || item.quantity < 1) {
        res.status(400);
        throw new Error('Each item must have a valid menuItemId and quantity');
      }

      const menuItem = await MenuItem.findById(resolvedMenuItemId);
      if (!menuItem || menuItem.isHidden) {
        res.status(400);
        throw new Error(`Menu item not found: ${resolvedMenuItemId}`);
      }
      if (!menuItem.isAvailable) {
        res.status(400);
        throw new Error(`Menu item '${menuItem.name}' is currently not available`);
      }

      const lineTotal = menuItem.price * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    // Create order
    const order = await Order.create({
      student: req.user._id,
      items: orderItems,
      pickupSlot: slot._id,
      pickupTime: slot.time,
      totalAmount,
      specialInstructions: specialInstructions || '',
      statusHistory: [
        { status: 'pending', timestamp: new Date(), updatedBy: req.user._id },
      ],
    });

    // Increment slot bookings
    slot.currentBookings += 1;
    await slot.save();

    // Populate and return
    const populated = await Order.findById(order._id)
      .populate('student', 'name email studentId')
      .populate('pickupSlot')
      .populate('items.menuItem', 'name price image');

    res.status(201).json({
      success: true,
      message: `Order #${order.orderNumber} placed successfully`,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders/my
 * @access  Private (student)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('pickupSlot')
      .populate('items.menuItem', 'name price image')
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
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('pickupSlot')
      .populate('items.menuItem', 'name price image')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Students can only view their own orders; admins can view all
    if (
      req.user.role !== 'admin' &&
      order.student._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (student — own orders only)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.student.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (order.status !== 'pending') {
      res.status(400);
      throw new Error(`Cannot cancel order with status '${order.status}'. Only pending orders can be cancelled.`);
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: req.user._id,
    });
    await order.save();

    // Decrement slot bookings
    await PickupSlot.findByIdAndUpdate(order.pickupSlot, {
      $inc: { currentBookings: -1 },
    });

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} cancelled successfully`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
