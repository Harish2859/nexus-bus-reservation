const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser } = require('../controllers/authController');
const { getUserDashboard } = require('../controllers/userController');
const { cancelBooking } = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/dashboard', authenticateToken, getUserDashboard);
router.post('/cancel-booking', authenticateToken, cancelBooking);

module.exports = router;
