const dbService = require('../services/dbService');

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
    const slot = await dbService.getPickupSlotById(resolvedSlotId);
    if (!slot || !slot.isActive) {
      res.status(400);
      throw new Error('Invalid or inactive pickup slot');
    }
    if (slot.currentBookings >= slot.maxCapacity) {
      res.status(400);
      throw new Error('Selected pickup slot is full. Please choose another slot.');
    }

    // Validate each item and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const resolvedMenuItemId = item.menuItemId || item.menuItem || item._id || item.id;
      if (!resolvedMenuItemId || !item.quantity || item.quantity < 1) {
        res.status(400);
        throw new Error('Each item must have a valid menuItemId and quantity');
      }

      const menuItem = await dbService.getMenuItemById(resolvedMenuItemId);
      if (!menuItem || menuItem.isHidden) {
        res.status(400);
        throw new Error(`Menu item not found: ${resolvedMenuItemId}`);
      }
      if (!menuItem.isAvailable) {
        res.status(400);
        throw new Error(`Menu item '${menuItem.name}' is currently not available`);
      }

      const lineTotal = Number(menuItem.price) * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        menuItem: { id: menuItem.id, _id: menuItem.id, name: menuItem.name, price: menuItem.price, image: menuItem.image },
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    // Create order in Supabase
    const order = await dbService.createOrder({
      student: {
        id: req.user.id || req.user._id,
        _id: req.user.id || req.user._id,
        name: req.user.name,
        email: req.user.email,
        studentId: req.user.studentId || ''
      },
      items: orderItems,
      pickupSlot: { id: slot.id, _id: slot.id, time: slot.time },
      pickupTime: slot.time,
      totalAmount,
      specialInstructions: specialInstructions || ''
    });

    // Increment slot bookings
    await dbService.incrementSlotBookings(slot.id, 1);

    res.status(201).json({
      success: true,
      message: `Order #${order.orderNumber} placed successfully`,
      data: order,
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
    const studentId = req.user.id || req.user._id;
    const orders = await dbService.getOrdersByStudent(studentId);

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
    const order = await dbService.getOrderById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const currentUserId = req.user.id || req.user._id;
    const orderStudentId = order.student?.id || order.student?._id;

    if (req.user.role !== 'admin' && orderStudentId !== currentUserId) {
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
    const order = await dbService.getOrderById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const currentUserId = req.user.id || req.user._id;
    const orderStudentId = order.student?.id || order.student?._id;

    if (orderStudentId !== currentUserId) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (order.status !== 'pending') {
      res.status(400);
      throw new Error(`Cannot cancel order with status '${order.status}'. Only pending orders can be cancelled.`);
    }

    const updated = await dbService.updateOrderStatus(order.id, 'cancelled', req.user.name || 'Student');

    // Decrement slot booking if slot was linked
    const slotId = order.pickupSlot?.id || order.pickupSlot?._id;
    if (slotId) {
      await dbService.incrementSlotBookings(slotId, -1);
    }

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} cancelled successfully`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
