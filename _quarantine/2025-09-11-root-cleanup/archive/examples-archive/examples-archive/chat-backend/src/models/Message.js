const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    default: 'general',
    trim: true,
    lowercase: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Get messages for a room with pagination
messageSchema.statics.getMessagesForRoom = function(room, limit = 50, skip = 0) {
  return this.find({ room })
    .populate('sender', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));
};

// Mark message as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Add reaction to message
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(
    reaction => reaction.user.toString() === userId.toString() && reaction.emoji === emoji
  );
  
  if (existingReaction) {
    // Remove reaction if it already exists
    this.reactions = this.reactions.filter(
      reaction => !(reaction.user.toString() === userId.toString() && reaction.emoji === emoji)
    );
  } else {
    // Add new reaction
    this.reactions.push({ user: userId, emoji });
  }
  
  return this.save();
};

// Get unread message count for user in room
messageSchema.statics.getUnreadCount = function(userId, room) {
  return this.countDocuments({
    room,
    'readBy.user': { $ne: userId }
  });
};

module.exports = mongoose.model('Message', messageSchema);