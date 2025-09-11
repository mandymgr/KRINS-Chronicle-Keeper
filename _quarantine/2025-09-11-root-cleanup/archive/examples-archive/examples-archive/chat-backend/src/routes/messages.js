const express = require('express');
const Joi = require('joi');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/error');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createMessageSchema = Joi.object({
  content: Joi.string().max(1000).required(),
  room: Joi.string().default('general'),
  messageType: Joi.string().valid('text', 'file', 'image').default('text')
});

const getMessagesSchema = Joi.object({
  room: Joi.string().default('general'),
  limit: Joi.number().min(1).max(100).default(50),
  skip: Joi.number().min(0).default(0)
});

/**
 * @route   GET /api/messages
 * @desc    Get messages for a room with pagination
 * @access  Private
 */
router.get('/', catchAsync(async (req, res, next) => {
  // Validate query parameters
  const { error, value } = getMessagesSchema.validate(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { room, limit, skip } = value;

  // Get messages for the room
  const messages = await Message.getMessagesForRoom(room, limit, skip);
  
  // Get total count for pagination
  const totalCount = await Message.countDocuments({ room });
  
  // Get unread count for current user
  const unreadCount = await Message.getUnreadCount(req.user._id, room);

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasNext: skip + limit < totalCount
      },
      unreadCount
    }
  });
}));

/**
 * @route   POST /api/messages
 * @desc    Create new message
 * @access  Private
 */
router.post('/', catchAsync(async (req, res, next) => {
  // Validate input
  const { error, value } = createMessageSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { content, room, messageType } = value;

  // Create message
  const message = await Message.create({
    content,
    room,
    messageType,
    sender: req.user._id
  });

  // Populate sender info
  await message.populate('sender', 'username email avatar');

  // Emit to Socket.io (will be handled by socket middleware)
  if (req.app.get('io')) {
    req.app.get('io').to(room).emit('newMessage', message);
  }

  res.status(201).json({
    success: true,
    message: 'Message created successfully',
    data: {
      message
    }
  });
}));

/**
 * @route   PUT /api/messages/:messageId
 * @desc    Edit message (only by sender)
 * @access  Private
 */
router.put('/:messageId', catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new AppError('Message content is required', 400));
  }

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only edit your own messages', 403));
  }

  // Check if message is not older than 24 hours
  const messageAge = Date.now() - message.createdAt.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  if (messageAge > twentyFourHours) {
    return next(new AppError('Cannot edit messages older than 24 hours', 403));
  }

  // Update message
  message.content = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  // Populate sender info
  await message.populate('sender', 'username email avatar');

  // Emit to Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(message.room).emit('messageEdited', message);
  }

  res.json({
    success: true,
    message: 'Message updated successfully',
    data: {
      message
    }
  });
}));

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete message (only by sender)
 * @access  Private
 */
router.delete('/:messageId', catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own messages', 403));
  }

  // Delete message
  await Message.findByIdAndDelete(messageId);

  // Emit to Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(message.room).emit('messageDeleted', { messageId });
  }

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

/**
 * @route   POST /api/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.post('/:messageId/read', catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  await message.markAsRead(req.user._id);

  res.json({
    success: true,
    message: 'Message marked as read'
  });
}));

/**
 * @route   POST /api/messages/:messageId/react
 * @desc    Add/remove reaction to message
 * @access  Private
 */
router.post('/:messageId/react', catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  if (!emoji) {
    return next(new AppError('Emoji is required', 400));
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  await message.addReaction(req.user._id, emoji);
  await message.populate('sender', 'username email avatar');

  // Emit to Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(message.room).emit('messageReaction', message);
  }

  res.json({
    success: true,
    message: 'Reaction updated successfully',
    data: {
      message
    }
  });
}));

module.exports = router;