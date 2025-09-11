import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  userId: Types.ObjectId;
  username: string;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isEdited: boolean;
  editedAt?: Date;
  reactions: Array<{
    userId: Types.ObjectId;
    emoji: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  toPublicJSON(): object;
}

const ReactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emoji: {
    type: String,
    required: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MessageSchema: Schema<IMessage> = new Schema({
  text: {
    type: String,
    required: [true, 'Message text is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['text', 'file', 'system'],
      message: 'Type must be either text, file, or system'
    },
    default: 'text'
  },
  fileUrl: {
    type: String,
    validate: {
      validator: function(this: IMessage, value: string) {
        // Only required if type is 'file'
        if (this.type === 'file' && !value) {
          return false;
        }
        if (value && !isValidUrl(value)) {
          return false;
        }
        return true;
      },
      message: 'File URL is required for file messages and must be a valid URL'
    }
  },
  fileName: {
    type: String,
    validate: {
      validator: function(this: IMessage, value: string) {
        // Only required if type is 'file'
        return this.type !== 'file' || (value && value.length > 0);
      },
      message: 'File name is required for file messages'
    },
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  fileSize: {
    type: Number,
    min: [0, 'File size cannot be negative'],
    max: [50 * 1024 * 1024, 'File size cannot exceed 50MB']
  },
  mimeType: {
    type: String,
    maxlength: [100, 'MIME type cannot exceed 100 characters']
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  reactions: [ReactionSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
MessageSchema.index({ createdAt: -1 }); // For chronological queries
MessageSchema.index({ userId: 1, createdAt: -1 }); // For user-specific queries
MessageSchema.index({ type: 1, createdAt: -1 }); // For filtering by type

// Helper function to validate URLs
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// Pre-save middleware to set editedAt when message is edited
MessageSchema.pre<IMessage>('save', function(next) {
  if (this.isModified('text') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Instance method to add reaction
MessageSchema.methods.addReaction = function(userId: Types.ObjectId, emoji: string) {
  // Remove existing reaction from same user with same emoji
  this.reactions = this.reactions.filter(
    (reaction: any) => !(reaction.userId.equals(userId) && reaction.emoji === emoji)
  );
  
  // Add new reaction
  this.reactions.push({
    userId,
    emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove reaction
MessageSchema.methods.removeReaction = function(userId: Types.ObjectId, emoji: string) {
  this.reactions = this.reactions.filter(
    (reaction: any) => !(reaction.userId.equals(userId) && reaction.emoji === emoji)
  );
  
  return this.save();
};

// Instance method to get reaction counts
MessageSchema.methods.getReactionCounts = function() {
  const counts: { [emoji: string]: number } = {};
  
  this.reactions.forEach((reaction: any) => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  
  return counts;
};

// Instance method to return public message data
MessageSchema.methods.toPublicJSON = function() {
  const messageObject = this.toObject();
  delete messageObject.__v;
  
  return {
    id: messageObject._id,
    text: messageObject.text,
    userId: messageObject.userId,
    username: messageObject.username,
    type: messageObject.type,
    fileUrl: messageObject.fileUrl,
    fileName: messageObject.fileName,
    fileSize: messageObject.fileSize,
    mimeType: messageObject.mimeType,
    isEdited: messageObject.isEdited,
    editedAt: messageObject.editedAt,
    reactions: messageObject.reactions,
    reactionCounts: this.getReactionCounts(),
    timestamp: messageObject.createdAt,
    createdAt: messageObject.createdAt,
    updatedAt: messageObject.updatedAt
  };
};

// Static method to get messages with pagination
MessageSchema.statics.getMessages = function(options: {
  limit?: number;
  offset?: number;
  userId?: Types.ObjectId;
  type?: string;
  before?: Date;
  after?: Date;
}) {
  const {
    limit = 50,
    offset = 0,
    userId,
    type,
    before,
    after
  } = options;

  let query: any = {};
  
  if (userId) query.userId = userId;
  if (type) query.type = type;
  
  if (before || after) {
    query.createdAt = {};
    if (before) query.createdAt.$lt = before;
    if (after) query.createdAt.$gt = after;
  }

  return this.find(query)
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

// Static method to get recent messages
MessageSchema.statics.getRecentMessages = function(limit: number = 50) {
  return this.find({})
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Virtual for message age
MessageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual to check if message is recent (within last hour)
MessageSchema.virtual('isRecent').get(function() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  return this.createdAt.getTime() > oneHourAgo;
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);