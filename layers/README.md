# 🧭 Virtual Layer Navigation System

**Quick access to KRINS-Chronicle-Keeper architectural layers**

## 🎯 **Layer Navigation**

### 🌐 **WEB LAYER** 
```bash
# Primary web interface
cd ../frontend/                   # React frontend application
cd ../DASHBOARD/                  # Advanced dashboards

# Quick commands
npm run dev                       # Start development server
npm run build                     # Production build
npm run test                      # Run frontend tests
```

### ⚡ **API LAYER**
```bash
# Backend services
cd ../backend/                    # FastAPI main backend
cd ../semantic-search-backend/    # Node.js semantic search API

# Quick commands  
python main.py                    # Start FastAPI server
npm start                         # Start Node.js semantic API
docker-compose up api             # Start containerized APIs
```

### 🧠 **INTELLIGENCE LAYER**
```bash
# AI systems
cd ../AI_INTEGRATION/             # Core AI integration systems
cd ../ai-systems/                 # AI ecosystem (Krin, MCP, etc.)

# Quick commands
bun unified-ai-launcher.js        # Start AI coordination
bun context-provider.ts           # Generate organizational context
node ../ai-systems/krin-personal-companion/
```

### 🗄️ **DATA LAYER**
```bash
# Data management
cd ../DECISION_MANAGEMENT/        # Decision tracking and analytics
cd ../config/database/            # Database configuration
cd ../semantic-search-backend/    # pgvector semantic search

# Quick commands
bun decision-tracker.ts analytics # Decision analytics
./scripts/setup-semantic-search.sh # Setup pgvector
psql -h localhost -U postgres krins_db # Connect to database
```

### 🐳 **INFRASTRUCTURE LAYER**
```bash
# Deployment and operations
cd ../scripts/                    # Build and deployment scripts
cd ../.github/                    # CI/CD workflows
cd ../                           # Root (Docker, configs)

# Quick commands
docker-compose up                 # Start full system
./scripts/build-krins-system.sh   # Build everything
make deploy                       # Deploy to production
```

## 📊 **Layer Summary**

| Layer | Primary Location | Key Files | Purpose |
|-------|------------------|-----------|---------|
| 🌐 Web | `frontend/` | Dashboard.tsx, AITeamDashboard/ | User interface |
| ⚡ API | `backend/` | main.py, websocket-server.ts | Business logic |
| 🧠 Intelligence | `AI_INTEGRATION/` | adr-parser.ts, context-provider.ts | AI processing |
| 🗄️ Data | `DECISION_MANAGEMENT/` | decision-tracker.ts, evidence-collector.ts | Data management |
| 🐳 Infrastructure | `scripts/`, Docker files | docker-compose.yml, build scripts | Deployment |

## 🚀 **Common Development Workflows**

### Start Development Environment
```bash
# From layers/ directory
cd ../
docker-compose up -d postgres redis  # Start databases
cd frontend && npm run dev &          # Start frontend
cd backend && python main.py &       # Start FastAPI
cd semantic-search-backend && npm start & # Start semantic API
```

### Deploy Production
```bash
cd ../
docker-compose -f docker-compose.prod.yml up -d
```

### AI Development
```bash
cd ../AI_INTEGRATION/
bun context-provider.ts generate claude-code architecture-review
bun adr-parser.ts parse --all --actionable
```

### Data Analytics
```bash
cd ../DECISION_MANAGEMENT/
bun decision-tracker.ts analytics --export
bun evidence-collector.ts validate --recent
```

---

**🎯 Pro Tip**: Use this navigation system to quickly access any architectural layer without remembering complex directory structures!