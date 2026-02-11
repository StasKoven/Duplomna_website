const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', verifyToken, cartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Add product to cart
 * @access  Private
 */
router.post('/', verifyToken, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
], cartController.addToCart);

/**
 * @route   POST /api/cart/sync
 * @desc    Sync cart from frontend
 * @access  Private
 */
router.post('/sync', verifyToken, cartController.syncCart);

/**
 * @route   PUT /api/cart/:productId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/:productId', verifyToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
], cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:productId', verifyToken, cartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
