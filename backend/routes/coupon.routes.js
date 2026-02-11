const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const couponController = require('../controllers/coupon.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons (admin)
 * @access  Private (Admin)
 */
router.get('/', verifyToken, requireAdmin, couponController.getCoupons);

/**
 * @route   GET /api/coupons/public
 * @desc    Get public active coupons
 * @access  Public
 */
router.get('/public', couponController.getPublicCoupons);

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon code
 * @access  Private
 */
router.post('/validate', verifyToken, [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('subtotal').isNumeric().withMessage('Subtotal must be a number'),
  validate
], couponController.validateCoupon);

/**
 * @route   POST /api/coupons/apply
 * @desc    Apply coupon to order
 * @access  Private
 */
router.post('/apply', verifyToken, [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  validate
], couponController.applyCoupon);

/**
 * @route   POST /api/coupons
 * @desc    Create coupon (admin)
 * @access  Private (Admin)
 */
router.post('/', verifyToken, requireAdmin, [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  validate
], couponController.createCoupon);

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update coupon (admin)
 * @access  Private (Admin)
 */
router.put('/:id', verifyToken, requireAdmin, couponController.updateCoupon);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete coupon (admin)
 * @access  Private (Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, couponController.deleteCoupon);

module.exports = router;
