const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', productController.getProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/products/stats
 * @desc    Get product statistics
 * @access  Private (Admin)
 */
router.get('/stats', verifyToken, requireAdmin, productController.getProductStats);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', productController.getProduct);

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get('/:id/related', productController.getRelatedProducts);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin)
 */
router.post('/', verifyToken, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('stock').isNumeric().withMessage('Stock must be a number'),
  validate
], productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin)
 */
router.put('/:id', verifyToken, requireAdmin, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;
