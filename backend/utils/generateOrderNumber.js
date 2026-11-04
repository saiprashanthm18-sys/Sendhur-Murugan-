const dbService = require('../services/dbService');

/**
 * Finds the highest orderNumber and returns max + 1.
 * Falls back to 1001 if no orders exist yet.
 */
const generateOrderNumber = async () => {
  return await dbService.getNextOrderNumber();
};

module.exports = generateOrderNumber;
