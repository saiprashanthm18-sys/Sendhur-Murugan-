const MenuItem = require('../models/MenuItem');

/**
 * @route   GET /api/menu
 * @access  Public
 * @query   category, search
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, includeHidden } = req.query;
    const filter = {};

    if (includeHidden !== 'true') {
      filter.isHidden = false;
    }

    if (category && category !== 'All' && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

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
    const item = await MenuItem.findById(req.params.id);
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
    const { name, description, price, category, isAvailable, image, preparationTime } = req.body;

    if (!name || price === undefined || !category) {
      res.status(400);
      throw new Error('Name, price, and category are required');
    }

    const finalImage = image || req.body.emoji || '🍽️';
    const finalCategory = category.toLowerCase();

    const item = await MenuItem.create({
      name,
      description,
      price,
      category: finalCategory,
      isAvailable,
      image: finalImage,
      preparationTime,
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
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    const allowedFields = ['name', 'description', 'price', 'category', 'isAvailable', 'image', 'preparationTime'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'category' && typeof req.body[field] === 'string') {
          item[field] = req.body[field].toLowerCase();
        } else {
          item[field] = req.body[field];
        }
      }
    });

    if (req.body.emoji && !req.body.image) {
      item.image = req.body.emoji;
    }

    const updated = await item.save();
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
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    item.isHidden = true;
    await item.save();

    res.status(200).json({ success: true, message: 'Menu item hidden successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/menu/:id/availability
 * @access  Private/Admin
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item || item.isHidden) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    item.isAvailable = !item.isAvailable;
    const updated = await item.save();

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
