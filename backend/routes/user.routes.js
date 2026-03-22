const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { sanitizePagination } = require('../middleware/validator');

/**
 * @route   GET /api/users/loyalty
 * @desc    Get user loyalty points and history
 * @access  Private
 */
router.get('/loyalty', verifyToken, userController.getLoyaltyPoints);

/**
 * @route   POST /api/users/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/wishlist', verifyToken, userController.addToWishlist);

/**
 * @route   DELETE /api/users/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/wishlist/:productId', verifyToken, userController.removeFromWishlist);

/**
 * @route   PUT /api/users/cart
 * @desc    Update cart
 * @access  Private
 */
router.put('/cart', verifyToken, userController.updateCart);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/', verifyToken, requireAdmin, sanitizePagination, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin)
 */
router.get('/:id', verifyToken, requireAdmin, userController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', verifyToken, requireAdmin, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;
