const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', verifyToken, wishlistController.getWishlist);

/**
 * @route   POST /api/wishlist/:productId
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/:productId', verifyToken, wishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/:productId', verifyToken, wishlistController.removeFromWishlist);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', verifyToken, wishlistController.clearWishlist);

module.exports = router;
