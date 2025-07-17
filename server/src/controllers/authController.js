const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { email, password, businessName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        error: { code: 'EMAIL_EXISTS', field: 'email' }
      });
    }

    // Send OTP instead of creating user immediately
    const otpResult = await emailService.sendOTP(email, businessName);
    
    // Store temporary registration data (could also use Redis)
    global.tempRegistrations = global.tempRegistrations || new Map();
    global.tempRegistrations.set(email, { password, businessName, timestamp: Date.now() });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email for verification',
      data: {
        email,
        otpExpires: otpResult.expirationDate
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: { code: 'REGISTRATION_ERROR' }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: { code: 'INVALID_CREDENTIALS' }
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: { code: 'INVALID_CREDENTIALS' }
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          businessName: user.businessName
        },
        token,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: { code: 'LOGIN_ERROR' }
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token valid',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          businessName: req.user.businessName
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification',
      error: { code: 'VERIFICATION_ERROR' }
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: { code: 'EMAIL_REQUIRED' }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered and verified',
        error: { code: 'EMAIL_EXISTS' }
      });
    }

    const otpResult = await emailService.sendOTP(email);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        otpExpires: otpResult.expirationDate
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: { code: 'OTP_SEND_ERROR' }
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, businessName } = req.body;

    // Verify OTP
    const otpVerification = emailService.verifyOTP(email, otp);
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.error,
        error: { code: 'INVALID_OTP' }
      });
    }

    // Get temp registration data
    const tempData = global.tempRegistrations?.get(email) || { password, businessName };
    
    // Create user
    const user = new User({
      email,
      password: tempData.password,
      businessName: tempData.businessName,
      isEmailVerified: true,
      authProvider: 'email'
    });

    await user.save();

    // Clean up temp data
    if (global.tempRegistrations) {
      global.tempRegistrations.delete(email);
    }

    const token = generateToken(user._id);

    // Send welcome email
    await emailService.sendWelcomeEmail(email, tempData.businessName);

    res.status(201).json({
      success: true,
      message: 'Email verified and registration completed',
      data: {
        user: {
          id: user._id,
          email: user.email,
          businessName: user.businessName,
          isEmailVerified: user.isEmailVerified
        },
        token,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: { code: 'VERIFICATION_ERROR' }
    });
  }
};

module.exports = {
  register,
  sendOTP,
  verifyOTP,
  login,
  verifyToken
};
