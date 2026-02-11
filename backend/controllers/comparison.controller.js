const Comparison = require('../models/Comparison.model');
const Product = require('../models/Product.model');

/**
 * @desc    Get user's comparison lists
 * @route   GET /api/comparisons
 * @access  Private
 */
exports.getComparisons = async (req, res) => {
  try {
    const comparisons = await Comparison.find({ user: req.user.id })
      .populate('category', 'name slug')
      .populate({
        path: 'products',
        select: 'name slug price images specifications features rating stock'
      });

    res.status(200).json({
      success: true,
      comparisons
    });
  } catch (error) {
    console.error('Get comparisons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get comparison list by category
 * @route   GET /api/comparisons/category/:categoryId
 * @access  Private
 */
exports.getComparisonByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    let comparison = await Comparison.findOne({
      user: req.user.id,
      category: categoryId
    })
      .populate('category', 'name slug')
      .populate({
        path: 'products',
        select: 'name slug price images specifications features rating stock'
      });

    if (!comparison) {
      comparison = await Comparison.create({
        user: req.user.id,
        category: categoryId,
        products: []
      });

      await comparison.populate('category', 'name slug');
    }

    res.status(200).json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error('Get comparison by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Add product to comparison
 * @route   POST /api/comparisons/:productId
 * @access  Private
 */
exports.addToComparison = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId).populate('category');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create comparison list for this category
    let comparison = await Comparison.findOne({
      user: req.user.id,
      category: product.category._id
    });

    if (!comparison) {
      comparison = await Comparison.create({
        user: req.user.id,
        category: product.category._id,
        products: []
      });
    }

    // Check if product already in comparison
    if (comparison.products.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in comparison'
      });
    }

    // Check max limit
    if (comparison.products.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 products can be compared'
      });
    }

    comparison.products.push(productId);
    await comparison.save();

    await comparison.populate([
      { path: 'category', select: 'name slug' },
      { path: 'products', select: 'name slug price images specifications features rating stock' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Product added to comparison',
      comparison
    });
  } catch (error) {
    console.error('Add to comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Remove product from comparison
 * @route   DELETE /api/comparisons/:productId
 * @access  Private
 */
exports.removeFromComparison = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const comparison = await Comparison.findOne({
      user: req.user.id,
      category: product.category
    });

    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Comparison list not found'
      });
    }

    comparison.products = comparison.products.filter(
      id => id.toString() !== productId
    );
    await comparison.save();

    await comparison.populate([
      { path: 'category', select: 'name slug' },
      { path: 'products', select: 'name slug price images specifications features rating stock' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Product removed from comparison',
      comparison
    });
  } catch (error) {
    console.error('Remove from comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Clear comparison list
 * @route   DELETE /api/comparisons/category/:categoryId
 * @access  Private
 */
exports.clearComparison = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await Comparison.findOneAndDelete({
      user: req.user.id,
      category: categoryId
    });

    res.status(200).json({
      success: true,
      message: 'Comparison list cleared'
    });
  } catch (error) {
    console.error('Clear comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
