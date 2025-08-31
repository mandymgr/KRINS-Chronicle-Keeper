# Real-Time Chat Backend API Documentation

## 🌟 Overview

Complete Node.js/Express backend API with WebSocket support for real-time chat application. Built with JWT authentication, file uploads, message persistence, and comprehensive user management.

**Base URL**: `http://localhost:5000/api`  
**WebSocket URL**: `ws://localhost:5000`

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "isOnline": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "isOnline": true,
      "lastSeen": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "isOnline": true
    }
  }
}
```

---

## 💬 Messages

### Message Endpoints

#### Get Messages
```http
GET /api/messages?room=general&limit=50&skip=0
```
*Requires Authentication*

**Query Parameters:**
- `room` (string, default: "general"): Room name
- `limit` (number, default: 50, max: 100): Number of messages
- `skip` (number, default: 0): Skip messages for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Hello everyone!",
        "sender": {
          "_id": "user_id",
          "username": "johndoe",
          "avatar": "avatar_url"
        },
        "room": "general",
        "messageType": "text",
        "isEdited": false,
        "reactions": [],
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "skip": 0,
      "hasNext": true
    },
    "unreadCount": 5
  }
}
```

#### Send Message
```http
POST /api/messages
```
*Requires Authentication*

**Request Body:**
```json
{
  "content": "Hello everyone!",
  "room": "general",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Hello everyone!",
      "sender": {
        "_id": "user_id",
        "username": "johndoe"
      },
      "room": "general",
      "messageType": "text",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

#### Edit Message
```http
PUT /api/messages/:messageId
```
*Requires Authentication (sender only)*

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

#### Delete Message
```http
DELETE /api/messages/:messageId
```
*Requires Authentication (sender only)*

#### Mark Message as Read
```http
POST /api/messages/:messageId/read
```
*Requires Authentication*

#### Add/Remove Reaction
```http
POST /api/messages/:messageId/react
```
*Requires Authentication*

**Request Body:**
```json
{
  "emoji": "👍"
}
```

---

## 👥 Users

### User Endpoints

#### Get Online Users
```http
GET /api/users/online
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "username": "johndoe",
        "email": "john@example.com",
        "avatar": "avatar_url",
        "isOnline": true,
        "lastSeen": "2025-01-01T00:00:00.000Z"
      }
    ],
    "count": 5
  }
}
```

#### Get User Profile
```http
GET /api/users/profile
```
*Requires Authentication*

#### Update Profile
```http
PUT /api/users/profile
```
*Requires Authentication*

**Request Body:**
```json
{
  "username": "newusername"
}
```

#### Upload Avatar
```http
POST /api/users/avatar
```
*Requires Authentication*

**Request:** Multipart form data with `file` field

#### Search Users
```http
GET /api/users/search?q=john&limit=10
```
*Requires Authentication*

#### Update User Status
```http
POST /api/users/status
```
*Requires Authentication*

**Request Body:**
```json
{
  "isOnline": true
}
```

---

## 📁 Files

### File Upload Endpoints

#### Upload File
```http
POST /api/files/upload
```
*Requires Authentication*

**Request:** Multipart form data
- `file`: File to upload (max 10MB)
- `room`: Room name (optional, default: "general")

**Supported file types:**
- Images: JPG, JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT
- Videos: MP4, MOV

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Shared an image: photo.jpg",
      "sender": {
        "_id": "user_id",
        "username": "johndoe"
      },
      "messageType": "image",
      "fileUrl": "https://cloudinary-url",
      "fileName": "photo.jpg",
      "fileSize": 1024000
    },
    "file": {
      "url": "https://cloudinary-url",
      "originalName": "photo.jpg",
      "size": 1024000,
      "type": "image/jpeg"
    }
  }
}
```

#### Get Media Files
```http
GET /api/files/media/:room?type=image&limit=20&skip=0
```
*Requires Authentication*

#### Delete File
```http
DELETE /api/files/:messageId
```
*Requires Authentication (sender only)*

#### Get File Statistics
```http
GET /api/files/stats/:room
```
*Requires Authentication*

---

## 🔌 WebSocket Events

### Connection & Authentication

**Client connects to**: `ws://localhost:5000`

**Authentication**: Send JWT token in connection handshake
```javascript
const socket = io('ws://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client → Server Events

#### Join Room
```javascript
socket.emit('join-room', { room: 'general' });
```

#### Leave Room
```javascript
socket.emit('leave-room', { room: 'general' });
```

#### Send Message
```javascript
socket.emit('send-message', {
  content: 'Hello everyone!',
  room: 'general',
  messageType: 'text'
});
```

#### Start Typing
```javascript
socket.emit('typing-start', { room: 'general' });
```

#### Stop Typing
```javascript
socket.emit('typing-stop', { room: 'general' });
```

#### Mark Message Read
```javascript
socket.emit('message-read', {
  messageId: 'message_id',
  room: 'general'
});
```

#### Update Status
```javascript
socket.emit('user-status', { isOnline: true });
```

### Server → Client Events

#### New Message
```javascript
socket.on('new-message', (message) => {
  // Handle new message
});
```

#### User Online
```javascript
socket.on('user-online', (user) => {
  // Handle user coming online
});
```

#### User Offline
```javascript
socket.on('user-offline', (user) => {
  // Handle user going offline
});
```

#### User Typing
```javascript
socket.on('user-typing', (data) => {
  // data: { userId, username, room, isTyping }
});
```

#### User Joined Room
```javascript
socket.on('user-joined-room', (data) => {
  // data: { userId, username, room }
});
```

#### User Left Room
```javascript
socket.on('user-left-room', (data) => {
  // data: { userId, username, room }
});
```

#### Message Read Receipt
```javascript
socket.on('message-read-receipt', (data) => {
  // data: { messageId, readBy: { userId, username } }
});
```

#### User Status Update
```javascript
socket.on('user-status-update', (data) => {
  // data: { userId, username, isOnline, lastSeen }
});
```

#### Online Users List
```javascript
socket.on('online-users', (users) => {
  // Array of online users
});
```

#### Error Handling
```javascript
socket.on('error', (error) => {
  // Handle socket errors
});
```

---

## 📊 Health & Status

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

---

## 🚨 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Messages
- `"Access token required"` - Missing JWT token
- `"Invalid token"` - Invalid or expired JWT
- `"User not found"` - User doesn't exist
- `"Invalid email or password"` - Login failed
- `"Too many requests"` - Rate limit exceeded
- `"File too large"` - File exceeds 10MB limit

---

## 🛡️ Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP

### Input Validation
- All inputs validated with Joi schemas
- File type and size restrictions
- SQL injection and XSS protection

### Security Headers
- Helmet.js for security headers
- CORS configuration for frontend domains
- Content Security Policy

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt (12 rounds)
- Socket.io authentication middleware

---

## 🚀 Getting Started

### Environment Variables
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Installation & Running
```bash
cd chat-backend
npm install
npm run dev
```

### Server will run on:
- **HTTP API**: `http://localhost:5000`
- **WebSocket**: `ws://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

---

**Generated by Backend Specialist AI - Revolutionary Development System**