const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl} from IP ${req.ip}`);
  
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      quizzes: '/api/quizzes/*',
      tasks: '/api/tasks/*',
      events: '/api/events/*',
      announcements: '/api/announcements/*',
      projects: '/api/projects/*',
      support: '/api/support/*',
      notifications: '/api/notifications/*',
      sync: '/api/sync/*',
      analytics: '/api/analytics/*'
    }
  });
};

module.exports = notFound;
