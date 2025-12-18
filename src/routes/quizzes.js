/**
 * Quizzes Routes
 */

const express = require('express');
const router = express.Router();
const quizzesController = require('../controllers/quizzesController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(rateLimiter(1, 100));

/**
 * @route   GET /api/v1/quizzes
 * @desc    Get all quizzes
 * @access  Private
 */
router.get('/', quizzesController.getQuizzes);

/**
 * @route   GET /api/v1/quizzes/active
 * @desc    Get active quizzes
 * @access  Private
 */
router.get('/active', quizzesController.getActiveQuizzes);

/**
 * @route   GET /api/v1/quizzes/:id
 * @desc    Get quiz by ID
 * @access  Private
 */
router.get('/:id', quizzesController.getQuizById);

/**
 * @route   GET /api/v1/quizzes/:id/results
 * @desc    Get quiz results
 * @access  Private
 */
router.get('/:id/results', quizzesController.getQuizResults);

/**
 * @route   GET /api/v1/quizzes/:id/leaderboard
 * @desc    Get quiz leaderboard
 * @access  Private
 */
router.get('/:id/leaderboard', quizzesController.getQuizLeaderboard);

module.exports = router;
