require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import modules
const Database = require('./config/database');
const ChatSocket = require('./socket/chatSocket');
const { globalErrorHandler, notFound } = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');

/**
 * Express Application Setup
 * Real-time Chat Backend API with WebSocket support
 */
class ChatServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 5000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          process.env.FRONTEND_URL
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };

    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply rate limiting to auth routes more strictly
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs for auth
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
      }
    });

    this.app.use('/api/', limiter);
    this.app.use('/api/auth/', authLimiter);

    // General middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
        next();
      });
    }

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: Database.getConnectionState()
      });
    });
  }

  setupRoutes() {
    // API routes with versioning
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/messages', messageRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/files', fileRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Chat Backend API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          messages: '/api/messages',
          users: '/api/users',
          files: '/api/files',
          health: '/health',
          docs: '/api/docs'
        }
      });
    });
  }

  setupSocket() {
    // Socket.io configuration
    this.io = socketIo(this.server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Make io available to routes
    this.app.set('io', this.io);

    // Initialize chat socket handlers
    this.chatSocket = new ChatSocket(this.io);

    console.log('✅ Socket.io configured successfully');
  }

  setupErrorHandling() {
    // Handle 404 errors
    this.app.use(notFound);

    // Global error handler
    this.app.use(globalErrorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('💥 Unhandled Rejection:', err);
      this.server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  async gracefulShutdown(signal) {
    console.log(`🔄 Received ${signal}. Starting graceful shutdown...`);
    
    this.server.close(async () => {
      console.log('📦 HTTP server closed');
      
      try {
        await Database.disconnect();
        console.log('📦 Database connection closed');
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force close after timeout
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }

  async start() {
    try {
      // Connect to database
      await Database.connect();

      // Start server
      this.server.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 Socket.io ready for connections`);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔗 API Base URL: http://localhost:${this.port}/api`);
          console.log(`💚 Health Check: http://localhost:${this.port}/health`);
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Initialize and start server
const chatServer = new ChatServer();
chatServer.start();

module.exports = chatServer;