/**
 * Authentication Routes
 * 
 * Handles user authentication for mobile/external apps
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validateRequest');
const { rateLimiter } = require('../middleware/rateLimiter');

// Rate limiter for auth routes (stricter limits)
const authRateLimiter = rateLimiter(15, 5); // 5 requests per 15 minutes

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email/username and get JWT token
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('deviceId').optional().isString(),
    body('deviceName').optional().isString(),
  ],
  validateRequest,
  authController.login
);

/**
 * @route   POST /api/v1/auth/register-device
 * @desc    Register device for push notifications
 * @access  Private
 */
router.post(
  '/register-device',
  [
    body('deviceToken').notEmpty().isString(),
    body('platform').isIn(['ios', 'android', 'web']),
  ],
  validateRequest,
  authController.registerDevice
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().isString()],
  validateRequest,
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate token
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authController.getMe);

module.exports = router;
