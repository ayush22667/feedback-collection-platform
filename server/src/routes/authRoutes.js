const express = require('express');
const { 
  register, 
  login, 
  verifyToken, 
  sendOTP, 
  verifyOTP
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Email/Password Authentication
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/verify', authenticateToken, verifyToken);

// OTP Verification
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
