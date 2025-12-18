/**
 * Sync Routes - For offline data synchronization
 */

const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/full', syncController.fullSync);
router.get('/incremental', syncController.incrementalSync);
router.post('/upload', syncController.uploadSyncData);

module.exports = router;
