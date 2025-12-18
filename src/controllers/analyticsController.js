/**
 * Analytics Controller
 */

const dashboardAPI = require('../services/dashboardAPI');
const logger = require('../utils/logger');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit } = req.query;

    const leaderboard = await dashboardAPI.getLeaderboard(
      parseInt(limit) || 50
    );

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    logger.error('Get leaderboard error:', error);
    next(error);
  }
};

exports.getGlobalStats = async (req, res, next) => {
  try {
    const summary = await dashboardAPI.getAll();

    res.json({
      success: true,
      data: summary.data.summary
    });

  } catch (error) {
    logger.error('Get global stats error:', error);
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await dashboardAPI.getUserStats(req.params.userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    next(error);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    // This would require time-series data
    // For now, return basic stats
    const summary = await dashboardAPI.getAll();

    res.json({
      success: true,
      data: {
        message: 'Trends feature coming soon',
        currentStats: summary.data.summary
      }
    });

  } catch (error) {
    logger.error('Get trends error:', error);
    next(error);
  }
};
