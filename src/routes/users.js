/**
 * Users Routes
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

const userRateLimiter = rateLimiter(1, 100); // 100 requests per minute

router.use(authenticate);
router.use(userRateLimiter);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private
 */
router.get('/', usersController.getUsers);

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search', usersController.searchUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', usersController.getUserById);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/:id/stats', usersController.getUserStats);

/**
 * @route   GET /api/v1/users/:id/activity
 * @desc    Get user activity
 * @access  Private
 */
router.get('/:id/activity', usersController.getUserActivity);

module.exports = router;
