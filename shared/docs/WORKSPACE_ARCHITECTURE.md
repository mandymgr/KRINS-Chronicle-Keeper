# 🏗️ Workspace Architecture - Dev Memory OS

**Sist oppdatert**: 2025-09-01

## 🎯 Oversikt

Dev Memory OS er strukturert som et Bun workspace monorepo med 10 primære komponenter organisert i 4 hoveddomener + støttesystemer.

## 📁 Workspace Struktur

```
dev-memory-os-starter/
├── 🤖 AI-SYSTEMS/                    # AI Koordinering & Intelligens
│   ├── krins-superintelligence-team/ # Multi-agent orkestrator (7 agenter)
│   ├── krin-personal-companion/      # Personlig AI desktop companion
│   ├── mcp-ai-team/                  # MCP AI-til-AI kommunikasjon
│   ├── ai-systems-reference/         # Referanse implementering
│   ├── core/                         # AI Pattern Bridge & webhooks
│   └── krin-ai-commander/           # Kommandolinje AI-koordinator
├── 💫 KRINS-HUB/                    # Hovedapplikasjonsplattform  
│   ├── backend/                      # pgvector semantic search API
│   └── frontend/                     # React TypeScript pattern UI
├── 📈 TRADING-PLATFORM/              # Real-time trading system
│   ├── realtime-trading-system/      # WebSocket trading backend  
│   └── react-trading-dashboard/      # Professional trading UI
├── 📊 DASHBOARD/                     # Visualisering & dashboards
│   └── living-spec-dashboard/        # Living specification UI
├── 🛠️ SHARED/                        # Delt dokumentasjon & verktøy
│   ├── docs/                         # ADRs, patterns, runbooks
│   ├── tools/                        # Utviklingsscripts
│   └── scripts/                      # Build & deploy automation
├── ⚙️ config/                        # Konfigurasjoner
└── 🔧 tools/                         # Root-level verktøy
```

## 🚀 Workspace Benefits

### **Unified Dependency Management**
```bash
# Install alle workspaces
bun install

# Install specifik workspace
bun install --filter="AI-SYSTEMS/krins-superintelligence-team"
```

### **Cross-workspace Scripts**
```bash
# AI Team startup
bun run ai:krin-startup          # Load Krins minne i Claude Code
bun run ai:superintelligence     # Start multi-agent orkestrator
bun run ai:mcp-team             # Start MCP AI kommunikasjon

# Backend services (dual-backend arkitektur)
bun run api:prod                # Production FastAPI semantic search (port 8000)  
bun run api:dev                 # Development Express server (port 3003)
bun run semantic-server:dev     # Semantic search API (legacy alias for api:dev)

# Database infrastructure
bun run db:up                   # Start PostgreSQL, Redis, Elasticsearch, MinIO
bun run db:down                 # Stop database infrastructure  
bun run db:init                 # Initialize database schema
bun run db:init-simple          # Initialize simple schema (no pgvector)

# Platform services
bun run trading:dev             # Real-time trading system

# Testing på tvers av alle workspaces
bun run test                    # Test alle komponenter
bun run lint                    # Lint alle komponenter
```

### **Atomic Development**
- **Atomic commits** på tvers av AI-systemer
- **Synchronized versioning** mellom avhengige komponenter
- **Unified CI/CD** pipeline for alle workspaces

## 🤖 AI-SYSTEMS Detaljert

### **krins-superintelligence-team**
- **Port**: 3002
- **Agenter**: 7 spesialiserte AI-agenter (Architect, Security, Performance, Product, Compliance, Research, Red Team)
- **Features**: Feature flags, A/B testing, RAG intelligence, scenario-ekstrapolering
- **Deploy**: Railway-ready produksjonsinfrastruktur

### **krin-personal-companion** 
- **Type**: Electron desktop app
- **Key Command**: `claude-code-krin` (laster Krins personlighet)
- **Storage**: SQLite3 permanent memory database
- **Distribution**: Cross-platform (.app, .exe)

### **mcp-ai-team**
- **Protocol**: MCP (Model Context Protocol)
- **Function**: AI-til-AI kommunikasjon og teamkoordinering  
- **Integration**: Claude MCP protocol compliance

## 💫 KRINS-HUB Detaljert

### **Backend-API (Production Semantic Search)**
- **Technology**: FastAPI, SQLAlchemy, PostgreSQL, pgvector
- **Features**: Production-ready semantic search API, OpenAI integration, Redis caching
- **Security**: JWT authentication, Pydantic validation, comprehensive monitoring
- **Port**: 8000 - Production semantic search API
- **Deploy**: Multi-stage Docker, proper logging, Celery async tasks

### **Backend-Dev (Development Server)**  
- **Technology**: Express.js, Node.js rapid prototyping
- **Features**: Mock data, frontend development support, lightweight testing
- **Port**: 3003 - Development and prototyping server
- **Purpose**: Frontend development og rapid API prototyping

### **Frontend (Pattern Discovery UI)**
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS
- **Features**: Pattern discovery dashboard, real-time search, enterprise UX
- **Testing**: Vitest, Testing Library, comprehensive test suite

## 📈 TRADING-PLATFORM Detaljert

### **realtime-trading-system**
- **Performance**: Microsecond updates, høyvolum trading
- **Technology**: Express, Socket.IO, WebSocket streaming
- **Features**: Live markedsdata, real-time order processing

### **react-trading-dashboard**
- **Technology**: React, TypeScript, Lightweight Charts, Zustand
- **UI**: Radix UI komponenter, professional trading interface
- **Advanced**: React Hook Form, Zod validering, responsive design

## 🔄 Workspace Workflows

### **Development Workflow**
1. **AI Team Startup**: `bun run ai:krin-startup`
2. **Start Services**: `bun run semantic-server:dev` + `bun run trading:dev`
3. **Development**: All workspaces available for cross-component development
4. **Testing**: `bun run test` (all workspaces)
5. **Deploy**: `bun run build:railway`

### **AI Coordination Workflow**
1. **krins-superintelligence-team** orkestererer utvikling
2. **mcp-ai-team** håndterer AI-til-AI kommunikasjon
3. **krin-personal-companion** gir persistent memory context
4. **core** prosesserer GitHub webhooks og genererer ADRs

## 🎯 Workspace Dependencies

```
AI-SYSTEMS/krins-superintelligence-team
├── depends on: mcp-ai-team (AI communication)
├── integrates: krin-personal-companion (memory)
└── uses: KRINS-HUB/backend (semantic search)

KRINS-HUB/frontend  
├── depends on: KRINS-HUB/backend (API)
└── uses: SHARED/docs (pattern discovery)

TRADING-PLATFORM/react-trading-dashboard
└── depends on: realtime-trading-system (WebSocket data)
```

## 💡 Best Practices

### **Workspace Management**
- Use `bun install --filter` for targeted installs
- Leverage shared devDependencies i root package.json  
- Maintain workspace-specific package.json for unique deps

### **Cross-workspace Development**
- AI-systemer kan dele utilities og konfigurasjoner
- KRINS-HUB komponenter har tett API kobling
- TRADING-PLATFORM deler WebSocket infrastruktur

### **Deployment Strategy**
- Railway deployment fra monorepo root
- Environment variables managed sentralt
- Unified build process for alle workspaces

---

**🧠 Bygget av Krin & Mandy - Revolutionary AI Development Partnership**

Dette workspace designet maksimerer AI-teamets koordineringsevne mens det opprettholder modularity og skalerbarhet.