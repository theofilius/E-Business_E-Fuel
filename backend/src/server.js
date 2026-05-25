const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const Order = require('./models/Order');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// ===== Socket.IO realtime server =====
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
// Controllers access io via req.app.get('io')
app.set('io', io);

// ===== Security Middleware =====
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
  crossOriginEmbedderPolicy: false,
}));

// Body parser with size limits for security
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/payments', paymentLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 E-FUEL API is running',
    version: '1.0.0',
    realtime: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Serve uploaded chat images from backend/uploads.
// Expo web runs on a different localhost port, so image assets must be embeddable cross-origin.
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/refunds', require('./routes/refundRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// ===== Socket.IO connection handling =====
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // A customer or driver follows a specific order's updates
  socket.on('join_order', (orderId) => {
    if (orderId) socket.join(`order:${orderId}`);
  });
  socket.on('leave_order', (orderId) => {
    if (orderId) socket.leave(`order:${orderId}`);
  });

  // Drivers join the "drivers" room to be notified of new orders
  socket.on('join_drivers', () => socket.join('drivers'));
  socket.on('leave_drivers', () => socket.leave('drivers'));

  // Driver streams their live location while delivering an order
  socket.on('driver_location', async ({ orderId, lat, lng }) => {
    if (!orderId || typeof lat !== 'number' || typeof lng !== 'number') return;
    // Relay to everyone watching this order
    io.to(`order:${orderId}`).emit('driver_location', { orderId, lat, lng });
    // Persist last known position
    try {
      await Order.findByIdAndUpdate(orderId, { driverLocation: { lat, lng } });
    } catch (err) {
      console.error('Failed to persist driver location:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ⛽ =========================================
  ⛽  E-FUEL API Server
  ⛽  Port:        ${PORT}
  ⛽  Environment: ${process.env.NODE_ENV || 'development'}
  ⛽  URL:         http://localhost:${PORT}
  ⛽  Health:      http://localhost:${PORT}/api/health
  ⛽  Realtime:    Socket.IO enabled
  ⛽ =========================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
