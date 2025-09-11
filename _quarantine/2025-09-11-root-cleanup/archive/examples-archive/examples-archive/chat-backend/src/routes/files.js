const express = require('express');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');
const { uploadFile, deleteFile, getFileInfoFromUrl } = require('../middleware/upload');
const { catchAsync, AppError } = require('../middleware/error');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/files/upload
 * @desc    Upload file and create message
 * @access  Private
 */
router.post('/upload', uploadFile, catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  const { room = 'general' } = req.body;

  // Determine message type based on file type
  let messageType = 'file';
  if (req.file.mimetype.startsWith('image/')) {
    messageType = 'image';
  } else if (req.file.mimetype.startsWith('video/')) {
    messageType = 'video';
  }

  // Create message with file info
  const message = await Message.create({
    content: `Shared a ${messageType}: ${req.file.originalname}`,
    sender: req.user._id,
    room,
    messageType,
    fileUrl: req.file.path,
    fileName: req.file.originalname,
    fileSize: req.file.bytes
  });

  // Populate sender info
  await message.populate('sender', 'username email avatar');

  // Emit to Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(room).emit('newMessage', message);
  }

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      message,
      file: {
        url: req.file.path,
        originalName: req.file.originalname,
        size: req.file.bytes,
        type: req.file.mimetype
      }
    }
  });
}));

/**
 * @route   GET /api/files/media/:room
 * @desc    Get all media files for a room
 * @access  Private
 */
router.get('/media/:room', catchAsync(async (req, res, next) => {
  const { room } = req.params;
  const { limit = 20, skip = 0, type } = req.query;

  let query = {
    room,
    messageType: { $in: ['file', 'image', 'video'] }
  };

  // Filter by specific type if provided
  if (type && ['file', 'image', 'video'].includes(type)) {
    query.messageType = type;
  }

  const mediaMessages = await Message.find(query)
    .populate('sender', 'username email avatar')
    .select('fileUrl fileName fileSize messageType createdAt sender')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const totalCount = await Message.countDocuments(query);

  res.json({
    success: true,
    data: {
      media: mediaMessages,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasNext: skip + limit < totalCount
      }
    }
  });
}));

/**
 * @route   DELETE /api/files/:messageId
 * @desc    Delete file message and remove from cloud storage
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
    return next(new AppError('You can only delete your own files', 403));
  }

  // Check if message has a file
  if (!message.fileUrl) {
    return next(new AppError('Message does not contain a file', 400));
  }

  try {
    // Delete file from cloud storage
    const fileInfo = getFileInfoFromUrl(message.fileUrl);
    if (fileInfo) {
      await deleteFile(fileInfo.publicId);
    }
  } catch (error) {
    console.error('Error deleting file from cloud storage:', error);
    // Continue with message deletion even if cloud deletion fails
  }

  // Delete message
  await Message.findByIdAndDelete(messageId);

  // Emit to Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(message.room).emit('messageDeleted', { messageId });
  }

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
}));

/**
 * @route   GET /api/files/stats/:room
 * @desc    Get file upload statistics for a room
 * @access  Private
 */
router.get('/stats/:room', catchAsync(async (req, res, next) => {
  const { room } = req.params;

  // Aggregate file statistics
  const stats = await Message.aggregate([
    {
      $match: {
        room,
        messageType: { $in: ['file', 'image', 'video'] },
        fileSize: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$messageType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        averageSize: { $avg: '$fileSize' }
      }
    }
  ]);

  // Calculate totals
  const totals = stats.reduce((acc, stat) => {
    acc.totalFiles += stat.count;
    acc.totalSize += stat.totalSize;
    return acc;
  }, { totalFiles: 0, totalSize: 0 });

  res.json({
    success: true,
    data: {
      stats,
      totals: {
        ...totals,
        averageSize: totals.totalFiles > 0 ? totals.totalSize / totals.totalFiles : 0
      }
    }
  });
}));

/**
 * @route   GET /api/files/download/:messageId
 * @desc    Get download URL for file
 * @access  Private
 */
router.get('/download/:messageId', catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (!message.fileUrl) {
    return next(new AppError('Message does not contain a file', 400));
  }

  res.json({
    success: true,
    data: {
      downloadUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      messageType: message.messageType
    }
  });
}));

module.exports = router;