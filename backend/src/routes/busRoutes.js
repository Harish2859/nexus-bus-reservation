const express = require('express');
const router = express.Router();
const { addBus, createSchedule, getScheduleManifest, getOperatorStats } = require('../controllers/busController');
const { authenticateToken, requireOperator } = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, requireOperator, addBus);
router.post('/schedule', authenticateToken, requireOperator, createSchedule);
router.get('/manifest/:scheduleId', authenticateToken, requireOperator, getScheduleManifest);
router.get('/stats', authenticateToken, requireOperator, getOperatorStats);

module.exports = router;
