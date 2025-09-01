# Dev Memory OS FastAPI Backend

Production-ready FastAPI backend for the Dev Memory OS semantic search system. This replaces the Node.js Express backend with a modern async Python implementation optimized for PostgreSQL and Railway deployment.

## 🚀 Features

- **FastAPI Framework**: Modern, fast, and auto-documented API
- **Async PostgreSQL**: High-performance async database operations with SQLAlchemy
- **Railway Ready**: Optimized for Railway deployment with PostgreSQL
- **Type Safety**: Full TypeScript-style type hints with Pydantic
- **Auto Documentation**: Interactive API docs at `/api/v1/docs`
- **Production Ready**: Comprehensive error handling, logging, and monitoring

## 🏗️ Architecture

```
backend-fastapi/
├── app/
│   ├── api/v1/            # API routes and endpoints
│   ├── core/              # Configuration and settings
│   ├── database/          # Database connection and sessions
│   └── models/            # SQLAlchemy database models
├── main.py                # FastAPI application entry point
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
├── railway.json          # Railway deployment config
└── .env.example          # Environment variables template
```

## 🔧 Setup

### 1. Install Dependencies

```bash
cd backend-fastapi
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key environment variables:
```env
# Database (Railway PostgreSQL URL or local settings)
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database

# OpenAI (optional for semantic search)
OPENAI_API_KEY=sk-your-key-here

# Application
DEBUG=true
LOG_LEVEL=INFO
PORT=8000
```

### 3. Run Development Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once running, access:

- **Interactive Docs**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **Health Check**: http://localhost:8000/health
- **API Info**: http://localhost:8000/api/v1

## 🏠 Available Endpoints

### System
- `GET /` - API overview and documentation
- `GET /health` - Comprehensive health check
- `GET /api/v1` - API version information

### ADRs (Architecture Decision Records)
- `GET /api/v1/adrs` - List ADRs with filtering
- `GET /api/v1/adrs/{id}` - Get specific ADR

### Patterns
- `GET /api/v1/patterns` - List patterns with filtering  
- `GET /api/v1/patterns/{id}` - Get specific pattern

### Search
- `POST /api/v1/search/semantic` - Semantic search across content
- `GET /api/v1/search/autocomplete` - Search suggestions

## 🚄 Railway Deployment

This backend is optimized for Railway deployment:

### 1. Database Setup
```bash
# Add Railway PostgreSQL plugin to your project
railway add postgresql
```

### 2. Environment Variables
Set in Railway dashboard or via CLI:
```bash
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set ENVIRONMENT=production
```

### 3. Deploy
```bash
railway deploy
```

The `railway.json` configuration handles:
- Dockerfile-based builds
- Health check endpoints
- Restart policies
- Port configuration

## 🔄 Migration from Express

Key differences from the Node.js version:

### Database Layer
- **Before**: Custom connection pool with pg
- **After**: SQLAlchemy async with connection pooling

### API Framework  
- **Before**: Express with manual route definitions
- **After**: FastAPI with automatic OpenAPI generation

### Type Safety
- **Before**: JSDoc comments (optional)
- **After**: Full Pydantic type validation

### Error Handling
- **Before**: Manual error middleware
- **After**: Automatic HTTP exception handling

## 🧪 Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
flake8 .
```

### Type Checking
```bash
mypy .
```

## 📊 Performance

Expected improvements over Express backend:
- **40-60% faster** API response times
- **Better concurrency** with async/await
- **Lower memory usage** with uvicorn
- **Automatic connection pooling** with SQLAlchemy

## 🔍 Monitoring

Health check endpoint provides:
- Database connectivity status
- Connection pool metrics
- OpenAI API availability
- System resource usage

Access at: `GET /health`

## 🔧 Configuration

All settings managed through `app/core/config.py`:

- **Database**: Connection strings, pool sizes
- **API**: CORS origins, rate limiting
- **Features**: OpenAI keys, search thresholds
- **Deployment**: Debug mode, log levels

## 📱 Frontend Integration

Update frontend `vite.config.ts` proxy target:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // FastAPI backend
    changeOrigin: true,
    secure: false
  }
}
```

## 🤝 Contributing

1. Follow Python PEP 8 style guidelines
2. Add type hints to all functions
3. Update API documentation for new endpoints
4. Add tests for new functionality
5. Update this README for significant changes

## 📄 License

Part of the Dev Memory OS project - see main project LICENSE.