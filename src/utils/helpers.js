const crypto = require('crypto');

// Generate random string
exports.generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate UUID
exports.generateUUID = () => {
  return crypto.randomUUID();
};

// Hash password (for additional security beyond JWT)
exports.hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

// Verify password
exports.verifyPassword = (password, salt, hash) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Sanitize user data (remove sensitive fields)
exports.sanitizeUser = (user) => {
  if (!user) return null;
  
  const sanitized = { ...user };
  delete sanitized.refreshTokens;
  delete sanitized.password;
  delete sanitized.__v;
  
  return sanitized;
};

// Format response
exports.successResponse = (data, message = null) => {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data })
  };
};

exports.errorResponse = (message, code = null, errors = null) => {
  return {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors })
  };
};

// Pagination helper
exports.getPaginationParams = (query) => {
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const offset = Math.max(parseInt(query.offset) || 0, 0);
  const page = Math.floor(offset / limit) + 1;
  
  return { limit, offset, page };
};

exports.createPaginationMetadata = (total, limit, offset) => {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;
  
  return {
    total,
    limit,
    offset,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    ...(hasNext && { nextOffset: offset + limit }),
    ...(hasPrevious && { previousOffset: Math.max(0, offset - limit) })
  };
};

// Date helpers
exports.isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

exports.addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

exports.formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// Array helpers
exports.chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

exports.unique = (array) => {
  return [...new Set(array)];
};

exports.groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// String helpers
exports.slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

exports.truncate = (text, length = 100, suffix = '...') => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

// Validation helpers
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Async handler wrapper
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sleep/delay function
exports.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate percentage
exports.calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

// Average calculation
exports.average = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
};

// Safe JSON parse
exports.safeJsonParse = (text, fallback = null) => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

// Deep clone
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
exports.isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};
