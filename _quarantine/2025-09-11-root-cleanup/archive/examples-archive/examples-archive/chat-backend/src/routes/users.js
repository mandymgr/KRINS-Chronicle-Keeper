const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/error');
const { uploadFile } = require('../middleware/upload');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/users/online
 * @desc    Get all online users
 * @access  Private
 */
router.get('/online', catchAsync(async (req, res, next) => {
  const onlineUsers = await User.getOnlineUsers();
  
  res.json({
    success: true,
    data: {
      users: onlineUsers,
      count: onlineUsers.length
    }
  });
}));

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}));

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', catchAsync(async (req, res, next) => {
  const allowedFields = ['username'];
  const updates = {};

  // Filter allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  // Validate username if provided
  if (updates.username) {
    if (updates.username.length < 3 || updates.username.length > 30) {
      return next(new AppError('Username must be between 3 and 30 characters', 400));
    }

    // Check if username is taken
    const existingUser = await User.findOne({ 
      username: updates.username,
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      return next(new AppError('Username already exists', 400));
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
}));

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', uploadFile, catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Check if file is an image
  if (!req.file.mimetype.startsWith('image/')) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Update user avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Avatar updated successfully',
    data: {
      user: updatedUser,
      avatarUrl: req.file.path
    }
  });
}));

/**
 * @route   GET /api/users/search
 * @desc    Search users by username or email
 * @access  Private
 */
router.get('/search', catchAsync(async (req, res, next) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }

  const query = q.trim();
  const searchRegex = new RegExp(query, 'i');

  const users = await User.find({
    $or: [
      { username: searchRegex },
      { email: searchRegex }
    ],
    _id: { $ne: req.user._id } // Exclude current user
  })
  .select('username email avatar isOnline lastSeen')
  .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      count: users.length
    }
  });
}));

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile by ID
 * @access  Private
 */
router.get('/:userId', catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('username email avatar isOnline lastSeen createdAt');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

/**
 * @route   POST /api/users/status
 * @desc    Update user online status
 * @access  Private
 */
router.post('/status', catchAsync(async (req, res, next) => {
  const { isOnline } = req.body;

  if (typeof isOnline !== 'boolean') {
    return next(new AppError('isOnline must be a boolean value', 400));
  }

  await req.user.setOnlineStatus(isOnline);

  // Emit status update to all connected users
  if (req.app.get('io')) {
    req.app.get('io').emit('userStatusUpdate', {
      userId: req.user._id,
      username: req.user.username,
      isOnline,
      lastSeen: req.user.lastSeen
    });
  }

  res.json({
    success: true,
    message: 'Status updated successfully',
    data: {
      isOnline,
      lastSeen: req.user.lastSeen
    }
  });
}));

module.exports = router;