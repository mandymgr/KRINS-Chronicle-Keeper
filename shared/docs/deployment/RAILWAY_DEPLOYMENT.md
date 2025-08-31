# 🚂 Railway Deployment Guide for Dev Memory OS

Complete guide for deploying Dev Memory OS to Railway with PostgreSQL, pgvector, React 18, and Vite 4.4.

## 🚀 Quick Deploy

### 1. Prerequisites

- [Railway account](https://railway.app/)
- [OpenAI API key](https://platform.openai.com/api-keys)
- Git repository access

### 2. One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

**Manual Deploy:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Clone and deploy
git clone https://github.com/mandymgr/Krins-Dev-Memory-OS.git
cd Krins-Dev-Memory-OS
railway create
```

---

## 📋 Detailed Setup Guide

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your Dev Memory OS repository

### Step 2: Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create database and provide connection details

### Step 3: Install pgvector Extension

After PostgreSQL is provisioned:

```bash
# Connect to your Railway database
railway connect postgresql

# In PostgreSQL console
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\dx  -- Verify extensions are installed
```

### Step 4: Configure Environment Variables

In Railway dashboard → **Variables** tab, add:

#### Required Variables
```env
# OpenAI API (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Production Security (REQUIRED)
API_KEY=your-secure-production-api-key-here
JWT_SECRET=your-jwt-secret-min-32-characters-long

# CORS Configuration (REQUIRED)
CORS_ORIGINS=https://your-app.railway.app
```

#### Optional Variables
```env
# Logging
LOG_LEVEL=info

# Features
ENABLE_VECTOR_SEARCH=true
ENABLE_BATCH_PROCESSING=true

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Step 5: Configure Build Settings

In Railway dashboard → **Settings** → **Build**:

```yaml
Build Command: npm run build:railway
Start Command: npm run start:production
```

### Step 6: Deploy and Initialize Database

```bash
# Deploy the application
git push origin main

# Initialize database schema (after first deployment)
railway run npm run migrate

# Seed with sample data (optional)
railway run npm run db:seed
```

---

## 🔧 Configuration Details

### Database Configuration

Railway automatically provides these environment variables:
- `DATABASE_URL` - Complete connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Application Configuration

The app automatically detects Railway environment and configures:
- Port binding to `0.0.0.0:$PORT`
- SSL database connections
- Production logging
- Health checks at `/health`

### Frontend Serving

The build process creates a production-ready frontend that's served by the Express server:
- Static files served from `/frontend/dist`
- SPA routing support
- Gzipped assets
- Cache headers

---

## 🔍 Verification Steps

### 1. Check Application Health

```bash
# Check health endpoint
curl https://your-app.railway.app/health

# Expected response:
{
  "status": "ok",
  "database": true,
  "vector_extension": true,
  "services": {...}
}
```

### 2. Test API Endpoints

```bash
# Test semantic search
curl -X POST https://your-app.railway.app/api/search/semantic \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"query": "database architecture decisions"}'
```

### 3. Verify Frontend

Visit `https://your-app.railway.app` and test:
- [ ] Page loads correctly
- [ ] Search functionality works
- [ ] AI-powered autocomplete functions
- [ ] Pattern recommendations display

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database status
railway status

# View database logs
railway logs --service=postgresql

# Test connection
railway run psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. pgvector Extension Missing
```bash
# Reinstall extensions
railway run psql $DATABASE_URL -c "
  DROP EXTENSION IF EXISTS vector CASCADE;
  CREATE EXTENSION vector;
  CREATE EXTENSION \"uuid-ossp\";
"
```

#### 3. Build Failures
```bash
# Check build logs
railway logs --service=web

# Rebuild manually
railway run npm run build:railway
```

#### 4. Environment Variable Issues
```bash
# List all variables
railway variables

# Test specific variable
railway run echo $OPENAI_API_KEY
```

### Performance Issues

#### Slow Vector Queries
1. Verify pgvector indexes exist:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE indexname LIKE '%embedding%';
```

2. Optimize database:
```bash
railway run npm run db:optimize
```

#### High Memory Usage
1. Check memory metrics: `/health`
2. Adjust Railway plan if needed
3. Review query efficiency

---

## 📊 Monitoring

### Built-in Monitoring

- **Health Check**: `GET /health`
- **Metrics**: `GET /api/metrics` (with API key)
- **Logs**: Available in Railway dashboard

### External Monitoring

#### Sentry Integration
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Custom Monitoring
The app includes comprehensive logging for:
- Request/response times
- Database query performance
- Vector search operations
- Security events
- System resource usage

---

## 🔄 Updates and Maintenance

### Deploying Updates

```bash
# Standard deployment
git push origin main

# Force rebuild
railway redeploy

# Database migrations
railway run npm run migrate
```

### Backup Strategy

```bash
# Manual backup
railway run pg_dump $DATABASE_URL > backup.sql

# Automated backups are included in Railway Pro plans
```

### Scaling

Railway automatically scales based on:
- Request volume
- Memory usage
- CPU utilization

For custom scaling:
1. Go to Railway dashboard → **Settings** → **Resources**
2. Adjust memory/CPU limits
3. Enable autoscaling

---

## 🔐 Security Checklist

- [ ] API keys are stored in environment variables
- [ ] CORS origins are properly configured
- [ ] Rate limiting is enabled
- [ ] JWT secrets are secure (32+ characters)
- [ ] Database SSL is enabled
- [ ] Security headers are configured
- [ ] Input sanitization is active
- [ ] Logging excludes sensitive data

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Dev Memory OS API Documentation](./API_DOCUMENTATION.md)

---

## 🆘 Support

### Getting Help

1. **Railway Issues**: [Railway Discord](https://discord.gg/railway)
2. **Application Issues**: [GitHub Issues](https://github.com/mandymgr/Krins-Dev-Memory-OS/issues)
3. **pgvector Issues**: [pgvector GitHub](https://github.com/pgvector/pgvector)

### Common Commands

```bash
# View real-time logs
railway logs -f

# Open database shell
railway connect postgresql

# Run commands in Railway environment
railway run [command]

# Open app in browser
railway open

# Get connection info
railway variables
```

---

## 🎉 Success!

Your Dev Memory OS is now running on Railway with:
- ✅ PostgreSQL with pgvector
- ✅ React 18 + Vite 4.4 frontend
- ✅ Express.js API with semantic search
- ✅ Production security and monitoring
- ✅ Automatic scaling and deployment