const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparison.controller');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/comparisons
 * @desc    Get all comparison lists
 * @access  Private
 */
router.get('/', verifyToken, comparisonController.getComparisons);

/**
 * @route   GET /api/comparisons/category/:categoryId
 * @desc    Get comparison list by category
 * @access  Private
 */
router.get('/category/:categoryId', verifyToken, comparisonController.getComparisonByCategory);

/**
 * @route   POST /api/comparisons/:productId
 * @desc    Add product to comparison
 * @access  Private
 */
router.post('/:productId', verifyToken, comparisonController.addToComparison);

/**
 * @route   DELETE /api/comparisons/category/:categoryId
 * @desc    Clear comparison list
 * @access  Private
 */
router.delete('/category/:categoryId', verifyToken, comparisonController.clearComparison);

/**
 * @route   DELETE /api/comparisons/:productId
 * @desc    Remove product from comparison
 * @access  Private
 */
router.delete('/:productId', verifyToken, comparisonController.removeFromComparison);

module.exports = router;
