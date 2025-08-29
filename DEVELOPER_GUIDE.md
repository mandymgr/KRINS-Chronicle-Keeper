# 👨‍💻 Developer Guide - Dev Memory OS

Complete development guide for contributing to Dev Memory OS with PostgreSQL, pgvector, React 18, and Vite 4.4.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+ with pgvector extension
- OpenAI API key
- Git

### Local Setup

```bash
# Clone repository
git clone https://github.com/mandymgr/Krins-Dev-Memory-OS.git
cd Krins-Dev-Memory-OS

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Setup environment
cp .env.template .env
# Edit .env with your configuration

# Setup database
createdb dev_memory_os
npm run db:init
npm run migrate
npm run db:seed

# Start development servers
npm run start:dev        # Backend API (port 3003)
cd frontend && npm run dev  # Frontend (port 3000)
```

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React 18      │    │   Express API    │    │  PostgreSQL     │
│   Frontend      │◄──►│   + pgvector     │◄──►│  + pgvector     │
│   (Vite 4.4)    │    │   Semantic       │    │   Vector DB     │
└─────────────────┘    │   Search         │    └─────────────────┘
                       └──────────────────┘             ▲
                                ▲                       │
                                │                       ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   OpenAI API     │    │   Monitoring    │
                       │   Embeddings     │    │   & Logging     │
                       └──────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18.2.0**: Modern React with concurrent features
- **Vite 4.4.5**: Fast build tool and dev server
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling
- **React Query**: Server state management
- **React Router**: Client-side routing

#### Backend  
- **Node.js 18+**: Runtime environment
- **Express 5.1.0**: Web framework
- **PostgreSQL 15+**: Primary database
- **pgvector**: Vector similarity search
- **OpenAI API**: Embedding generation
- **Winston**: Structured logging
- **JWT**: Authentication

#### Infrastructure
- **Railway**: Cloud deployment platform
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline

---

## 📁 Project Structure

```
dev-memory-os-starter/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # React components
│   │   │   ├── 📁 search/      # Search components
│   │   │   ├── 📁 patterns/    # Pattern components
│   │   │   ├── 📁 adr/        # ADR components
│   │   │   └── 📁 ui/         # UI components
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 utils/          # Utility functions
│   │   ├── 📁 types/          # TypeScript definitions
│   │   └── 📁 contexts/       # React contexts
│   ├── package.json
│   └── vite.config.ts
├── 📁 backend/                  # Express API server
│   ├── 📁 api/                 # API route handlers
│   │   ├── 📁 search/         # Search endpoints
│   │   ├── 📁 patterns/       # Pattern endpoints
│   │   └── 📁 embeddings/     # Embedding endpoints
│   ├── 📁 database/           # Database utilities
│   │   ├── connection.js      # DB connection pool
│   │   └── queries.js         # Database queries
│   ├── 📁 embedding/          # OpenAI integration
│   ├── 📁 middleware/         # Express middleware
│   ├── 📁 utils/             # Backend utilities
│   └── server.js             # Main server file
├── 📁 database/                # Database management
│   ├── init.sql              # Database schema
│   ├── migrate.js            # Migration system
│   └── seed.js               # Sample data
├── 📁 config/                  # Configuration files
├── 📁 scripts/                # Build and utility scripts
├── 📁 docs/                   # Documentation
├── railway.toml              # Railway configuration
├── Dockerfile               # Container configuration
└── package.json             # Root package.json
```

---

## 🔧 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/semantic-search-improvements

# Make changes...

# Run tests and linting
npm test
npm run lint

# Commit with ADR reference (if needed)
git commit -m "feat: improve semantic search accuracy

References: ADR-001 (semantic search implementation)"

# Push and create PR
git push origin feature/semantic-search-improvements
```

### 2. Database Changes

```bash
# Create migration file
touch database/migrations/003_add_user_preferences.sql

# Write SQL migration
# Run migration
npm run migrate

