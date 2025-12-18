/**
 * Dashboard API Client
 * 
 * Wrapper around the External Data API for fetching data from
 * the main Codebreaker Dashboard
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { getCache, setCache } = require('./cache');

class DashboardAPI {
  constructor() {
    this.baseURL = process.env.DASHBOARD_API_URL;
    this.apiKey = process.env.DASHBOARD_API_KEY;
    this.apiPath = '/api/external/data';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          logger.error(`API Error: ${error.response.status} - ${error.response.data?.message}`);
        } else {
          logger.error('API Network Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic fetch method with caching
   */
  async fetch(resource, params = {}, cacheTTL = 300) {
    const cacheKey = `dashboard:${resource}:${JSON.stringify(params)}`;
    
    // Try to get from cache first
    if (process.env.CACHE_ENABLED === 'true') {
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${resource}`);
        return cached;
      }
    }

    try {
      const response = await this.client.get(this.apiPath, {
        params: { resource, ...params }
      });

      const data = response.data;

      // Cache the response
      if (process.env.CACHE_ENABLED === 'true' && cacheTTL > 0) {
        await setCache(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch all database summary
   */
  async getAll() {
    return this.fetch('all', {}, 60); // Cache for 1 minute
  }

  /**
   * Fetch users
   */
  async getUsers(params = {}) {
    return this.fetch('users', params, 180); // Cache for 3 minutes
  }

  /**
   * Fetch user by ID (from users list)
   */
  async getUserById(userId, params = {}) {
    const users = await this.getUsers({ ...params, limit: 1000 });
    const user = users.data.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Fetch announcements
   */
  async getAnnouncements(params = {}) {
    return this.fetch('announcements', params, 120); // Cache for 2 minutes
  }

  /**
   * Fetch attendance sessions
   */
  async getAttendance(params = {}) {
    return this.fetch('attendance', params, 300); // Cache for 5 minutes
  }

  /**
   * Fetch tasks
   */
  async getTasks(params = {}) {
    return this.fetch('tasks', params, 180);
  }

  /**
   * Fetch events
   */
  async getEvents(params = {}) {
    return this.fetch('events', params, 180);
  }

  /**
   * Fetch quizzes
   */
  async getQuizzes(params = {}) {
    return this.fetch('quizzes', params, 120);
  }

  /**
   * Fetch active quizzes
   */
  async getActiveQuizzes(params = {}) {
    return this.fetch('quizzes', { ...params, isActive: true }, 60);
  }

  /**
   * Fetch published projects
   */
  async getProjects(params = {}) {
    return this.fetch('projects', params, 300);
  }

  /**
   * Fetch project reviews
   */
  async getProjectReviews(params = {}) {
    return this.fetch('reviews', params, 120);
  }

  /**
   * Fetch resources
   */
  async getResources(params = {}) {
    return this.fetch('resources', params, 600); // Cache for 10 minutes
  }

  /**
   * Fetch support tickets
   */
  async getSupportTickets(params = {}) {
    return this.fetch('support', params, 60);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const [tasks, quizzes, events] = await Promise.all([
      this.getTasks({ includeRelations: true }),
      this.getQuizzes({ includeRelations: true }),
      this.getEvents({ includeRelations: true })
    ]);

    const userTaskSubmissions = tasks.data
      .flatMap(t => t.submissions || [])
      .filter(s => s.userId === userId);

    const userQuizAttempts = quizzes.data
      .flatMap(q => q.attempts || [])
      .filter(a => a.userId === userId);

    const userEventParticipations = events.data
      .flatMap(e => e.participations || [])
      .filter(p => p.userId === userId);

    const totalPoints = 
      userTaskSubmissions.reduce((sum, s) => sum + (s.pointsAwarded || 0), 0) +
      userQuizAttempts.reduce((sum, a) => sum + (a.pointsEarned || 0), 0) +
      userEventParticipations.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

    return {
      totalPoints,
      tasksCompleted: userTaskSubmissions.filter(s => s.status === 'approved').length,
      quizzesAttempted: userQuizAttempts.length,
      eventsAttended: userEventParticipations.filter(p => p.status === 'participated').length,
      taskSubmissions: userTaskSubmissions,
      quizAttempts: userQuizAttempts,
      eventParticipations: userEventParticipations
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 50) {
    const [tasks, quizzes, events, users] = await Promise.all([
      this.getTasks({ includeRelations: true, limit: 1000 }),
      this.getQuizzes({ includeRelations: true, limit: 1000 }),
      this.getEvents({ includeRelations: true, limit: 1000 }),
      this.getUsers({ limit: 1000, profileComplete: true })
    ]);

    const userPoints = new Map();

    // Initialize all users
    users.data.forEach(user => {
      userPoints.set(user.id, {
        userId: user.id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        admissionYear: user.admissionYear,
        totalPoints: 0
      });
    });

    // Add task points
    tasks.data.forEach(task => {
      task.submissions?.forEach(submission => {
        if (submission.status === 'approved' && userPoints.has(submission.userId)) {
          const user = userPoints.get(submission.userId);
          user.totalPoints += submission.pointsAwarded || 0;
        }
      });
    });

    // Add quiz points
    quizzes.data.forEach(quiz => {
      quiz.attempts?.forEach(attempt => {
        if (attempt.completedAt && userPoints.has(attempt.userId)) {
          const user = userPoints.get(attempt.userId);
          user.totalPoints += attempt.pointsEarned || 0;
        }
      });
    });

    // Add event points
    events.data.forEach(event => {
      event.participations?.forEach(participation => {
        if (participation.status === 'participated' && userPoints.has(participation.userId)) {
          const user = userPoints.get(participation.userId);
          user.totalPoints += participation.pointsAwarded || 0;
        }
      });
    });

    // Convert to array and sort
    const leaderboard = Array.from(userPoints.values())
      .filter(user => user.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        ...user
      }));

    return leaderboard;
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new Error('Authentication failed. Invalid API key.');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 400:
          return new Error(data.message || 'Bad request');
        case 500:
          return new Error('Dashboard API server error');
        default:
          return new Error(data.message || 'API request failed');
      }
    } else if (error.request) {
      return new Error('No response from Dashboard API. Please check your connection.');
    } else {
      return error;
    }
  }

  /**
   * Clear cache for a resource
   */
  async clearCache(resource = null) {
    // Implementation depends on cache service
    logger.info(`Clearing cache for resource: ${resource || 'all'}`);
  }
}

module.exports = new DashboardAPI();
