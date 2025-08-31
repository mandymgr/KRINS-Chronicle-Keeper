# Dev Memory OS - Semantic Search System

## 🌟 Revolutionary AI-Powered Semantic Search

This directory contains the implementation of pgvector semantic search for the Dev Memory OS system, integrated with Krin's AI team coordination infrastructure.

## 🏗️ System Architecture

```
src/
├── server.js                    # Main Express server (Port 3003)
├── database/
│   ├── connection.js           # PostgreSQL + pgvector connection
│   └── queries.js              # Semantic search queries
├── embedding/
│   ├── embedding-service.js    # OpenAI embeddings integration
│   └── adr-batch-processor.js  # Bulk ADR processing
└── api/
    ├── search/
    │   └── semantic-search.js  # Natural language search API
    ├── embeddings/
    │   └── batch-processor.js  # Batch processing endpoints
    └── patterns/
        └── recommendations.js  # AI pattern recommendations
```

## 🚀 Quick Start

### Prerequisites
1. **PostgreSQL with pgvector extension**
   ```bash
   # Using Docker
   cd database/
   docker-compose up -d
   ```

2. **OpenAI API Key**
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Dependencies**
   ```bash
   npm install
   ```

### Initialize Database
```bash
# Initialize database schema
psql -h localhost -U devmemory -d dev_memory_os -f database/init.sql
```

### Start Services

1. **Start Semantic Search Server**
   ```bash
   npm run semantic-server:dev
   # Server starts on http://localhost:3003
   ```

2. **Process Existing ADRs** (in another terminal)
   ```bash
   # Dry run first to see what will be processed
   npm run process-adrs:dry
   
   # Process all ADRs and generate embeddings
   npm run process-adrs
   ```

3. **Start Webhook System** (for coordination)
   ```bash
   npm run webhook:dev
   # Webhook system on http://localhost:3002
   ```

## 📊 API Endpoints

### 🔍 Semantic Search
```http
POST /api/search/semantic
Content-Type: application/json

{
  "query": "How do we handle authentication in microservices?",
  "content_types": ["adrs", "patterns"],
  "similarity_threshold": 0.7,
  "max_results": 10
}
```

### 🔗 Similar ADR Finder
```http
GET /api/search/similar/adr-uuid-here?similarity_threshold=0.6&max_results=5
```

### 🧠 Pattern Recommendations
```http
GET /api/patterns/recommend?query=authentication&context_tags=microservices,security
```

### ⚡ Batch Processing
```http
POST /api/embeddings/process
Content-Type: application/json

{
  "type": "adrs",
  "dry_run": false,
  "project_name": "Dev Memory OS"
}
```

## 🎯 Key Features

### ✨ Natural Language Search
- **Semantic Understanding**: Search using natural language queries
- **Multi-Content Types**: Search across ADRs, patterns, and knowledge artifacts
- **Contextual Filtering**: Filter by project, component, tags, etc.
- **Similarity Scoring**: Cosine similarity with configurable thresholds

### 🤖 AI-Powered Recommendations
- **Pattern Matching**: Find relevant patterns for specific problems
- **ADR-to-Pattern Mapping**: Suggest patterns based on architectural decisions
- **Trending Analysis**: Identify popular patterns based on usage
- **Context-Aware**: Consider technology stack and team context

### 📈 Batch Processing
- **Background Jobs**: Asynchronous processing with job tracking
- **Bulk Operations**: Process entire ADR directories at once
- **Progress Monitoring**: Real-time job status and progress tracking
- **Error Handling**: Robust retry logic and error reporting

### 🔄 Webhook Integration
- **Auto-Processing**: Automatically generate embeddings for new ADRs
- **Real-time Updates**: Sync with webhook system on port 3002
- **Event Coordination**: Handle ADR creation/update events

## 🛠️ Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your-openai-api-key

# Database (optional, defaults provided)
DB_HOST=localhost
DB_PORT=5432
DB_USER=devmemory
DB_PASSWORD=devmemory_secure_password_2024
DB_NAME=dev_memory_os

# Server (optional)
PORT=3003
NODE_ENV=development
API_KEY=optional-api-key-for-production
```

### OpenAI Configuration
- **Model**: `text-embedding-ada-002` (1536 dimensions)
- **Batch Size**: 100 texts per API call
- **Rate Limiting**: 500ms delay between batches
- **Retry Logic**: 3 attempts with exponential backoff

### Database Configuration
- **Vector Dimensions**: 1536 (OpenAI ada-002 standard)
- **Index Type**: IVFFlat with cosine distance
- **Connection Pool**: 20 max connections
- **Query Timeout**: 2 seconds

## 🔧 Development

### Running Tests
```bash
# Health check
curl http://localhost:3003/health

# Test semantic search
curl -X POST http://localhost:3003/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "database architecture decisions"}'
```

### Adding New Content Types
1. Add table schema to `database/init.sql`
2. Add queries to `database/queries.js`
3. Add processing logic to embedding services
4. Add API endpoints in appropriate modules

### Monitoring
- **Health Endpoint**: `GET /health`
- **Job Status**: `GET /api/embeddings/jobs`
- **Search Analytics**: `GET /api/search/analytics`
- **Server Logs**: Console output with request timing

## 🚨 Production Deployment

### Security
- Set `API_KEY` environment variable for authentication
- Use HTTPS in production
- Configure CORS origins appropriately
- Use connection pooling and rate limiting

### Performance
- Enable connection pooling (configured by default)
- Monitor query performance (slow query warnings at 1s)
- Use appropriate pgvector index parameters for your data size
- Consider caching frequently accessed embeddings

### Monitoring
- Health checks on `/health`
- Database connection monitoring
- OpenAI API rate limit monitoring
- Error tracking and alerting

## 📚 Integration Examples

### With Krin's AI Coordination System
```javascript
// Auto-process new ADRs from webhook
POST http://localhost:3003/webhook/coordinate
{
  "event": "new_adr_created",
  "data": { "adr_id": "uuid", "file_path": "/path/to/adr.md" },
  "source": "github_webhook"
}
```

### Frontend Integration
```javascript
// Search ADRs from frontend
const searchResults = await fetch('/api/search/semantic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userInput,
    content_types: ['adrs', 'patterns'],
    max_results: 20
  })
});
```

## 🎉 Success Metrics

- ✅ **Database Schema**: Complete with pgvector support
- ✅ **Embedding Service**: OpenAI integration with batch processing  
- ✅ **Search API**: Natural language queries with similarity scoring
- ✅ **Pattern Recommendations**: AI-powered suggestions
- ✅ **Webhook Integration**: Coordination with port 3002 system
- ✅ **Batch Processing**: Background job processing with monitoring

## 🤝 Team Coordination

This system is designed to integrate seamlessly with **Krin's AI Team Commander** and the existing webhook infrastructure. The semantic search capabilities enhance the revolutionary development workflow by providing:

1. **Instant Knowledge Discovery**: Find relevant ADRs and patterns instantly
2. **AI-Powered Insights**: Get pattern recommendations based on context
3. **Automated Processing**: Background embedding generation for new content
4. **Real-time Coordination**: Webhook-based integration with existing systems

Ready to revolutionize development knowledge management! 🚀