/**
 * Production Security Middleware for Dev Memory OS
 * Comprehensive security measures for Railway deployment
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SecurityMiddleware {
    constructor(config = {}) {
        this.config = {
            apiKey: process.env.API_KEY,
            jwtSecret: process.env.JWT_SECRET,
            corsOrigins: process.env.CORS_ORIGINS ? 
                process.env.CORS_ORIGINS.split(',').map(o => o.trim()) :
                ['http://localhost:3000', 'https://*.railway.app'],
            rateLimitWindow: 15 * 60 * 1000, // 15 minutes
            rateLimitMax: 100,
            ...config
        };
        
        this.setupMiddleware();
    }

    setupMiddleware() {
        // Rate limiting configuration
        this.rateLimiter = rateLimit({
            windowMs: this.config.rateLimitWindow,
            max: this.config.rateLimitMax,
            message: {
                error: 'Too many requests',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(this.config.rateLimitWindow / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => {
                // Skip rate limiting for health checks
                return req.path === '/health';
            },
            keyGenerator: (req) => {
                // Use IP + User-Agent for more accurate rate limiting
                return crypto
                    .createHash('sha256')
                    .update(req.ip + req.get('User-Agent'))
                    .digest('hex');
            }
        });

        // Strict rate limiting for authentication endpoints
        this.authRateLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 attempts per window
            message: {
                error: 'Too many authentication attempts',
                code: 'AUTH_RATE_LIMIT_EXCEEDED'
            },
            skipSuccessfulRequests: true
        });

        // CORS configuration
        this.corsOptions = {
            origin: (origin, callback) => {
                // Allow requests with no origin (mobile apps, etc.)
                if (!origin) return callback(null, true);
                
                // Check against allowed origins
                const allowed = this.config.corsOrigins.some(allowedOrigin => {
                    if (allowedOrigin.includes('*')) {
                        const pattern = allowedOrigin.replace('*', '.*');
                        return new RegExp(pattern).test(origin);
                    }
                    return allowedOrigin === origin;
                });
                
                if (allowed) {
                    callback(null, true);
                } else {
                    console.warn(`CORS blocked request from origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With', 
                'Content-Type',
                'Accept',
                'Authorization',
                'X-API-Key'
            ],
            exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
        };

        // Helmet security configuration
        this.helmetOptions = {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                    scriptSrc: ["'self'", "https:"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://api.openai.com"],
                    fontSrc: ["'self'", "https:", "data:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false, // Disable for OpenAI API compatibility
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        };
    }

    // Apply basic security headers
    basicSecurity() {
        return helmet(this.helmetOptions);
    }

    // Apply CORS
    enableCORS() {
        return cors(this.corsOptions);
    }

    // Apply general rate limiting
    rateLimiting() {
        return this.rateLimiter;
    }

    // Apply authentication rate limiting
    authRateLimiting() {
        return this.authRateLimiter;
    }

    // API Key authentication middleware
    apiKeyAuth() {
        return (req, res, next) => {
            // Skip API key check for health endpoint
            if (req.path === '/health') {
                return next();
            }

            const apiKey = req.headers['x-api-key'] || req.query.api_key;
            
            // In development, allow requests without API key
            if (process.env.NODE_ENV === 'development' && !this.config.apiKey) {
                return next();
            }

            if (!apiKey) {
                return res.status(401).json({
                    error: 'API key required',
                    code: 'MISSING_API_KEY'
                });
            }

            // Secure comparison to prevent timing attacks
            const expectedKey = Buffer.from(this.config.apiKey || '', 'utf8');
            const providedKey = Buffer.from(apiKey, 'utf8');

            if (expectedKey.length !== providedKey.length || 
                !crypto.timingSafeEqual(expectedKey, providedKey)) {
                
                // Log security event
                console.warn('Invalid API key attempt:', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });

                return res.status(401).json({
                    error: 'Invalid API key',
                    code: 'INVALID_API_KEY'
                });
            }

            next();
        };
    }

    // JWT authentication middleware
    jwtAuth() {
        return (req, res, next) => {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    error: 'Authentication token required',
                    code: 'MISSING_TOKEN'
                });
            }

            try {
                const decoded = jwt.verify(token, this.config.jwtSecret);
                req.user = decoded;
                next();
            } catch (error) {
                console.warn('JWT verification failed:', {
                    error: error.message,
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                });

                return res.status(401).json({
                    error: 'Invalid authentication token',
                    code: 'INVALID_TOKEN'
                });
            }
        };
    }

    // Request sanitization middleware
    sanitizeInput() {
        return (req, res, next) => {
            // Sanitize query parameters
            if (req.query) {
                Object.keys(req.query).forEach(key => {
                    if (typeof req.query[key] === 'string') {
                        req.query[key] = this.sanitizeString(req.query[key]);
                    }
                });
            }

            // Sanitize request body (for text fields only)
            if (req.body && typeof req.body === 'object') {
                this.sanitizeObject(req.body);
            }

            next();
        };
    }

    // Security headers for API responses
    securityHeaders() {
        return (req, res, next) => {
            // Remove sensitive headers
            res.removeHeader('X-Powered-By');
            res.removeHeader('Server');

            // Add security headers
            res.set({
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
            });

            next();
        };
    }

    // SQL Injection protection for query parameters
    sqlInjectionProtection() {
        return (req, res, next) => {
            const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b|['";\-\-\/\*])/gi;
            
            // Check query parameters
            for (const [key, value] of Object.entries(req.query || {})) {
                if (typeof value === 'string' && sqlInjectionPattern.test(value)) {
                    console.warn('SQL injection attempt detected:', {
                        ip: req.ip,
                        parameter: key,
                        value: value.substring(0, 100),
                        timestamp: new Date().toISOString()
                    });

                    return res.status(400).json({
                        error: 'Invalid input detected',
                        code: 'INVALID_INPUT'
                    });
                }
            }

            next();
        };
    }

    // Helper method to sanitize strings
    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
    }

    // Helper method to recursively sanitize objects
    sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                obj[key] = this.sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object') {
                this.sanitizeObject(obj[key]);
            }
        });
    }

    // Error handling middleware
    errorHandler() {
        return (error, req, res, next) => {
            // Log error details
            console.error('Security error:', {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                ip: req.ip,
                method: req.method,
                path: req.path,
                timestamp: new Date().toISOString()
            });

            // Don't expose internal errors in production
            const isProduction = process.env.NODE_ENV === 'production';
            
            res.status(error.status || 500).json({
                error: isProduction ? 'Internal server error' : error.message,
                code: error.code || 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            });
        };
    }

    // Generate JWT token
    generateJWT(payload, expiresIn = '24h') {
        return jwt.sign(payload, this.config.jwtSecret, { 
            expiresIn,
            issuer: 'dev-memory-os',
            audience: 'dev-memory-os-clients'
        });
    }

    // Verify JWT token
    verifyJWT(token) {
        return jwt.verify(token, this.config.jwtSecret, {
            issuer: 'dev-memory-os',
            audience: 'dev-memory-os-clients'
        });
    }
}

module.exports = SecurityMiddleware;