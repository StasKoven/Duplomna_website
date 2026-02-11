const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const comparisonRoutes = require('./routes/comparison.routes');
const couponRoutes = require('./routes/coupon.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// In development, disable HTTP caching/ETag for API responses to avoid 304 affecting client state
if (process.env.NODE_ENV === 'development') {
  app.set('etag', false);
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'no-store');
    }
    next();
  });
}

// CORS MUST come before rate limiter so preflight gets headers
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting (more lenient in development and skip preflight)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // higher limit in dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  
  // Detailed request logging
  app.use((req, res, next) => {
    console.log('\n🔵 ========== INCOMING REQUEST ==========');
    console.log('📍 Method:', req.method);
    console.log('📍 URL:', req.originalUrl);
    console.log('📍 IP:', req.ip);
    if (req.headers.authorization) {
      console.log('🔑 Auth:', req.headers.authorization.substring(0, 20) + '...');
    }
    if (Object.keys(req.body).length > 0) {
      console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    }
    if (Object.keys(req.query).length > 0) {
      console.log('🔎 Query:', req.query);
    }
    console.log('========================================\n');
    next();
  });
}

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Mongoose error logging
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/coupons', couponRoutes);

// Silence Chrome DevTools probe noise
// Chrome sometimes requests this well-known URL; respond with 204 to avoid 404 logs
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  return res.status(204).end();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.error(`\n⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}\n`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('🚀 ========================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err);
  process.exit(1);
});
