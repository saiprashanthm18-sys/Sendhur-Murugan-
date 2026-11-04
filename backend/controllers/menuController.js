const dbService = require('../services/dbService');

/**
 * @route   GET /api/menu
 * @access  Public
 * @query   category, search, includeHidden
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, includeHidden } = req.query;
    const items = await dbService.getMenuItems({ category, search, includeHidden });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/menu/:id
 * @access  Public
 */
const getMenuItem = async (req, res, next) => {
  try {
    const item = await dbService.getMenuItemById(req.params.id);
    if (!item || item.isHidden) {
      res.status(404);
      throw new Error('Menu item not found');
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/menu
 * @access  Private/Admin
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable, image, emoji, preparationTime } = req.body;

    if (!name || price === undefined || !category) {
      res.status(400);
      throw new Error('Name, price, and category are required');
    }

    const item = await dbService.createMenuItem({
      name,
      description,
      price,
      category,
      isAvailable: isAvailable !== false,
      image: image || emoji || '🍽️',
      preparationTime: preparationTime || 10,
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/menu/:id
 * @access  Private/Admin
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const updated = await dbService.updateMenuItem(req.params.id, req.body);
    if (!updated) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/menu/:id
 * @access  Private/Admin
 * Soft delete: sets isHidden = true
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    await dbService.deleteMenuItem(req.params.id);
    res.status(200).json({ success: true, message: 'Menu item hidden successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/menu/:id/availability & /api/menu/:id/toggle
 * @access  Private/Admin
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const updated = await dbService.toggleMenuItemAvailability(req.params.id);
    if (!updated) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    res.status(200).json({
      success: true,
      message: `Item is now ${updated.isAvailable ? 'available' : 'unavailable'}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
