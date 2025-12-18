/**
 * Main Entry Point for Codebreaker App Backend
 * 
 * This server acts as a middleware between mobile/external apps
 * and the main Codebreaker Dashboard, providing:
 * - User authentication
 * - Data caching
 * - Push notifications
 * - Real-time updates
 * - Offline sync support
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const quizzesRoutes = require('./routes/quizzes');
const tasksRoutes = require('./routes/tasks');
const eventsRoutes = require('./routes/events');
const announcementsRoutes = require('./routes/announcements');
const projectsRoutes = require('./routes/projects');
const supportRoutes = require('./routes/support');
const notificationsRoutes = require('./routes/notifications');
const syncRoutes = require('./routes/sync');
const analyticsRoutes = require('./routes/analytics');

// Import services
const { initializeCache } = require('./services/cache');
const { initializeDatabase } = require('./services/database');
const { initializeSocketIO } = require('./services/socket');
const { initializeFirebase } = require('./services/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/quizzes', quizzesRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize cache
    if (process.env.CACHE_ENABLED === 'true') {
      await initializeCache();
      logger.info('Cache initialized');
    }

    // Initialize database
    if (process.env.MONGODB_URI) {
      await initializeDatabase();
      logger.info('Database connected');
    }

    // Initialize Firebase (for push notifications)
    if (process.env.ENABLE_PUSH_NOTIFICATIONS === 'true') {
      await initializeFirebase();
      logger.info('Firebase initialized');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Codebreaker App Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Dashboard API: ${process.env.DASHBOARD_API_URL}`);
    });

    // Initialize Socket.IO for real-time updates
    const io = initializeSocketIO(server);
    app.set('io', io);
    logger.info('Socket.IO initialized for real-time updates');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
