const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate, sanitizePagination } = require('../middleware/validator');

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', verifyToken, [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  validate
], orderController.createOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get current user orders
 * @access  Private
 */
router.get('/my-orders', verifyToken, sanitizePagination, orderController.getUserOrders);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics
 * @access  Private (Admin)
 */
router.get('/stats', verifyToken, requireAdmin, orderController.getOrderStats);

/**
 * @route   GET /api/orders/all
 * @desc    Get all orders
 * @access  Private (Admin)
 */
router.get('/all', verifyToken, requireAdmin, sanitizePagination, orderController.getAllOrders);

/**
 * @route   GET /api/orders/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard-stats', verifyToken, requireAdmin, orderController.getDashboardStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', verifyToken, orderController.getOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin)
 */
router.put('/:id/status', verifyToken, requireAdmin, [
  body('orderStatus').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  validate
], orderController.updateOrderStatus);

module.exports = router;
