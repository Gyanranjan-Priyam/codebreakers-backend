const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.email = decoded.email;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle custom events
    socket.on('join_room', (room) => {
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error on ${socket.id}:`, error);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call init() first.');
  }
  return io;
};

// Emit to specific user
exports.emitToUser = (userId, event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return false;
    }
    io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Emitted ${event} to user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error emitting to user:', error);
    return false;
  }
};

// Emit to specific room
exports.emitToRoom = (room, event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return false;
    }
    io.to(room).emit(event, data);
    logger.debug(`Emitted ${event} to room ${room}`);
    return true;
  } catch (error) {
    logger.error('Error emitting to room:', error);
    return false;
  }
};

// Broadcast to all connected clients
exports.broadcast = (event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return false;
    }
    io.emit(event, data);
    logger.debug(`Broadcasted ${event} to all clients`);
    return true;
  } catch (error) {
    logger.error('Error broadcasting:', error);
    return false;
  }
};

// Get connected sockets count
exports.getConnectionCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};
