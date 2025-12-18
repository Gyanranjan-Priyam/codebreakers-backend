/**
 * Tasks Routes
 */

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(rateLimiter(1, 100));

router.get('/', tasksController.getTasks);
router.get('/active', tasksController.getActiveTasks);
router.get('/:id', tasksController.getTaskById);
router.get('/:id/submissions', tasksController.getTaskSubmissions);
router.get('/user/:userId', tasksController.getUserTaskSubmissions);

module.exports = router;
