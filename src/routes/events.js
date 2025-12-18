/**
 * Events Routes
 */

const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(rateLimiter(1, 100));

router.get('/', eventsController.getEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/:id', eventsController.getEventById);
router.get('/:id/participants', eventsController.getEventParticipants);
router.get('/user/:userId', eventsController.getUserEventParticipations);

module.exports = router;
