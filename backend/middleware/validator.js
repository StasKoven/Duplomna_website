const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation results
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Middleware to cap pagination parameters and prevent resource exhaustion
 */
exports.sanitizePagination = (req, res, next) => {
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 20;

  if (req.query.limit !== undefined) {
    const parsed = parseInt(req.query.limit, 10);
    req.query.limit = (isNaN(parsed) || parsed < 1) ? DEFAULT_LIMIT : Math.min(parsed, MAX_LIMIT);
  }

  if (req.query.page !== undefined) {
    const parsed = parseInt(req.query.page, 10);
    req.query.page = (isNaN(parsed) || parsed < 1) ? 1 : parsed;
  }

  next();
};
