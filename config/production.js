/**
 * Production Configuration for Dev Memory OS
 * Railway-optimized settings for production deployment
 */

module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3003,
        host: '0.0.0.0', // Railway requires binding to all interfaces
        environment: 'production',
        
        // Health check configuration
        healthCheck: {
            path: '/health',
            timeout: 30000,
            interval: 60000
        }
    },

    // Database Configuration
    database: {
        // Railway provides DATABASE_URL automatically
        connectionString: process.env.DATABASE_URL,
        
        // Connection pool settings for production
        pool: {
            max: 25,
            min: 5,
            idle: 10000,
            acquire: 60000,
            evict: 1000
        },
        
        // SSL configuration for Railway
        ssl: {
            rejectUnauthorized: false
        },
        
        // Vector search settings
        vectorDimensions: 1536,
        vectorIndexType: 'ivfflat',
        vectorLists: 100
    },

    // Security Configuration  
    security: {
        apiKey: process.env.API_KEY,
        jwtSecret: process.env.JWT_SECRET,
        
        // CORS settings
        cors: {
            origin: process.env.CORS_ORIGINS ? 
                process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) :
                ['https://*.railway.app'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
        },
        
        // Rate limiting
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            skipSuccessfulRequests: false,
            skipFailedRequests: false
        },
        
        // Request size limits
        requestLimits: {
            json: '10mb',
            urlencoded: '10mb',
            raw: '10mb'
        }
    },

    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'text-embedding-3-small',
        dimensions: 1536,
        timeout: 30000,
        retries: 3
    },

    // Feature Flags
    features: {
        vectorSearch: process.env.ENABLE_VECTOR_SEARCH !== 'false',
        batchProcessing: process.env.ENABLE_BATCH_PROCESSING !== 'false',
        realTimeChat: process.env.ENABLE_REAL_TIME_CHAT !== 'false',
        analytics: process.env.ENABLE_ANALYTICS !== 'false'
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        
        // Console logging for Railway
        console: true,
        
        // File logging (disabled in Railway)
        file: false,
        
        // Error tracking
        sentry: {
            dsn: process.env.SENTRY_DSN,
            environment: 'production',
            tracesSampleRate: 0.1
        }
    },

    // Monitoring Configuration
    monitoring: {
        // Performance monitoring
        performance: {
            enabled: true,
            sampleRate: 0.1,
            slowQueryThreshold: 1000
        },
        
        // Health checks
        health: {
            checks: [
                'database',
                'openai',
                'memory',
                'disk'
            ]
        }
    },

    // Cache Configuration
    cache: {
        // Redis configuration (if using Railway Redis addon)
        redis: {
            url: process.env.REDIS_URL,
            ttl: 3600,
            maxRetriesPerRequest: 3
        },
        
        // In-memory cache fallback
        memory: {
            max: 1000,
            ttl: 600000 // 10 minutes
        }
    },

    // File Storage Configuration
    storage: {
        // AWS S3 configuration
        s3: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            bucketName: process.env.AWS_S3_BUCKET_NAME,
            region: process.env.AWS_REGION || 'us-east-1'
        },
        
        // Local storage (disabled in production)
        local: {
            enabled: false
        }
    },

    // Email Configuration
    email: {
        service: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY,
        from: process.env.FROM_EMAIL || 'noreply@devmemory.os',
        
        // Email templates
        templates: {
            welcome: 'welcome-template-id',
            resetPassword: 'reset-password-template-id'
        }
    },

    // Analytics Configuration
    analytics: {
        googleAnalytics: {
            measurementId: process.env.GOOGLE_ANALYTICS_ID
        },
        
        // Custom analytics
        internal: {
            enabled: true,
            batchSize: 100,
            flushInterval: 30000
        }
    }
};

// Validation function to check required environment variables
function validateConfig() {
    const required = [
        'DATABASE_URL',
        'OPENAI_API_KEY',
        'API_KEY',
        'JWT_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing);
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are present');
}

// Auto-validate when loaded
if (require.main !== module) {
    validateConfig();
}

module.exports.validateConfig = validateConfig;