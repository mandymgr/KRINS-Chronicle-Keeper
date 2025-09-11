const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateSocket } = require('../middleware/auth');

/**
 * WebSocket Event Handlers for Real-time Chat
 * Manages user connections, messaging, and room management
 */
class ChatSocket {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userSockets = new Map(); // socketId -> user mapping
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    // Authentication middleware for Socket.io
    this.io.use(authenticateSocket);

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.username} (${socket.id})`);
      
      // Store user connection
      this.handleUserConnection(socket);

      // Socket event handlers
      socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
      socket.on('leave-room', (data) => this.handleLeaveRoom(socket, data));
      socket.on('send-message', (data) => this.handleSendMessage(socket, data));
      socket.on('typing-start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing-stop', (data) => this.handleTypingStop(socket, data));
      socket.on('message-read', (data) => this.handleMessageRead(socket, data));
      socket.on('user-status', (data) => this.handleUserStatus(socket, data));
      
      // Disconnect handler
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * Handle new user connection
   */
  async handleUserConnection(socket) {
    const user = socket.user;
    
    // Update user status in database
    await user.setOnlineStatus(true, socket.id);
    
    // Store connection mappings
    this.connectedUsers.set(user._id.toString(), socket.id);
    this.userSockets.set(socket.id, user);

    // Join user to their personal room for direct messages
    socket.join(`user-${user._id}`);

    // Broadcast user online status
    socket.broadcast.emit('user-online', {
      userId: user._id,
      username: user.username,
      avatar: user.avatar,
      isOnline: true
    });

    // Send updated online users list to the connected user
    const onlineUsers = await User.getOnlineUsers();
    socket.emit('online-users', onlineUsers);
  }

  /**
   * Handle user joining a room
   */
  async handleJoinRoom(socket, data) {
    try {
      const { room } = data;
      
      if (!room || typeof room !== 'string') {
        socket.emit('error', { message: 'Invalid room name' });
        return;
      }

      // Join the room
      socket.join(room);
      
      // Notify room members
      socket.to(room).emit('user-joined-room', {
        userId: socket.user._id,
        username: socket.user.username,
        room
      });

      // Send confirmation to user
      socket.emit('joined-room', { room });
      
      console.log(`${socket.user.username} joined room: ${room}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle user leaving a room
   */
  handleLeaveRoom(socket, data) {
    try {
      const { room } = data;
      
      if (!room || typeof room !== 'string') {
        socket.emit('error', { message: 'Invalid room name' });
        return;
      }

      // Leave the room
      socket.leave(room);
      
      // Notify room members
      socket.to(room).emit('user-left-room', {
        userId: socket.user._id,
        username: socket.user.username,
        room
      });

      // Send confirmation to user
      socket.emit('left-room', { room });
      
      console.log(`${socket.user.username} left room: ${room}`);
    } catch (error) {
      console.error('Error leaving room:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }

  /**
   * Handle real-time message sending
   */
  async handleSendMessage(socket, data) {
    try {
      const { content, room = 'general', messageType = 'text' } = data;
      
      if (!content || content.trim().length === 0) {
        socket.emit('error', { message: 'Message content is required' });
        return;
      }

      if (content.length > 1000) {
        socket.emit('error', { message: 'Message too long (max 1000 characters)' });
        return;
      }

      // Create message in database
      const message = await Message.create({
        content: content.trim(),
        sender: socket.user._id,
        room,
        messageType
      });

      // Populate sender info
      await message.populate('sender', 'username email avatar');

      // Broadcast message to room
      this.io.to(room).emit('new-message', message);
      
      // Send confirmation to sender
      socket.emit('message-sent', { messageId: message._id });
      
      console.log(`Message sent by ${socket.user.username} in ${room}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing indicators
   */
  handleTypingStart(socket, data) {
    const { room = 'general' } = data;
    
    socket.to(room).emit('user-typing', {
      userId: socket.user._id,
      username: socket.user.username,
      room,
      isTyping: true
    });
  }

  /**
   * Handle stop typing indicators
   */
  handleTypingStop(socket, data) {
    const { room = 'general' } = data;
    
    socket.to(room).emit('user-typing', {
      userId: socket.user._id,
      username: socket.user.username,
      room,
      isTyping: false
    });
  }

  /**
   * Handle message read receipts
   */
  async handleMessageRead(socket, data) {
    try {
      const { messageId, room } = data;
      
      if (!messageId) {
        socket.emit('error', { message: 'Message ID is required' });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Mark message as read
      await message.markAsRead(socket.user._id);

      // Notify message sender (if different from current user)
      if (message.sender.toString() !== socket.user._id.toString()) {
        const senderSocketId = this.connectedUsers.get(message.sender.toString());
        if (senderSocketId) {
          this.io.to(senderSocketId).emit('message-read-receipt', {
            messageId,
            readBy: {
              userId: socket.user._id,
              username: socket.user.username
            }
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  /**
   * Handle user status updates
   */
  async handleUserStatus(socket, data) {
    try {
      const { isOnline } = data;
      
      if (typeof isOnline !== 'boolean') {
        socket.emit('error', { message: 'Invalid status value' });
        return;
      }

      // Update user status
      await socket.user.setOnlineStatus(isOnline, isOnline ? socket.id : null);

      // Broadcast status update
      socket.broadcast.emit('user-status-update', {
        userId: socket.user._id,
        username: socket.user.username,
        isOnline,
        lastSeen: socket.user.lastSeen
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  }

  /**
   * Handle user disconnect
   */
  async handleDisconnect(socket) {
    try {
      const user = this.userSockets.get(socket.id);
      if (!user) return;

      console.log(`User disconnected: ${user.username} (${socket.id})`);

      // Update user status in database
      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null
      });

      // Remove from connection mappings
      this.connectedUsers.delete(user._id.toString());
      this.userSockets.delete(socket.id);

      // Broadcast user offline status
      socket.broadcast.emit('user-offline', {
        userId: user._id,
        username: user.username,
        isOnline: false,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  /**
   * Send direct message to specific user
   */
  async sendDirectMessage(fromUserId, toUserId, content) {
    try {
      const toUserSocketId = this.connectedUsers.get(toUserId.toString());
      if (!toUserSocketId) {
        throw new Error('User not online');
      }

      const message = await Message.create({
        content,
        sender: fromUserId,
        room: `dm-${[fromUserId, toUserId].sort().join('-')}`,
        messageType: 'text'
      });

      await message.populate('sender', 'username email avatar');

      // Send to both users
      this.io.to(`user-${fromUserId}`).emit('new-message', message);
      this.io.to(`user-${toUserId}`).emit('new-message', message);

      return message;
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get room members count
   */
  getRoomMembersCount(room) {
    const roomSockets = this.io.sockets.adapter.rooms.get(room);
    return roomSockets ? roomSockets.size : 0;
  }
}

module.exports = ChatSocket;