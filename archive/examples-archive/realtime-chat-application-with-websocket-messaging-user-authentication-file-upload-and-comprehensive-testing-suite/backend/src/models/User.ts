import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): object;
}

const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ isActive: 1, lastSeen: -1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to return public user data
UserSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  
  return {
    id: userObject._id,
    username: userObject.username,
    email: userObject.email,
    avatar: userObject.avatar,
    isActive: userObject.isActive,
    lastSeen: userObject.lastSeen,
    createdAt: userObject.createdAt
  };
};

// Static method to find active users
UserSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true }).sort({ lastSeen: -1 });
};

// Static method to find by email or username
UserSchema.statics.findByEmailOrUsername = function(identifier: string) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
};

// Virtual for user status
UserSchema.virtual('isOnline').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastSeen > fiveMinutesAgo;
});

// Update lastSeen when user is accessed
UserSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model<IUser>('User', UserSchema);