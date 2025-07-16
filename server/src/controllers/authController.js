const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    const user = new User({
      email,
      password,
      businessName
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        userId: user._id,
        email: user.email,
        businessName: user.businessName
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

module.exports = {
  register,
  login,
  verifyToken
};