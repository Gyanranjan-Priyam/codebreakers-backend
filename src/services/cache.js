const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Cache configuration
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // For performance
  deleteOnExpire: true
});

// Cache statistics
cache.on('set', (key, value) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('del', (key, value) => {
  logger.debug(`Cache DEL: ${key}`);
});

cache.on('expired', (key, value) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

// Get from cache
exports.get = (key) => {
  try {
    const value = cache.get(key);
    if (value) {
      logger.debug(`Cache HIT: ${key}`);
      return value;
    }
    logger.debug(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

// Set to cache
exports.set = (key, value, ttl = null) => {
  try {
    if (ttl) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
};

// Delete from cache
exports.del = (key) => {
  try {
    cache.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
};

// Delete multiple keys
exports.delMultiple = (keys) => {
  try {
    cache.del(keys);
    return true;
  } catch (error) {
    logger.error('Cache delete multiple error:', error);
    return false;
  }
};

// Flush all cache
exports.flush = () => {
  try {
    cache.flushAll();
    logger.info('Cache flushed');
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error);
    return false;
  }
};

// Get cache statistics
exports.getStats = () => {
  return cache.getStats();
};

// Middleware to cache responses
exports.cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = exports.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      exports.set(key, body, duration);
      return originalJson(body);
    };

    next();
  };
};

module.exports = exports;
