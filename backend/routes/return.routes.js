const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const returnController = require('../controllers/return.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   POST /api/returns
 * @desc    Create return/exchange request
 * @access  Private
 */
router.post('/', verifyToken, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('type').isIn(['return', 'exchange']).withMessage('Type must be return or exchange'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validate
], returnController.createReturnRequest);

/**
 * @route   GET /api/returns/my-requests
 * @desc    Get user's return requests
 * @access  Private
 */
router.get('/my-requests', verifyToken, returnController.getUserReturnRequests);

/**
 * @route   GET /api/returns/all
 * @desc    Get all return requests
 * @access  Private (Admin)
 */
router.get('/all', verifyToken, requireAdmin, returnController.getAllReturnRequests);

/**
 * @route   PUT /api/returns/:id/status
 * @desc    Update return request status
 * @access  Private (Admin)
 */
router.put('/:id/status', verifyToken, requireAdmin, [
  body('status').isIn(['pending', 'approved', 'rejected', 'completed'])
    .withMessage('Invalid status'),
  validate
], returnController.updateReturnRequestStatus);

module.exports = router;
