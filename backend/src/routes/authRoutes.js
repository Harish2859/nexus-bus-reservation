const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { getUserDashboard } = require('../controllers/userController');
const { cancelBooking } = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', authenticateToken, getUserDashboard);
router.post('/cancel-booking', authenticateToken, cancelBooking);

module.exports = router;
