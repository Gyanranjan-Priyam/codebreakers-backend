/**
 * Notifications Routes
 */

const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.post('/mark-read', notificationsController.markAsRead);
router.post('/mark-all-read', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
