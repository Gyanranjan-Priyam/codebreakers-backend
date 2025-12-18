/**
 * Users Controller
 */

const dashboardAPI = require('../services/dashboardAPI');
const logger = require('../utils/logger');

exports.getUsers = async (req, res, next) => {
  try {
    const { limit, offset, branch, admissionYear, profileComplete } = req.query;

    const response = await dashboardAPI.getUsers({
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      branch,
      admissionYear,
      profileComplete
    });

    res.json({
      success: true,
      data: response.data,
      metadata: response.metadata
    });

  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q, branch } = req.query;

    const response = await dashboardAPI.getUsers({
      branch,
      limit: 1000
    });

    // Filter by search query
    const filteredUsers = response.data.filter(user => 
      user.name.toLowerCase().includes(q.toLowerCase()) ||
      user.email.toLowerCase().includes(q.toLowerCase()) ||
      user.username?.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      data: filteredUsers.slice(0, 50)
    });

  } catch (error) {
    logger.error('Search users error:', error);
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await dashboardAPI.getUserById(req.params.id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await dashboardAPI.getUserStats(req.params.id);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    next(error);
  }
};

exports.getUserActivity = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const stats = await dashboardAPI.getUserStats(userId);

    const activity = [
      ...stats.taskSubmissions.map(t => ({
        type: 'task',
        ...t,
        timestamp: t.submittedAt
      })),
      ...stats.quizAttempts.map(q => ({
        type: 'quiz',
        ...q,
        timestamp: q.completedAt || q.startedAt
      })),
      ...stats.eventParticipations.map(e => ({
        type: 'event',
        ...e,
        timestamp: e.participatedAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    logger.error('Get user activity error:', error);
    next(error);
  }
};