# Test migration works
npm run test:integration
```

### 3. API Development

#### Adding New Endpoint

```javascript
// backend/api/search/new-endpoint.js
const express = require('express');
const router = express.Router();

router.get('/new-feature', async (req, res) => {
    try {
        // Implementation
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('New feature error:', error);
        res.status(500).json({ 
            error: 'Failed to execute new feature',
            code: 'NEW_FEATURE_ERROR'
        });
    }
});

module.exports = router;
```

#### Adding to Main Server

```javascript
// backend/server.js
const newFeatureRoutes = require('./api/search/new-endpoint');
this.app.use('/api/search', newFeatureRoutes);
```

### 4. Frontend Development

#### Adding New Component

```typescript
// frontend/src/components/search/NewSearchFeature.tsx
import React, { useState } from 'react';

interface NewSearchFeatureProps {
    onResults: (results: any[]) => void;
}

export default function NewSearchFeature({ onResults }: NewSearchFeatureProps) {
    const [loading, setLoading] = useState(false);
    
    // Implementation
    
    return (
        <div className="new-search-feature">
            {/* UI components */}
        </div>
    );
}
```

#### Adding API Integration

```typescript
// frontend/src/hooks/useNewFeature.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';

export function useNewFeature() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const executeFeature = useCallback(async (params: any) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.get('/api/search/new-feature', { params });
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    
    return { data, loading, error, executeFeature };
}
```

---

## 🧪 Testing

### Backend Testing

```javascript
// backend/test/search.test.js
const request = require('supertest');
const app = require('../server');

describe('Semantic Search API', () => {
    test('should return relevant results', async () => {
        const response = await request(app)
            .post('/api/search/semantic')
            .set('X-API-Key', process.env.TEST_API_KEY)
            .send({
                query: 'authentication patterns',
                max_results: 5
            });
            
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.total_results).toBeGreaterThan(0);
    });
    
    test('should handle invalid queries', async () => {
        const response = await request(app)
            .post('/api/search/semantic')
            .set('X-API-Key', process.env.TEST_API_KEY)
            .send({ query: '' });
            
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('INVALID_QUERY');
    });
});
```

### Frontend Testing

```typescript
// frontend/src/components/search/SemanticSearch.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SemanticSearch from './SemanticSearch';

// Mock API client
vi.mock('@/utils/apiClient', () => ({
    apiClient: {
        post: vi.fn()
    }
}));

describe('SemanticSearch', () => {
    test('should perform search on form submission', async () => {
        const mockResults = {
            success: true,
            results_by_type: { adrs: [], patterns: [] }
        };
        
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResults });
        
        render(<SemanticSearch />);
        
        const input = screen.getByPlaceholderText(/search/i);
        const button = screen.getByRole('button', { name: /search/i });
        
        fireEvent.change(input, { target: { value: 'authentication' } });
        fireEvent.click(button);
        
        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/search/semantic',
                expect.objectContaining({
                    query: 'authentication'
                })
            );
        });
    });
});
```

### Database Testing

```javascript
// backend/test/database.test.js
const DatabaseQueries = require('../database/queries');
const { initializeDatabase } = require('../database/connection');

