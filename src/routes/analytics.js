/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/stats', analyticsController.getGlobalStats);
router.get('/user/:userId/stats', analyticsController.getUserStats);
router.get('/trends', analyticsController.getTrends);

module.exports = router;
