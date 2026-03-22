const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ticketController = require('../controllers/ticket.controller');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, sanitizePagination } = require('../middleware/validator');

// ===== USER ROUTES =====

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 * @access  Public (optional auth)
 */
router.post('/', optionalAuth, [
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  body('category').optional().isIn(['order', 'delivery', 'payment', 'product', 'return', 'account', 'other']),
  body('guestName').optional().trim().isLength({ max: 100 }),
  body('guestEmail').optional().isEmail().normalizeEmail(),
  validate
], ticketController.createTicket);

/**
 * @route   GET /api/tickets/my
 * @desc    Get current user's tickets
 * @access  Private
 */
router.get('/my', verifyToken, ticketController.getUserTickets);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket
 * @access  Private
 */
router.get('/:id', verifyToken, ticketController.getTicket);

/**
 * @route   POST /api/tickets/:id/messages
 * @desc    Add message to ticket
 * @access  Private
 */
router.post('/:id/messages', verifyToken, [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  validate
], ticketController.addMessage);

// ===== ADMIN ROUTES =====

/**
 * @route   GET /api/tickets/admin/all
 * @desc    Get all tickets (admin)
 * @access  Admin
 */
router.get('/admin/all', verifyToken, requireAdmin, sanitizePagination, ticketController.getAllTickets);

/**
 * @route   PUT /api/tickets/:id/status
 * @desc    Update ticket status (admin)
 * @access  Admin
 */
router.put('/:id/status', verifyToken, requireAdmin, [
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validate
], ticketController.updateTicketStatus);

/**
 * @route   PUT /api/tickets/:id/read
 * @desc    Mark ticket as read (admin)
 * @access  Admin
 */
router.put('/:id/read', verifyToken, requireAdmin, ticketController.markAsRead);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Delete ticket (admin)
 * @access  Admin
 */
router.delete('/:id', verifyToken, requireAdmin, ticketController.deleteTicket);

module.exports = router;
