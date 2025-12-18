/**
 * Authentication Controller
 */

const jwt = require('jsonwebtoken');
const dashboardAPI = require('../services/dashboardAPI');
const logger = require('../utils/logger');
const { AppUser } = require('../models/AppUser');
const { Device } = require('../models/Device');

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, deviceId, deviceName } = req.body;

    // Fetch user from dashboard
    const users = await dashboardAPI.getUsers({ limit: 1000 });
    const user = users.data.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Create or update app user in local database
    let appUser = await AppUser.findOne({ dashboardUserId: user.id });
    
    if (!appUser) {
      appUser = await AppUser.create({
        dashboardUserId: user.id,
        email: user.email,
        name: user.name,
        lastLogin: new Date()
      });
    } else {
      appUser.lastLogin = new Date();
      await appUser.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    appUser.refreshToken = refreshToken;
    await appUser.save();

    // Register device if provided
    if (deviceId) {
      await Device.findOneAndUpdate(
        { userId: appUser._id, deviceId },
        {
          userId: appUser._id,
          deviceId,
          deviceName: deviceName || 'Unknown Device',
          lastActive: new Date()
        },
        { upsert: true }
      );
    }

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          branch: user.branch,
          admissionYear: user.admissionYear,
          profileComplete: user.profileComplete
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user
    const appUser = await AppUser.findOne({
      dashboardUserId: decoded.id,
      refreshToken
    });

    if (!appUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email
    });

    res.json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Remove refresh token
    await AppUser.findOneAndUpdate(
      { dashboardUserId: userId },
      { refreshToken: null }
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * Get current user
 */
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await dashboardAPI.getUserById(userId);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
};

/**
 * Register device for push notifications
 */
exports.registerDevice = async (req, res, next) => {
  try {
    const { deviceToken, platform } = req.body;
    const userId = req.user.id;

    const appUser = await AppUser.findOne({ dashboardUserId: userId });

    await Device.findOneAndUpdate(
      { userId: appUser._id, deviceToken },
      {
        userId: appUser._id,
        deviceToken,
        platform,
        lastActive: new Date()
      },
      { upsert: true }
    );

    logger.info(`Device registered for user: ${userId}`);

    res.json({
      success: true,
      message: 'Device registered successfully'
    });

  } catch (error) {
    logger.error('Register device error:', error);
    next(error);
  }
};

// Helper functions
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );
}
