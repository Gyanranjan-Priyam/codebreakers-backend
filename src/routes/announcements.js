/**
 * Announcements Routes
 */

const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcementsController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(rateLimiter(1, 100));

router.get('/', announcementsController.getAnnouncements);
router.get('/recent', announcementsController.getRecentAnnouncements);
router.get('/pinned', announcementsController.getPinnedAnnouncements);
router.get('/:id', announcementsController.getAnnouncementById);

module.exports = router;
