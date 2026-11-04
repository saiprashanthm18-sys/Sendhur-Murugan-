const Order = require('../models/Order');

/**
 * Finds the highest orderNumber in DB and returns max + 1.
 * Falls back to 1000 if no orders exist yet.
 */
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne({}, { orderNumber: 1 })
    .sort({ orderNumber: -1 })
    .lean();

  if (lastOrder && lastOrder.orderNumber) {
    return lastOrder.orderNumber + 1;
  }
  return 1000;
};

module.exports = generateOrderNumber;
