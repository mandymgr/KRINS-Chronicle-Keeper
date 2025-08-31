# 🔌 Dev Memory OS API Documentation

Complete API reference for the Dev Memory OS semantic search and knowledge management system.

## 🌍 Base URL

**Development**: `http://localhost:3003`  
**Production**: `https://your-app.railway.app`

## 🔐 Authentication

### API Key Authentication

Include API key in requests:

```bash
# Header method (recommended)
curl -H "X-API-Key: your-api-key" https://your-app.railway.app/api/endpoint

# Query parameter method
curl "https://your-app.railway.app/api/endpoint?api_key=your-api-key"
```

### JWT Authentication (for user-specific operations)

```bash
curl -H "Authorization: Bearer your-jwt-token" https://your-app.railway.app/api/endpoint
```

---

## 🔍 Search Endpoints

### 1. Semantic Search

**POST** `/api/search/semantic`

Natural language search across ADRs, patterns, and knowledge artifacts.

#### Request Body
```json
{
  "query": "database architecture decisions",
  "project_id": "uuid-optional",
  "content_types": ["adrs", "patterns", "knowledge"],
  "similarity_threshold": 0.7,
  "max_results": 20,
  "user_id": "uuid-optional"
}
```

#### Response
```json
{
  "success": true,
  "query": "database architecture decisions",
  "similarity_threshold": 0.7,
  "total_results": 15,
  "results_by_type": {
    "adrs": [
      {
        "id": "uuid",
        "type": "adr",
        "title": "Use pgvector for semantic search",
        "similarity": 0.8456,
        "project_name": "Dev Memory OS",
        "component_name": "Backend API",
        "status": "accepted",
        "problem_statement": "We need to implement semantic search...",
        "created_at": "2024-01-15T10:30:00Z",
        "url": "/api/adrs/uuid"
      }
    ],
    "patterns": [...],
    "knowledge": [...]
  },
  "timestamp": "2024-01-15T14:20:00Z"
}
```

#### Example
```bash
curl -X POST https://your-app.railway.app/api/search/semantic \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "query": "authentication patterns",
    "content_types": ["patterns", "adrs"],
    "similarity_threshold": 0.6,
    "max_results": 10
  }'
```

### 2. Hybrid Search

**POST** `/api/search/hybrid`

Combines semantic vector search with traditional keyword search.

#### Request Body
```json
{
  "query": "microservices patterns",
  "search_mode": "hybrid",
  "project_id": "uuid-optional",
  "content_types": ["adrs", "patterns"],
  "similarity_threshold": 0.7,
  "max_results": 15,
  "filters": {
    "status": ["accepted", "proposed"],
    "category": "architectural",
    "context_tags": ["@microservices", "@cloud"]
  },
  "boost_recent": false,
  "include_snippets": true
}
```

#### Search Modes
- `semantic`: Pure vector similarity search
- `keyword`: Traditional full-text search
- `hybrid`: Combines both with weighted scoring (default)

#### Response
```json
{
  "success": true,
  "query": "microservices patterns",
  "search_mode": "hybrid",
  "total_results": 12,
  "processing_time_ms": 245,
  "results_by_type": {
    "adrs": [
      {
        "id": "uuid",
        "type": "adr",
        "title": "Adopt microservices architecture",
        "relevance_score": 0.89,
        "similarity": 0.82,
        "keyword_score": 0.95,
        "project_name": "E-commerce Platform",
        "status": "accepted",
        "problem_statement": "Need scalable architecture for <mark>microservices</mark>...",
        "decision": "Implement <mark>microservices</mark> using Docker...",
        "url": "/api/adrs/uuid"
      }
    ]
  },
  "search_suggestions": [
    {
      "text": "service mesh patterns",
      "type": "related_pattern",
      "reason": "Related architectural concept"
    }
  ]
}
```

### 3. Find Similar ADRs

**GET** `/api/search/similar/:adr-id`

Find ADRs similar to a specific ADR using vector similarity.

#### Query Parameters
- `similarity_threshold`: Minimum similarity score (default: 0.6)
- `max_results`: Maximum results to return (default: 10)
- `include_same_project`: Include ADRs from same project (default: true)

