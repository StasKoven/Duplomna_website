/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Detailed error logging
  console.error('\n❌ ========== ERROR OCCURRED ==========');
  console.error('📍 URL:', req.method, req.originalUrl);
  console.error('🔍 Error Type:', err.name);
  console.error('💬 Message:', err.message);
  console.error('📊 Status Code:', err.statusCode || 500);
  
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.password;
    delete sanitizedBody.currentPassword;
    delete sanitizedBody.newPassword;
    delete sanitizedBody.confirmPassword;
    console.error('📦 Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.error('🎯 Request Params:', req.params);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.error('🔎 Request Query:', req.query);
  }
  
  console.error('📚 Stack Trace:', err.stack);
  console.error('======================================\n');

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    console.error('⚠️ Validation Errors:', errors);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    console.error('⚠️ Duplicate Key:', field);
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    console.error('⚠️ Cast Error:', err.path, '=', err.value);
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    console.error('⚠️ JWT Error: Invalid token');
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    console.error('⚠️ JWT Error: Token expired');
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
