/**
 * Projects Routes
 */

const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(rateLimiter(1, 100));

router.get('/', projectsController.getProjects);
router.get('/featured', projectsController.getFeaturedProjects);
router.get('/:id', projectsController.getProjectById);
router.get('/user/:userId', projectsController.getUserProjects);

module.exports = router;
