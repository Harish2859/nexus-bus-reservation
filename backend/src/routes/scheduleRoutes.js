const express = require('express');
const router = express.Router();
const { searchSchedules, getBookedSeats } = require('../controllers/scheduleController');

router.get('/search', searchSchedules);
router.get('/:id/seats', getBookedSeats);

module.exports = router;
