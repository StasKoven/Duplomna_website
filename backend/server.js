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
const ticketRoutes = require('./routes/ticket.routes');
const returnRoutes = require('./routes/return.routes');
const notificationRoutes = require('./routes/notification.routes');
const novaPoshtaRoutes = require('./routes/novaposhta.routes');
const uploadRoutes = require('./routes/upload.routes');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust Railway's reverse proxy (required for express-rate-limit and correct IP detection)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
}));
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
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'https://duplomna-website-1dy7.vercel.app',
      'https://duplomna-website-p786.vercel.app',
      'https://duplomnawebsite-production.up.railway.app',
    ];

    // Allow all Vercel preview deployments for this project
    const vercelPreviewPattern = /^https:\/\/duplomna-website[\w-]*\.vercel\.app$/;

    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      return allowed === origin;
    }) || vercelPreviewPattern.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
};
app.use(cors(corsOptions));
// Use a regex match so this keeps working when migrating to Express 5,
// where the bare '*' string is no longer a valid path pattern.
app.options(/.*/, cors(corsOptions));

// Rate limiting (more lenient in development and skip preflight)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 300, // higher limit in dev
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
  
  // Detailed request logging (development-only). Auth headers and password
  // bodies are redacted to avoid accidentally leaking secrets via dev logs.
  app.use((req, res, next) => {
    console.log('\n🔵 ========== INCOMING REQUEST ==========');
    console.log('📍 Method:', req.method);
    console.log('📍 URL:', req.originalUrl);
    console.log('📍 IP:', req.ip);
    if (req.headers.authorization) {
      console.log('🔑 Auth: <present>');
    }
    if (req.body && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body };
      ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'idToken', 'refreshToken', 'token']
        .forEach(k => { if (k in safeBody) safeBody[k] = '***'; });
      console.log('📦 Body:', JSON.stringify(safeBody, null, 2));
    }
    if (Object.keys(req.query).length > 0) {
      console.log('🔎 Query:', req.query);
    }
    console.log('========================================\n');
    next();
  });
}

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
app.use('/api/tickets', ticketRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/novaposhta', novaPoshtaRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve uploaded product images statically. helmet's CORP is set to
// "cross-origin" above, so Next/Image on the admin host can fetch these files.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  fallthrough: true,
}));

// Silence Chrome DevTools probe noise
// Chrome sometimes requests this well-known URL; respond with 204 to avoid 404 logs
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  return res.status(204).end();
});

// Root route (Railway healthcheck hits /)
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Electronics Store API' });
});

// Health check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ 
    status: dbState === 1 ? 'OK' : 'DEGRADED', 
    database: dbStates[dbState] || 'unknown',
    timestamp: new Date().toISOString() 
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.error(`\n 404 - Route not found: ${req.method} ${req.originalUrl}\n`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately so Railway healthcheck passes,
// then connect to MongoDB in the background.
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Retry after 5 seconds instead of crashing
    console.log('🔄 Retrying MongoDB connection in 5s...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err);
  process.exit(1);
});
