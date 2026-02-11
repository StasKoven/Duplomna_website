const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   POST /api/reviews
 * @desc    Create review
 * @access  Private
 */
router.post('/', verifyToken, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
  validate
], reviewController.createReview);

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get product reviews
 * @access  Public
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.put('/:id/helpful', verifyToken, reviewController.markHelpful);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
