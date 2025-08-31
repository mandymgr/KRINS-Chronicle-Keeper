# 🚀 Real-Time Chat Backend API

Complete Node.js/Express backend with WebSocket support for real-time chat application. Built with enterprise-grade patterns and security features.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Rate limiting (100 req/15min general, 5 req/15min auth)
- CORS configuration with helmet security headers
- Input validation with Joi schemas
- Protected routes with authentication middleware

### 💬 Real-Time Messaging
- WebSocket communication with Socket.io
- Real-time message broadcasting
- Typing indicators and user presence
- Message read receipts and reactions
- Room-based chat organization

### 📁 File Management  
- Cloudinary integration for file uploads
- Support for images, documents, and videos (max 10MB)
- File type validation and security scanning
- Automatic message creation for shared files

### 📊 User Management
- Online/offline status tracking
- User search and profile management
- Avatar upload functionality
- User activity monitoring

### 🗄️ Data Persistence
- MongoDB with Mongoose ODM
- Optimized queries with indexes
- Message history with pagination
- User and message relationship management

## 🏗️ Architecture Patterns

### API Gateway Pattern
- Centralized route organization
- Consistent error handling
- Middleware-based request processing
- Version-controlled API endpoints

### Authentication Middleware Pattern
- JWT verification for protected routes
- Socket.io authentication integration
- Role-based access control ready
- Token refresh capabilities

### Error Handler Pattern
- Global error handling middleware
- Consistent error response format
- Development vs production error details
- Automatic error logging and monitoring

## 🚦 Quality Gates

✅ **Authentication**: JWT on all protected routes  
✅ **Validation**: Input validation with Joi/Zod  
✅ **Rate Limiting**: Spam prevention  
✅ **CORS**: Frontend integration configured  
✅ **WebSocket Auth**: Real-time connection security  
✅ **Database**: Error handling and connection management  

## 📁 Project Structure

```
src/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── error.js             # Error handling
│   └── upload.js            # File upload (Cloudinary)
├── models/
│   ├── User.js              # User schema
│   └── Message.js           # Message schema
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── messages.js          # Message CRUD operations
│   ├── users.js             # User management
│   └── files.js             # File upload/management
├── socket/
│   └── chatSocket.js        # WebSocket event handlers
└── server.js                # Main application entry
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user

### Messages
- `GET /api/messages` - Get messages with pagination
- `POST /api/messages` - Send new message
- `PUT /api/messages/:id` - Edit message (sender only)
- `DELETE /api/messages/:id` - Delete message (sender only)
- `POST /api/messages/:id/read` - Mark message as read
- `POST /api/messages/:id/react` - Add/remove reaction

### Users
- `GET /api/users/online` - Get online users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `GET /api/users/search` - Search users
- `POST /api/users/status` - Update online status

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/media/:room` - Get media files
- `DELETE /api/files/:messageId` - Delete file
- `GET /api/files/stats/:room` - File statistics

## 🔌 WebSocket Events

### Client → Server
- `join-room` - Join chat room
- `leave-room` - Leave chat room  
- `send-message` - Send real-time message
- `typing-start/stop` - Typing indicators
- `message-read` - Mark message as read
- `user-status` - Update online status

### Server → Client
- `new-message` - New message broadcast
- `user-online/offline` - User presence updates
- `user-typing` - Typing indicators
- `message-read-receipt` - Read confirmations
- `user-status-update` - Status changes
- `online-users` - Online users list

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- Cloudinary account (for file uploads)

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 🌐 Server URLs

- **API Base**: `http://localhost:5000/api`
- **WebSocket**: `ws://localhost:5000` 
- **Health Check**: `http://localhost:5000/health`

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with examples.

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific endpoints
curl -X GET http://localhost:5000/health
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Considerations
- Set `NODE_ENV=production`
- Use secure JWT secret (32+ characters)
- Configure MongoDB with authentication
- Set up proper CORS origins
- Use HTTPS in production
- Configure reverse proxy (nginx)

## 🔧 Development

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Consistent error handling patterns
- Comprehensive input validation

### Database Indexes
```javascript
// Optimized queries with indexes
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
```

## 🤝 Integration

### Frontend Integration
```javascript
// React/Vue.js example
import io from 'socket.io-client';

const socket = io('ws://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('new-message', (message) => {
  // Handle new message
});
```

### API Client Example
```javascript
// Axios example
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const messages = await api.get('/messages?room=general');
```

## 📊 Monitoring

### Health Check Response
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

### Performance Metrics
- Response time monitoring
- Database query optimization  
- Real-time connection tracking
- Error rate monitoring

## 🎯 Next Steps

### Potential Enhancements
- [ ] Redis for session management
- [ ] Message search functionality
- [ ] Voice/video call integration
- [ ] Push notification system
- [ ] Advanced file processing
- [ ] Message encryption
- [ ] Admin dashboard
- [ ] Analytics and reporting

---

**Built by Backend Specialist AI - Revolutionary Development System**

*This backend provides a complete foundation for real-time chat applications with enterprise-grade security, scalability, and maintainability.*