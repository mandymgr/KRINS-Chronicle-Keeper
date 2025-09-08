# 🧠 KRINS Semantic Search Backend

Revolutionary AI memory system with pgvector and TensorFlow integration for the KRINS-Chronicle-Keeper platform.

## Features

- **🧠 Semantic Search** - Advanced similarity search using Universal Sentence Encoder
- **🗄️ pgvector Integration** - High-performance vector storage with PostgreSQL
- **🔍 Pattern Matching** - Intelligent code pattern recognition and analysis
- **🤖 AI Team Integration** - Seamless coordination with MCP AI Team Server
- **📊 Analytics** - Comprehensive search and pattern analytics
- **⚡ Performance** - Optimized with caching, batching, and connection pooling

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │  FastAPI Backend │    │ MCP AI Team     │
│   (port 3000)   │    │   (port 8000)    │    │  (port 3006)    │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  Semantic Search Backend │
                    │      (port 3003)         │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   PostgreSQL + pgvector  │
                    │    (Vector Database)     │
                    └──────────────────────────┘
```

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Python 3.8+ (for TensorFlow dependencies)

### Setup

1. **Install Dependencies**
```bash
cd semantic-search-backend
npm install
```

2. **Setup PostgreSQL with pgvector**
```bash
# Install pgvector extension
# On macOS with Homebrew:
brew install pgvector

# On Ubuntu/Debian:
sudo apt-get install postgresql-15-pgvector

# Enable extension in your database
psql -d krins_memory -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Initialize Database**
```bash
npm run init-db  # Creates tables and indexes
```

## Usage

### Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### API Endpoints

#### Health Check
```http
GET /health
```

#### Semantic Search
```http
POST /api/search/semantic
Content-Type: application/json

{
  "query": "React component with hooks",
  "filters": {
    "type": "code",
    "tags": ["react"]
  },
  "limit": 10,
  "threshold": 0.7
}
```

#### Store Memory
```http
POST /api/memory/store
Content-Type: application/json

{
  "content": "Custom React hook for data fetching",
  "type": "code",
  "metadata": {
    "language": "typescript",
    "framework": "react"
  },
  "tags": ["react", "hooks", "typescript"]
}
```

#### Pattern Matching
```http
POST /api/patterns/match
Content-Type: application/json

{
  "code": "export function useCustomHook() { ... }",
  "language": "typescript",
  "context": "React custom hook"
}
```

#### AI Team Sync
```http
POST /api/ai-team/sync
Content-Type: application/json

{
  "specialist_id": "frontend-specialist",
  "patterns": [
    {
      "name": "API Service Pattern",
      "type": "service",
      "code": "class ApiService { ... }",
      "language": "typescript"
    }
  ],
  "context": "Frontend development"
}
```

#### Analytics
```http
GET /api/analytics
```

## Integration with KRINS Systems

### MCP AI Team Server Integration

The semantic search backend seamlessly integrates with the MCP AI Team Server:

1. **Pattern Synchronization** - AI specialists can sync discovered patterns
2. **Context Sharing** - Shared knowledge base for all AI team members
3. **Learning Enhancement** - Continuous learning from AI interactions

### FastAPI Backend Integration

- **User Context** - Enrich searches with user-specific context
- **Project Patterns** - Store and retrieve project-specific code patterns
- **Authentication** - Secure access through FastAPI auth system

## Database Schema

### Core Tables

```sql
-- Main memory storage with vector embeddings
CREATE TABLE memories (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  type VARCHAR(100) DEFAULT 'general',
  embedding vector(512),  -- Universal Sentence Encoder vectors
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100) DEFAULT 'api'
);

-- AI patterns for code analysis
CREATE TABLE ai_patterns (
  id UUID PRIMARY KEY,
  pattern_name VARCHAR(200) NOT NULL,
  pattern_type VARCHAR(100) NOT NULL,
  pattern_content TEXT NOT NULL,
  pattern_embedding vector(512),
  language VARCHAR(50) DEFAULT 'typescript',
  specialist_id VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 100.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search analytics
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  query_embedding vector(512),
  results_count INTEGER DEFAULT 0,
  max_similarity FLOAT DEFAULT 0,
  search_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

```sql
-- Vector similarity indexes (HNSW for performance)
CREATE INDEX idx_memories_embedding_hnsw 
ON memories USING hnsw (embedding vector_cosine_ops);

-- Traditional indexes for filtering
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_tags ON memories USING gin(tags);
CREATE INDEX idx_memories_metadata ON memories USING gin(metadata);
```

## Performance Optimization

### Vector Indexing

- **HNSW Index** - Hierarchical Navigable Small World for fast approximate search
- **IVFFlat Index** - Inverted File Index for exact search fallback
- **Cosine Similarity** - Optimized for Universal Sentence Encoder vectors

### Caching Strategy

- **Embedding Cache** - LRU cache for frequently accessed embeddings
- **Pattern Cache** - Code pattern analysis results caching
- **Connection Pooling** - PostgreSQL connection pool with configurable limits

### Batch Processing

- **Batch Embeddings** - Process multiple texts in single TensorFlow operations
- **Bulk Insert** - Efficient bulk storage operations
- **Async Processing** - Non-blocking operations for better throughput

## Monitoring and Logging

### Metrics Tracked

- Total searches performed
- Average search response time
- Cache hit rates
- Pattern matching accuracy
- Database connection health

### Log Levels

- **ERROR** - System errors and failures
- **WARN** - Performance warnings and recoverable issues
- **INFO** - General operation information
- **DEBUG** - Detailed debugging information (development only)

## Development

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Code Quality

```bash
npm run lint            # ESLint analysis
npm run lint:fix        # Auto-fix linting issues
```

### Database Management

```bash
npm run db:reset        # Reset database schema
npm run db:seed         # Seed with sample data
npm run db:backup       # Create database backup
```

## Production Deployment

### Docker Deployment

```bash
# Build image
docker build -t krins-semantic-search .

# Run with docker-compose
docker-compose up -d
```

### Environment Variables

Key production environment variables:

```env
NODE_ENV=production
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-secure-password
LOG_LEVEL=warn
MAX_POOL_CONNECTIONS=50
```

### Performance Tuning

1. **Database Configuration**
   - Increase `shared_buffers` for PostgreSQL
   - Tune `work_mem` for vector operations
   - Configure `effective_cache_size`

2. **Application Tuning**
   - Adjust connection pool size
   - Configure embedding cache size
   - Optimize batch processing size

## Troubleshooting

### Common Issues

1. **pgvector Extension Not Found**
   ```bash
   # Install pgvector extension
   sudo apt-get install postgresql-15-pgvector
   # or on macOS
   brew install pgvector
   ```

2. **TensorFlow Loading Issues**
   ```bash
   # Reinstall TensorFlow dependencies
   npm uninstall @tensorflow/tfjs-node
   npm install @tensorflow/tfjs-node --build-from-source
   ```

3. **Memory Issues with Large Embeddings**
   - Reduce `EMBEDDING_BATCH_SIZE` in environment
   - Increase Node.js heap size: `--max-old-space-size=8192`

### Debug Mode

```bash
NODE_ENV=development DEBUG=krins:* npm run dev
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

---

**KRINS-Chronicle-Keeper - Revolutionary Organizational Intelligence System**