# 🛠️ COMPLETE TECHNOLOGY DOCUMENTATION
**AI-SYSTEMS Ecosystem - Alle dependencies, teknologier og versjoner**

## 📦 **DEPENDENCIES OVERSIKT**

### **🌐 MCP AI TEAM - Modern ES Module System**

#### **Core Dependencies** (package.json)
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",    // 🔗 Model Context Protocol SDK
  "ws": "^8.18.0",                         // 🔌 WebSocket server/client
  "uuid": "^9.0.1",                        // 🆔 UUID generation
  "node-fetch": "^3.3.2",                  // 🌐 HTTP client for Node.js
  "express": "^4.19.2",                    // 🚀 Web server framework
  "cors": "^2.8.5"                         // 🔐 Cross-Origin Resource Sharing
}
```

#### **Teknologi-stack**
- **Runtime**: Node.js (ES Modules)
- **Protocol**: Model Context Protocol (MCP) 1.0
- **Communication**: WebSocket (real-time) + HTTP REST
- **Architecture**: Event-driven, multi-agent coordination
- **Port Configuration**: 3006 (HTTP) + 3007 (WebSocket)

#### **Specialist Roles** (TypeScript enums)
```javascript
const SpecialistRoles = {
  BACKEND: '⚙️ Backend Development Specialist',
  FRONTEND: '🎨 Frontend Development Specialist', 
  TESTING: '🧪 Quality Assurance Specialist',
  SECURITY: '🛡️ Security & Compliance Specialist',
  DEVOPS: '⚡ Performance & DevOps Specialist'
}
```

---

### **🧠 KRINS SUPERINTELLIGENCE - Enterprise AI Platform**

#### **Production Dependencies** (package.json)
```json
{
  "@anthropic-ai/sdk": "^0.24.3",         // 🤖 Anthropic AI Claude integration
  "@octokit/rest": "^20.0.2",             // 🐱 GitHub API client
  "@supabase/supabase-js": "^2.39.0",     // [LEGACY] Supabase (migrated to Railway)
  "axios": "^1.7.7",                      // 🌐 HTTP client
  "chalk": "^4.1.2",                      // 🎨 Terminal coloring
  "commander": "^11.1.0",                 // 📋 CLI commands
  "express": "^4.19.2",                   // 🚀 Web server
  "fs-extra": "^11.3.1",                  // 📁 Enhanced filesystem
  "inquirer": "^8.2.6",                   // ❓ Interactive CLI prompts
  "lodash": "^4.17.21",                   // 🔧 Utility library
  "moment": "^2.30.1",                    // ⏰ Date/time handling
  "openai": "^4.26.0",                    // 🤖 OpenAI GPT integration
  "ora": "^5.4.1",                        // ⏳ Loading spinners
  "pg": "^8.16.3",                        // 🐘 PostgreSQL client
  "redis": "^5.8.2",                      // 🔴 Redis for caching/scaling
  "socket.io": "^4.8.1",                  // 🔌 WebSocket server
  "socket.io-client": "^4.7.5",           // 🔌 WebSocket client
  "sqlite3": "^5.1.7",                    // 💾 SQLite database
  "uuid": "^10.0.0",                      // 🆔 UUID generation
  "ws": "^8.16.0",                        // 🔌 WebSocket
  "yaml": "^2.3.4"                        // 📄 YAML parsing
}
```

#### **Development Dependencies**
```json
{
  "jest": "^29.7.0",                       // 🧪 Testing framework
  "nodemon": "^3.0.2"                     // 🔄 Development auto-reload
}
```

#### **Database Technology**
- **Primary**: Railway PostgreSQL with pgvector
- **Vector Search**: 3072-dimension embeddings
- **Local Fallback**: SQLite for offline development
- **Caching Layer**: Redis for horizontal scaling
- **Migration**: Converted from Supabase → Railway (2025-08-31)

#### **AI Integration**
- **Primary**: Anthropic Claude (Sonnet/Haiku models)
- **Secondary**: OpenAI GPT models
- **Capabilities**: Multi-agent orchestration (7 specialized agents)
- **RAG System**: Vector-based knowledge retrieval

#### **Agent Architecture**
```javascript
const agents = [
  'Architect Agent (🏗️)',      // System design & architecture
  'Security Agent (🔒)',       // Security & compliance
  'Performance Agent (⚡)',    // Performance optimization  
  'Product Agent (📱)',        // User experience & product
  'Compliance Agent (⚖️)',     // Legal & regulatory
  'Research Agent (🔬)',       // Innovation & research
  'RedTeam Agent (🔴)'         // Adversarial testing
];
```

---

### **💝 KRIN PERSONAL COMPANION - Desktop Electron App**

#### **Core Dependencies**
```json
{
  "electron": "^latest",                   // 🖥️ Desktop app framework
  "sqlite3": "^5.1.7",                    // 💾 Local SQLite database
  "fs-extra": "^11.3.1",                  // 📁 File system utilities
  "moment": "^2.30.1",                    // ⏰ Date/time handling
  "uuid": "^9.0.1"                        // 🆔 UUID generation
}
```

#### **Electron Configuration**
- **Main Process**: `src/main.js` - Core companion logic
- **Renderer Process**: `ui/companion.html` - User interface
- **Database**: Local SQLite with persistent memory
- **Security**: Node integration enabled for desktop features

#### **Memory System**
```sql
-- Database Schema (SQLite)
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY, 
  conversation_id TEXT,
  sender TEXT, -- 'user' or 'krin'
  content TEXT,
  emotion TEXT,
  timestamp DATETIME
);