#### Response
```json
{
  "success": true,
  "reference_adr": {
    "id": "uuid",
    "title": "Use pgvector for semantic search",
    "project_name": "Dev Memory OS"
  },
  "similarity_threshold": 0.6,
  "similar_adrs": [
    {
      "id": "uuid",
      "title": "Implement vector database for recommendations",
      "similarity": 0.7892,
      "project_name": "E-commerce Platform",
      "status": "proposed",
      "problem_statement": "Need fast similarity matching...",
      "decision": "Adopt vector database solution...",
      "created_at": "2024-01-10T15:20:00Z"
    }
  ],
  "total_found": 5
}
```

### 4. Autocomplete

**GET** `/api/search/autocomplete`

Basic autocomplete suggestions from ADR titles and pattern names.

#### Query Parameters
- `q`: Query string (minimum 2 characters)
- `limit`: Maximum suggestions (default: 10)

#### Response
```json
{
  "success": true,
  "suggestions": [
    {
      "suggestion": "database architecture patterns",
      "source": "pattern"
    },
    {
      "suggestion": "Database connection pooling decision",
      "source": "adr"
    }
  ],
  "query": "datab",
  "timestamp": "2024-01-15T14:25:00Z"
}
```

### 5. Intelligent Autocomplete

**GET** `/api/search/autocomplete/intelligent`

AI-enhanced autocomplete with semantic understanding and trending suggestions.

#### Query Parameters
- `q`: Query string
- `include_semantic`: Include semantic suggestions (default: true)
- `include_trending`: Include trending terms (default: true)
- `include_history`: Include historical popular searches (default: true)
- `limit`: Maximum suggestions (default: 10)

#### Response
```json
{
  "success": true,
  "suggestions": [
    {
      "text": "database architecture decisions",
      "type": "semantic_match",
      "match_type": "concept_similarity",
      "score": 0.85,
      "sources": ["adrs", "patterns"],
      "context": "Found in 12 ADRs and 5 patterns"
    },
    {
      "text": "data modeling patterns",
      "type": "trending",
      "match_type": "popularity_boost",
      "score": 0.78,
      "trend_data": {
        "searches_last_week": 23,
        "growth_rate": 1.4
      }
    }
  ],
  "query": "data",
  "processing_time_ms": 156,
  "metadata": {
    "semantic_matches": 8,
    "trending_matches": 3,
    "historical_matches": 2
  }
}
```

### 6. Search Analytics

**GET** `/api/search/analytics`

Get search statistics and trends.

#### Query Parameters
- `project_id`: Filter by project (optional)
- `days`: Time period in days (default: 30)

#### Response
```json
{
  "success": true,
  "period_days": 30,
  "project_id": null,
  "daily_searches": [
    {
      "search_date": "2024-01-15",
      "daily_searches": 45,
      "total_searches": 1250,
      "avg_results_per_search": 8.5,
      "avg_satisfaction": 4.2,
      "unique_users": 12
    }
  ],
  "top_search_terms": [
    {
      "query_text": "authentication patterns",
      "search_count": 23,
      "avg_results": 9.1,
      "avg_satisfaction": 4.5
    }
  ]
}
```

---

## 🎯 Pattern Endpoints

### 1. Pattern Recommendations

**GET** `/api/patterns/recommend`

Get pattern recommendations based on query or context.

#### Query Parameters
- `query`: Search query for semantic matching (optional)
- `context_tags`: Array of context tags to filter by
- `category`: Pattern category filter
- `similarity_threshold`: Minimum similarity (default: 0.6)
- `max_results`: Maximum recommendations (default: 10)
- `min_effectiveness_score`: Minimum effectiveness score (default: 2.0)

#### Response
```json
{
  "success": true,
  "query": "authentication security",
  "context_tags": ["@security", "@authentication"],
  "similarity_threshold": 0.6,
  "recommendations": [
    {
      "id": "uuid",
      "name": "Multi-Factor Authentication Pattern",
      "similarity": 0.8234,
      "category": "security",
      "description": "Implement multiple authentication factors...",
      "when_to_use": "When handling sensitive user data...",
      "context_tags": ["@security", "@authentication", "@compliance"],
      "effectiveness_score": 4.5,
      "usage_count": 27,
      "author_name": "security_specialist",
      "created_at": "2023-12-01T10:00:00Z",
      "url": "/api/patterns/uuid"
    }
  ],
  "total_found": 6
}
```

