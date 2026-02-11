const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category
 * @access  Public
 */
router.get('/:id', categoryController.getCategory);

/**
 * @route   POST /api/categories
 * @desc    Create category
 * @access  Private (Admin)
 */
router.post('/', verifyToken, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validate
], categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/:id', verifyToken, requireAdmin, categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
