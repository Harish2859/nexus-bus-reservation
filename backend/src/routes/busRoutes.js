const express = require('express');
const router = express.Router();
const { addBus, createSchedule, getScheduleManifest, getOperatorStats, getOperatorBuses, getActiveSchedules } = require('../controllers/busController');
const { authenticateToken, requireOperator } = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, requireOperator, addBus);
router.post('/schedule', authenticateToken, requireOperator, createSchedule);
router.get('/manifest/:scheduleId', authenticateToken, requireOperator, getScheduleManifest);
router.get('/stats', authenticateToken, requireOperator, getOperatorStats);
router.get('/fleet', authenticateToken, requireOperator, getOperatorBuses);
router.get('/active-schedules', authenticateToken, requireOperator, getActiveSchedules);

module.exports = router;