### 2. Recommend Patterns for ADR

**GET** `/api/patterns/recommend-for-adr/:adrId`

Get pattern recommendations based on a specific ADR's content.

#### Response
```json
{
  "success": true,
  "adr": {
    "id": "uuid",
    "title": "Implement OAuth2 authentication",
    "project_name": "E-commerce Platform"
  },
  "recommended_patterns": [
    {
      "id": "uuid",
      "name": "OAuth2 Security Pattern",
      "similarity": 0.91,
      "relevance_reason": "Direct match for OAuth2 implementation",
      "category": "security",
      "effectiveness_score": 4.7,
      "usage_count": 34
    }
  ],
  "total_recommendations": 4
}
```

### 3. Trending Patterns

**GET** `/api/patterns/trending`

Get currently trending patterns based on usage and searches.

#### Query Parameters
- `days`: Time period for trend calculation (default: 7)
- `limit`: Maximum patterns to return (default: 10)

#### Response
```json
{
  "success": true,
  "period_days": 7,
  "trending_patterns": [
    {
      "id": "uuid",
      "name": "Microservices Communication Pattern",
      "category": "architectural",
      "trend_score": 8.7,
      "usage_growth": "+45%",
      "search_growth": "+23%",
      "effectiveness_score": 4.3,
      "recent_adoptions": 12,
      "description": "Patterns for service-to-service communication..."
    }
  ]
}
```

---

## ⚙️ Embedding Endpoints

### 1. Batch Process Embeddings

**POST** `/api/embeddings/process`

Generate embeddings for multiple ADRs or patterns.

#### Request Body
```json
{
  "content_type": "adrs",
  "project_id": "uuid-optional",
  "force_regenerate": false,
  "batch_size": 50
}
```

#### Response
```json
{
  "success": true,
  "job_id": "uuid",
  "content_type": "adrs",
  "total_items": 150,
  "processed_items": 0,
  "estimated_duration": "5-10 minutes",
  "status": "queued"
}
```

### 2. Single Item Embedding

**POST** `/api/embeddings/process/single`

Generate embedding for a single item.

#### Request Body
```json
{
  "content_type": "adr",
  "item_id": "uuid",
  "force_regenerate": true
}
```

#### Response
```json
{
  "success": true,
  "item_id": "uuid",
  "content_type": "adr",
  "embedding_generated": true,
  "processing_time_ms": 1234,
  "vector_dimensions": 1536
}
```

### 3. Processing Jobs

**GET** `/api/embeddings/jobs`

Get list of embedding processing jobs.

**GET** `/api/embeddings/jobs/:jobId`

Get status of specific job.

#### Response
```json
{
  "success": true,
  "job_id": "uuid",
  "status": "processing",
  "progress": {
    "total_items": 150,
    "processed_items": 87,
    "percentage": 58,
    "estimated_remaining": "2-3 minutes"
  },
  "results": {
    "successful": 85,
    "failed": 2,
    "errors": [
      {
        "item_id": "uuid",
        "error": "Rate limit exceeded"
      }
    ]
  }
}
```

---

## 🏥 System Endpoints

### 1. Health Check

**GET** `/health`

Comprehensive system health status.

#### Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00Z",
  "version": "1.1.0",
  "environment": "production",
  "services": {
    "api": true,
    "database": true,
    "embeddings": true,
    "vector_search": true,
    "performance_monitoring": true
  },
  "database": {
    "connected": true,
    "vector_extension": true,
    "vector_operations": "healthy",
    "connection_pool": {
      "total_connections": 25,
      "idle_connections": 18,
      "waiting_clients": 0,
      "max_connections": 25
    },
    "query_performance": {
      "totalQueries": 15234,
      "vectorQueries": 3421,
      "slowQueries": 12,
      "errorQueries": 3,
      "averageQueryTime": 156.7,
      "success_rate": "99.98%"
    }
  },
  "system": {
    "uptime": 86400,
    "memory": {
      "rss": 142,
      "heapUsed": 87,
      "heapTotal": 120,
      "external": 15
    },
    "port": 3003,
    "node_version": "v18.17.0"
  },
  "features": {
    "semantic_search": true,
    "hybrid_search": true,
    "batch_processing": true,
    "auto_complete": true,
    "analytics": true
  }
}
```

### 2. System Metrics

**GET** `/api/system/metrics`

Detailed performance metrics (requires API key).

#### Response
```json
{
  "success": true,
  "metrics": {
    "requests": {
      "total": 15234,
      "success": 15201,
      "errors": 33,
      "errorRate": "0.22%",
      "successRate": "99.78%"
    },
    "performance": {
      "averageResponseTime": 287.5,
      "maxResponseTime": 4567,
      "minResponseTime": 12
    },
    "database": {
      "queries": 8934,
      "slowQueries": 12,
      "errors": 3,
      "averageQueryTime": 156.7,
      "slowQueryRate": "0.13%"
    },
    "system": {
      "uptime": 86400,
      "memory": {...},
      "cpu": {...}
    }
  },
  "timestamp": "2024-01-15T14:35:00Z"
}
```

---

## ⚡ Rate Limits

### Default Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **Embedding Generation**: 50 requests per hour per API key
- **Search**: 200 requests per 15 minutes per API key

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642248000
```

### Exceeding Rate Limits

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

---

## 🚨 Error Responses

### Error Format

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T14:40:00Z",
  "request_id": "req_abc123"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_API_KEY` | 401 | API key missing or invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_QUERY` | 400 | Search query is invalid |
| `ADR_NOT_FOUND` | 404 | ADR with given ID not found |
| `SEARCH_ERROR` | 500 | Search operation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EMBEDDING_ERROR` | 500 | Embedding generation failed |

---

## 📚 Example Workflows

### 1. Complete Search Workflow

```bash
# 1. Get autocomplete suggestions
curl "https://your-app.railway.app/api/search/autocomplete?q=auth&limit=5" \
  -H "X-API-Key: your-api-key"

# 2. Perform semantic search
curl -X POST https://your-app.railway.app/api/search/semantic \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"query": "authentication patterns", "max_results": 10}'

# 3. Find similar ADRs
curl "https://your-app.railway.app/api/search/similar/adr-uuid?similarity_threshold=0.7" \
  -H "X-API-Key: your-api-key"

# 4. Get pattern recommendations
curl "https://your-app.railway.app/api/patterns/recommend?query=authentication&category=security" \
  -H "X-API-Key: your-api-key"
```

### 2. Embedding Processing Workflow

```bash
# 1. Start batch processing
curl -X POST https://your-app.railway.app/api/embeddings/process \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"content_type": "adrs", "project_id": "project-uuid"}'

# 2. Check job status
curl "https://your-app.railway.app/api/embeddings/jobs/job-uuid" \
  -H "X-API-Key: your-api-key"

# 3. Process single item
curl -X POST https://your-app.railway.app/api/embeddings/process/single \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"content_type": "adr", "item_id": "adr-uuid"}'
```

---

## 🔧 SDK and Client Libraries

### JavaScript/TypeScript

```javascript
import { DevMemoryClient } from '@dev-memory-os/client';

const client = new DevMemoryClient({
  baseUrl: 'https://your-app.railway.app',
  apiKey: 'your-api-key'
});

// Semantic search
const results = await client.search.semantic({
  query: 'authentication patterns',
  contentTypes: ['adrs', 'patterns'],
  maxResults: 10
});

// Pattern recommendations  
const patterns = await client.patterns.recommend({
  query: 'security best practices',
  category: 'security'
});
```

### Python

```python
from dev_memory_os import DevMemoryClient

client = DevMemoryClient(
    base_url='https://your-app.railway.app',
    api_key='your-api-key'
)

# Semantic search
results = client.search.semantic(
    query='authentication patterns',
    content_types=['adrs', 'patterns'],
    max_results=10
)

# Pattern recommendations
patterns = client.patterns.recommend(
    query='security best practices',
    category='security'
)
```

---

## 📞 Support

- **API Issues**: [GitHub Issues](https://github.com/mandymgr/Krins-Dev-Memory-OS/issues)
- **Railway Deployment**: [Railway Discord](https://discord.gg/railway)
- **OpenAI Integration**: [OpenAI Documentation](https://platform.openai.com/docs)

---

*Last updated: January 2024*