const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');
const { validateBookingPayload } = require('../config/validate');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, validateBookingPayload, createBooking);

module.exports = router;
