const Category = require('../models/Category.model');
const Product = require('../models/Product.model');

/**
 * Get all categories
 */
exports.getCategories = async (req, res) => {
  try {
    const { parent, activeOnly = 'true' } = req.query;

    const filter = {};
    if (activeOnly === 'true') filter.isActive = true;
    if (parent !== undefined) filter.parent = parent === 'null' ? null : parent;

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort('order name')
      .lean();

    if (process.env.NODE_ENV === 'development') {
      console.log(`📂 Categories fetched: count=${categories.length} filter=${JSON.stringify(filter)}`);
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

/**
 * Get single category
 */
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const mongoose = require('mongoose');
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { slug: id }] }
      : { slug: id };
    const category = await Category.findOne(query).populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get subcategories
    const subcategories = await Category.find({ parent: category._id, isActive: true });

    // Get products count
    const productsCount = await Product.countDocuments({ 
      category: category._id, 
      isActive: true 
    });

    res.json({ 
      category,
      subcategories,
      productsCount
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

/**
 * Create category (Admin only)
 */
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

/**
 * Update category (Admin only)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

/**
 * Delete category (Admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${productsCount} products. Please reassign or delete products first.` 
      });
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parent: id });
    
    if (subcategoriesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${subcategoriesCount} subcategories.` 
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};