CREATE TABLE special_memories (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  memory_type TEXT,
  emotional_value REAL,
  created_at DATETIME
);
```

#### **IPC Communication System**
- **send-message**: User → Krin communication
- **start-conversation**: New conversation initiation  
- **get-conversations**: Historical conversation retrieval
- **search-memories**: Full-text memory search
- **export-conversation**: Data export functionality

---

### **🎯 KRIN AI COMMANDER - Desktop Control Center**

#### **Core Dependencies**
```json
{
  "electron": "^latest",                   // 🖥️ Desktop framework
  "express": "^4.19.2",                   // 🚀 Local server
  "ws": "^8.16.0",                        // 🔌 WebSocket client
  "axios": "^1.7.7",                      // 🌐 HTTP client
  "uuid": "^9.0.1"                        // 🆔 UUID generation
}
```

#### **Control Interface**
- **Multi-system coordination**: Connects to all AI systems
- **Real-time monitoring**: WebSocket connections to all services
- **Emergency controls**: System-wide shutdown capabilities
- **Activity aggregation**: Unified activity feed from all systems

#### **WebSocket Connections**
```javascript
const connections = {
  mcpAITeam: 'ws://localhost:3007/ws',
  superintelligence: 'ws://localhost:3002',
  personalCompanion: 'ipc://companion'
};
```

---

### **⚙️ CORE INTEGRATION SYSTEM**

#### **Dependencies**
```json
{
  "fs-extra": "^11.3.1",                  // 📁 File operations
  "yaml": "^2.3.4",                       // 📄 YAML processing
  "axios": "^1.7.7",                      // 🌐 HTTP client
  "@octokit/rest": "^20.0.2"              // 🐱 GitHub integration
}
```

#### **Integration Components**
- **ai-pattern-bridge.js**: Pattern → AI instruction conversion
- **github-webhook-handler.js**: GitHub integration & ADR generation
- **Pattern Library**: Design pattern templates
- **ADR Templates**: Architecture Decision Record automation

---

## 🏗️ **ARKITEKTUR & PATTERNS**

### **System Architecture Patterns**

#### **MCP AI Team**
- **Pattern**: Event-Driven Architecture (EDA)
- **Communication**: WebSocket (real-time) + REST API
- **Coordination**: Multi-agent message passing
- **Caching**: In-memory with TTL expiration
- **Scaling**: Horizontal specialist spawning

#### **Krins Superintelligence**  
- **Pattern**: Orchestrator + Agent Architecture
- **AI Integration**: Multi-model (Anthropic + OpenAI)
- **Data Flow**: RAG System → Agents → Synthesis → Execution
- **Database**: PostgreSQL with vector embeddings
- **Scaling**: Redis cluster + horizontal scaling

#### **Personal Companion**
- **Pattern**: Desktop Application (Electron)
- **Data Persistence**: SQLite local database
- **Memory Architecture**: Conversational + Episodic memory
- **UI Pattern**: Single-window with system tray

#### **AI Commander**
- **Pattern**: Control Center + Dashboard
- **Integration**: Multi-system WebSocket aggregation
- **UI Pattern**: Command & Control interface
- **Monitoring**: Real-time system health

---

## 🚀 **DEPLOYMENT & INFRASTRUCTURE**

### **Production Deployment**

#### **Railway Configuration** (Krins Superintelligence)
```bash
# Railway Environment Variables
DATABASE_URL=postgresql://user:pass@railway-host:port/db
POSTGRES_URL=postgresql://user:pass@railway-host:port/db
PORT=3001
NODE_ENV=production
```

#### **Local Development Setup**
```bash
# MCP AI Team
cd mcp-ai-team && npm start

