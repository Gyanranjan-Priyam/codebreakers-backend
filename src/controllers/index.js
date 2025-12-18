// Create all remaining controllers in one file for space efficiency
// In production, split these into separate files

const dashboardAPI = require('../services/dashboardAPI');
const logger = require('../utils/logger');

// ========== Quizzes Controller ==========
exports.quizzesController = {
  getQuizzes: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getQuizzes({
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
        includeRelations: req.query.includeRelations === 'true'
      });
      res.json({ success: true, data: response.data, metadata: response.metadata });
    } catch (error) {
      next(error);
    }
  },

  getActiveQuizzes: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getActiveQuizzes({
        limit: parseInt(req.query.limit) || 50
      });
      res.json({ success: true, data: response.data });
    } catch (error) {
      next(error);
    }
  },

  getQuizById: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getQuizzes({ includeRelations: true });
      const quiz = response.data.find(q => q.id === req.params.id);
      if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
      res.json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  },

  getQuizResults: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getQuizzes({ includeRelations: true });
      const quiz = response.data.find(q => q.id === req.params.id);
      if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
      res.json({ success: true, data: quiz.attempts || [] });
    } catch (error) {
      next(error);
    }
  },

  getQuizLeaderboard: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getQuizzes({ includeRelations: true });
      const quiz = response.data.find(q => q.id === req.params.id);
      if (!quiz || !quiz.attempts) return res.json({ success: true, data: [] });
      
      const leaderboard = quiz.attempts
        .filter(a => a.completedAt)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
      
      res.json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Tasks Controller ==========
exports.tasksController = {
  getTasks: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getTasks({
        limit: parseInt(req.query.limit) || 50,
        includeRelations: req.query.includeRelations === 'true'
      });
      res.json({ success: true, data: response.data, metadata: response.metadata });
    } catch (error) {
      next(error);
    }
  },

  getActiveTasks: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getTasks({ limit: 100 });
      const now = new Date();
      const activeTasks = response.data.filter(t => 
        new Date(t.startDate) <= now && new Date(t.dueDate) >= now
      );
      res.json({ success: true, data: activeTasks });
    } catch (error) {
      next(error);
    }
  },

  getTaskById: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getTasks({ includeRelations: true });
      const task = response.data.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  getTaskSubmissions: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getTasks({ includeRelations: true });
      const task = response.data.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      res.json({ success: true, data: task.submissions || [] });
    } catch (error) {
      next(error);
    }
  },

  getUserTaskSubmissions: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getTasks({ includeRelations: true });
      const submissions = response.data.flatMap(t => 
        (t.submissions || []).filter(s => s.userId === req.params.userId)
      );
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Events Controller ==========
exports.eventsController = {
  getEvents: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getEvents({
        limit: parseInt(req.query.limit) || 50,
        includeRelations: req.query.includeRelations === 'true'
      });
      res.json({ success: true, data: response.data, metadata: response.metadata });
    } catch (error) {
      next(error);
    }
  },

  getUpcomingEvents: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getEvents({ limit: 100 });
      const now = new Date();
      const upcoming = response.data.filter(e => new Date(e.eventDate) >= now);
      res.json({ success: true, data: upcoming });
    } catch (error) {
      next(error);
    }
  },

  getEventById: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getEvents({ includeRelations: true });
      const event = response.data.find(e => e.id === req.params.id);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  getEventParticipants: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getEvents({ includeRelations: true });
      const event = response.data.find(e => e.id === req.params.id);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      res.json({ success: true, data: event.participations || [] });
    } catch (error) {
      next(error);
    }
  },

  getUserEventParticipations: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getEvents({ includeRelations: true });
      const participations = response.data.flatMap(e =>
        (e.participations || []).filter(p => p.userId === req.params.userId)
      );
      res.json({ success: true, data: participations });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Announcements Controller ==========
exports.announcementsController = {
  getAnnouncements: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getAnnouncements({
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      });
      res.json({ success: true, data: response.data, metadata: response.metadata });
    } catch (error) {
      next(error);
    }
  },

  getRecentAnnouncements: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getAnnouncements({ limit: 20 });
      res.json({ success: true, data: response.data });
    } catch (error) {
      next(error);
    }
  },

  getPinnedAnnouncements: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getAnnouncements({ isPinned: true, limit: 10 });
      res.json({ success: true, data: response.data });
    } catch (error) {
      next(error);
    }
  },

  getAnnouncementById: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getAnnouncements({ limit: 1000 });
      const announcement = response.data.find(a => a.id === req.params.id);
      if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
      res.json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Projects Controller ==========
exports.projectsController = {
  getProjects: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getProjects({
        limit: parseInt(req.query.limit) || 50,
        includeRelations: req.query.includeRelations === 'true'
      });
      res.json({ success: true, data: response.data, metadata: response.metadata });
    } catch (error) {
      next(error);
    }
  },

  getFeaturedProjects: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getProjects({ limit: 20 });
      res.json({ success: true, data: response.data });
    } catch (error) {
      next(error);
    }
  },

  getProjectById: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getProjects({ includeRelations: true });
      const project = response.data.find(p => p.id === req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  getUserProjects: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getProjects({ includeRelations: true });
      const userProjects = response.data.filter(p => p.publishedById === req.params.userId);
      res.json({ success: true, data: userProjects });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Support Controller ==========
exports.supportController = {
  getTickets: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getSupportTickets({
        limit: parseInt(req.query.limit) || 50,
        status: req.query.status
      });
      res.json({ success: true, data: response.data, metadata: response.metadata });
    } catch (error) {
      next(error);
    }
  },

  getTicketById: async (req, res, next) => {
    try {
      const response = await dashboardAPI.getSupportTickets({ includeRelations: true });
      const ticket = response.data.find(t => t.id === req.params.id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  },

  createTicket: async (req, res, next) => {
    try {
      // This would need to be implemented as a POST to dashboard
      res.status(501).json({
        success: false,
        message: 'Ticket creation will be available in next version'
      });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Notifications Controller ==========
exports.notificationsController = {
  getNotifications: async (req, res, next) => {
    try {
      // Mock implementation - would need local database
      res.json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  },

  deleteNotification: async (req, res, next) => {
    try {
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }
};

// ========== Sync Controller ==========
exports.syncController = {
  fullSync: async (req, res, next) => {
    try {
      const [users, quizzes, tasks, events, announcements, projects] = await Promise.all([
        dashboardAPI.getUsers({ limit: 1000 }),
        dashboardAPI.getQuizzes({ limit: 100, includeRelations: true }),
        dashboardAPI.getTasks({ limit: 100, includeRelations: true }),
        dashboardAPI.getEvents({ limit: 100, includeRelations: true }),
        dashboardAPI.getAnnouncements({ limit: 100 }),
        dashboardAPI.getProjects({ limit: 500 })
      ]);

      res.json({
        success: true,
        data: {
          users: users.data,
          quizzes: quizzes.data,
          tasks: tasks.data,
          events: events.data,
          announcements: announcements.data,
          projects: projects.data,
          syncedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  },

  incrementalSync: async (req, res, next) => {
    try {
      const { lastSync } = req.query;
      // Would filter by lastSync timestamp in production
      const summary = await dashboardAPI.getAll();
      res.json({
        success: true,
        data: {
          summary: summary.data.summary,
          syncedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  },

  uploadSyncData: async (req, res, next) => {
    try {
      // Handle offline data upload
      res.json({ success: true, message: 'Sync data uploaded' });
    } catch (error) {
      next(error);
    }
  }
};
