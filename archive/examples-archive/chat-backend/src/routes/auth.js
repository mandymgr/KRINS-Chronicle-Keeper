const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/error');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', catchAsync(async (req, res, next) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { username, email, password } = value;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    return next(new AppError(`${field} already exists`, 400));
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password
  });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toJSON();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      token
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', catchAsync(async (req, res, next) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { email, password } = value;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update user online status
  await user.setOnlineStatus(true);

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toJSON();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token
    }
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', catchAsync(async (req, res, next) => {
  // Note: In a real app, you might want to implement token blacklisting
  // For now, we'll just set the user as offline on the client side
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}));

module.exports = router;