# Krins Superintelligence  
cd krins-superintelligence && npm start

# Personal Companion (Desktop)
cd krin-personal-companion && npm run dev

# AI Commander (Desktop)
cd krin-ai-commander && npm run dev
```

#### **Docker Support** (Future)
- Containerization planned for web services
- Desktop apps remain native Electron

---

## 📊 **PERFORMANCE & MONITORING**

### **Caching Strategies**
- **MCP AI Team**: 15s specialist cache, 10s coordination cache
- **Superintelligence**: Redis distributed caching
- **Personal Companion**: SQLite indexing + memory optimization
- **AI Commander**: Real-time data aggregation

### **Database Optimization**
- **PostgreSQL**: pgvector indexes for semantic search
- **SQLite**: FTS (Full-Text Search) for memory queries
- **Redis**: LRU eviction for optimal memory usage

### **WebSocket Performance**
- Connection pooling across systems
- Message batching for high-frequency updates  
- Automatic reconnection with exponential backoff

---

## 🔐 **SECURITY ARCHITECTURE**

### **Authentication & Authorization**
- **JWT tokens**: Secure API access
- **CORS configuration**: Cross-origin protection
- **Rate limiting**: API endpoint protection
- **Input validation**: SQL injection prevention

### **Data Protection**
- **SQLite encryption**: Personal data protection
- **PostgreSQL SSL**: Encrypted database connections
- **Environment isolation**: Separate dev/prod configs
- **API key management**: Secure credential storage

### **Network Security**
- **HTTPS enforcement**: All production traffic
- **WebSocket security**: Origin validation
- **Port isolation**: Service-specific network segments

---

## 🧪 **TESTING & QUALITY**

### **Testing Frameworks**
- **Jest**: Unit and integration testing
- **Electron Testing**: Desktop app testing
- **WebSocket Testing**: Real-time communication testing
- **Database Testing**: SQLite and PostgreSQL testing

### **Code Quality**
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Nodemon**: Development auto-reload
- **Error Handling**: Comprehensive error capture and logging

---

## 🔄 **VERSION MANAGEMENT**

### **Node.js Versions**
- **Minimum**: Node.js 18.x
- **Recommended**: Node.js 20.x LTS
- **ES Modules**: Native ESM support required

### **Package Management**
- **npm**: Primary package manager
- **Lock Files**: package-lock.json for reproducible builds
- **Security Updates**: Regular dependency updates

### **API Versioning**
- **MCP Protocol**: Version 1.0
- **REST APIs**: Versioned endpoints (/v1/)
- **WebSocket**: Protocol version in handshake

---

*🚀 Komplett teknologi-dokumentasjon for verdens mest avanserte AI-utviklingssystem!*

---

## 📈 **ROADMAP & FUTURE TECHNOLOGY**

### **Planned Technologies**
- **Kubernetes**: Container orchestration
- **GraphQL**: Unified API layer
- **TypeScript**: Full type safety migration
- **Docker**: Containerization for scalability
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions automation

### **AI Technology Evolution**
- **Multi-model**: Support for additional AI providers
- **Vector Databases**: Specialized vector storage
- **Edge Deployment**: Local AI model support
- **Real-time Training**: Continuous learning systems