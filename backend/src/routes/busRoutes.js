const express = require('express');
const router = express.Router();
const { addBus, createSchedule } = require('../controllers/busController');
const { authenticateToken, requireOperator } = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, requireOperator, addBus);
router.post('/schedule', authenticateToken, requireOperator, createSchedule);

module.exports = router;
