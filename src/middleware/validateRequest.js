const { validationResult, body, param, query } = require('express-validator');

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Device registration validation
exports.validateDeviceRegistration = [
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required'),
  body('platform')
    .isIn(['ios', 'android', 'web'])
    .withMessage('Platform must be ios, android, or web'),
  body('fcmToken')
    .optional()
    .isString()
    .withMessage('FCM token must be a string')
];

// Pagination validation
exports.validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number')
];

// ID validation
exports.validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
];

exports.validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
];

// Search validation
exports.validateSearch = [
  query('q')
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
];

// Support ticket validation
exports.validateTicketCreation = [
  body('subject')
    .notEmpty()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];