describe('Database Operations', () => {
    let db, queries;
    
    beforeAll(async () => {
        db = await initializeDatabase({
            database: 'dev_memory_os_test'
        });
        queries = new DatabaseQueries(db);
    });
    
    afterAll(async () => {
        await db.close();
    });
    
    test('should search similar ADRs', async () => {
        const mockEmbedding = new Array(1536).fill(0.1);
        
        const results = await queries.searchSimilarADRs(mockEmbedding, {
            threshold: 0.5,
            limit: 5
        });
        
        expect(Array.isArray(results)).toBe(true);
        results.forEach(result => {
            expect(result).toHaveProperty('similarity');
            expect(result.similarity).toBeGreaterThanOrEqual(0.5);
        });
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Watch mode (development)
npm run test:watch
```

---

## 🎯 Performance Optimization

### Backend Performance

#### Database Optimization

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM adrs WHERE embedding <=> '[...]' < 0.7;

-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Index optimization
REINDEX INDEX idx_adrs_embedding_cosine;
```

#### Connection Pool Tuning

```javascript
// backend/database/connection.js
const poolConfig = {
    max: 25,                    // Maximum connections
    min: 5,                     // Minimum connections
    idleTimeoutMillis: 30000,   // Idle timeout
    acquireTimeoutMillis: 10000 // Acquire timeout
};
```

#### Caching Strategy

```javascript
// backend/utils/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minute TTL

function cacheMiddleware(key, ttl = 600) {
    return (req, res, next) => {
        const cachedResult = cache.get(key);
        if (cachedResult) {
            return res.json(cachedResult);
        }
        
        // Override res.json to cache response
        const originalJson = res.json;
        res.json = function(body) {
            cache.set(key, body, ttl);
            originalJson.call(this, body);
        };
        
        next();
    };
}
```

### Frontend Performance

#### Code Splitting

```typescript
// frontend/src/App.tsx
import { lazy, Suspense } from 'react';

const SemanticSearch = lazy(() => import('./components/search/SemanticSearch'));
const PatternBrowser = lazy(() => import('./components/patterns/PatternBrowser'));

function App() {
    return (
        <div className="app">
            <Suspense fallback={<div>Loading...</div>}>
                <SemanticSearch />
            </Suspense>
        </div>
    );
}
```

#### React Query Optimization

```typescript
// frontend/src/hooks/useSemanticSearch.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useSemanticSearch(query: string) {
    const queryClient = useQueryClient();
    
    return useQuery({
        queryKey: ['semantic-search', query],
        queryFn: () => searchAPI.semantic({ query }),
        enabled: query.length > 2,
        staleTime: 5 * 60 * 1000,  // 5 minutes
        gcTime: 10 * 60 * 1000,    // 10 minutes
        retry: 2
    });
}
```

#### Bundle Analysis

```bash
# Analyze frontend bundle
cd frontend
npm run build
npm run analyze

# Check bundle size
ls -la dist/assets/
```

---

## 📊 Monitoring and Debugging

### Logging

#### Structured Logging

```javascript
// backend/utils/logger.js
const logger = require('./logger');

// Log with context
logger.info('Search performed', {
    query: searchQuery,
    results: resultCount,
    duration: processingTime,
    userId: user?.id
});

// Log errors with context
logger.error('Database query failed', {
    error: error.message,
    query: sqlQuery.substring(0, 100),
    userId: user?.id
});
```

#### Frontend Error Tracking

```typescript
// frontend/src/utils/errorTracking.ts
class ErrorTracker {
    static track(error: Error, context: Record<string, any> = {}) {
        console.error('Frontend error:', {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...context
        });
        
        // Send to monitoring service
        if (process.env.NODE_ENV === 'production') {
            // Send to Sentry, LogRocket, etc.
        }
    }
}
```

### Performance Monitoring

#### Custom Metrics

```javascript
// backend/utils/metrics.js
const monitoring = require('./monitoring');

function trackOperationTime(operation) {
    const timer = monitoring.startTimer();
    
    return {
        end: (metadata = {}) => {
            const duration = timer.end();
            monitoring.logEvent('operation_completed', {
                operation,
                duration,
                ...metadata
            });
        }
    };
}

// Usage
const timer = trackOperationTime('semantic_search');
// ... perform operation
timer.end({ results: resultCount, query: searchQuery });
```

#### Health Checks

```javascript
// backend/api/health.js
router.get('/health/detailed', async (req, res) => {
    const health = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {}
    };
    
    // Database check
    try {
        await db.query('SELECT 1');
        health.checks.database = { status: 'healthy', latency: '< 50ms' };
    } catch (error) {
        health.checks.database = { status: 'unhealthy', error: error.message };
        health.status = 'unhealthy';
    }
    
    // OpenAI API check
    try {
        const start = Date.now();
        await openai.embeddings.create({
            input: 'test',
            model: 'text-embedding-3-small'
        });
        const latency = Date.now() - start;
        health.checks.openai = { status: 'healthy', latency: `${latency}ms` };
    } catch (error) {
        health.checks.openai = { status: 'unhealthy', error: error.message };
    }
    
    res.json(health);
});
```

---

## 🔒 Security Best Practices

### Input Validation

```javascript
// backend/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

const searchValidation = [
    body('query')
        .isString()
        .isLength({ min: 1, max: 500 })
        .trim()
        .escape(),
    body('max_results')
        .optional()
        .isInt({ min: 1, max: 100 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];
```

### SQL Injection Prevention

```javascript
// backend/database/queries.js
async searchSimilarADRs(queryEmbedding, options = {}) {
    // Use parameterized queries
    const query = `
        SELECT id, title, similarity
        FROM search_similar_adrs($1, $2, $3, $4)
    `;
    
    const params = [
        `[${queryEmbedding.join(',')}]`,
        options.projectId,
        options.threshold || 0.7,
        options.limit || 10
    ];
    
    return await this.db.query(query, params);
}
```

### API Security

```javascript
// backend/middleware/security.js
const securityMiddleware = [
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"]
            }
        }
    }),
    rateLimiter,
    apiKeyAuth(),
    sanitizeInput()
];
```

---

## 📦 Deployment

### Local Production Testing

```bash
# Build for production
npm run build:railway

# Start in production mode
NODE_ENV=production npm run start:production

# Test production build
curl http://localhost:3003/health
```

### Railway Deployment

```bash
# Connect to Railway
railway login
railway link

# Deploy
git push origin main

# View logs
railway logs

# Run migrations
railway run npm run migrate
```

### Docker Development

```bash
# Build Docker image
docker build -t dev-memory-os .

# Run container
docker run -p 3003:3003 \
    -e DATABASE_URL=your-db-url \
    -e OPENAI_API_KEY=your-key \
    dev-memory-os
```

---

## 🤝 Contributing

### Code Style

- **ESLint**: Follow configured rules
- **Prettier**: Auto-format code
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow

```bash
# Feature branch naming
feature/semantic-search-improvements
bugfix/fix-embedding-generation
hotfix/critical-security-patch

# Commit message format
type(scope): description

feat(search): add hybrid search capability
fix(auth): resolve JWT token validation
docs(api): update endpoint documentation
```

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Run linting and tests
5. Create PR with ADR reference if needed
6. Request review from maintainers

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Error handling implemented
- [ ] Logging is appropriate

---

## 📚 Resources

### Documentation
- [Railway Docs](https://docs.railway.app/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [React 18 Docs](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### Tools
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL administration
- [Postman](https://www.postman.com/) - API testing
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [VS Code Extensions](https://marketplace.visualstudio.com/VSCode)

### Community
- [GitHub Discussions](https://github.com/mandymgr/Krins-Dev-Memory-OS/discussions)
- [Discord Server](https://discord.gg/your-server)
- [Railway Discord](https://discord.gg/railway)

---

## 🆘 Troubleshooting

### Common Issues

#### pgvector Installation
```bash
# macOS
brew install pgvector

# Ubuntu
sudo apt install postgresql-15-pgvector

# Verify installation
psql -c "CREATE EXTENSION vector;"
```

#### Memory Issues
```javascript
// Increase Node.js memory limit
node --max-old-space-size=4096 backend/server.js
```

#### CORS Errors
```javascript
// Update CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'https://your-domain.com'],
    credentials: true
};
```

### Getting Help

1. Check [GitHub Issues](https://github.com/mandymgr/Krins-Dev-Memory-OS/issues)
2. Search [Documentation](./API_DOCUMENTATION.md)
3. Ask in [Discord](https://discord.gg/your-server)
4. Create detailed bug report with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs

---

*Happy coding! 🚀*