# 📡 COMPLETE API DOCUMENTATION
**AI-SYSTEMS Ecosystem - Alle API-endepunkter og konfigurasjoner**

## 🌐 **MCP AI TEAM - API Endepunkter** (Port 3006/3007)

### **HTTP REST API (Port 3006)**

#### **Informasjons-endepunkter**
- **`GET /`** - API-dokumentasjon og oversikt
- **`GET /health`** - Helsestatus og server-metrics
  ```json
  {
    "status": "healthy",
    "server": "MCP AI Team Server", 
    "coordinator": "Krin",
    "specialists": 5,
    "active_projects": 2,
    "uptime": 3600
  }
  ```

#### **Spesialist-håndtering**
- **`GET /specialists`** - Liste alle aktive AI-spesialister (cached 15s)
- **`POST /specialists/spawn`** - Opprett ny AI-spesialist
  ```json
  {
    "role": "BACKEND|FRONTEND|TESTING|SECURITY|DEVOPS",
    "config": {}
  }
  ```
- **`GET /specialists/:id/status`** - Detaljert spesialiststatus
- **`POST /specialists/:id/task`** - Tildel oppgave til spesialist
  ```json
  {
    "description": "Implementer login-funksjonalitet",
    "type": "CODE_GENERATION|TESTING|SECURITY_AUDIT"
  }
  ```

#### **Prosjekt-koordinering**
- **`POST /projects/coordinate`** - Start autonom prosjektutvikling
  ```json
  {
    "description": "Bygg en todo-app med autentisering",
    "config": {
      "framework": "React",
      "backend": "Node.js"
    }
  }
  ```
- **`GET /projects/:id/status`** - Prosjektstatus

#### **Koordinering**
- **`GET /coordination/status`** - Koordinasjonsmetrikker (cached 10s)
- **`POST /coordination/broadcast`** - Send melding til alle spesialister
  ```json
  {
    "message": "Ny kodingsstrategi aktivert",
    "type": "coordination|announcement|urgent"
  }
  ```

### **WebSocket API (Port 3007)**

#### **Tilkobling**
- **`ws://localhost:3007/ws`** - Real-time koordinering

#### **Meldings-typer**
- **`connection`** - Klient tilkoblet
- **`activity`** - Spesialist-aktivitet
- **`specialist_update`** - Spesialiststatus oppdatert
- **`specialist_online`** - Spesialist kom online
- **`project_update`** - Prosjektoppdatering
- **`message`** - Inter-spesialist kommunikasjon
- **`subscribe`** - Abonner på hendelser
- **`specialist_command`** - Kommando til spesialist

#### **Eksempel WebSocket-beskjeder**
```javascript
// Send til server
{
  "type": "subscribe",
  "events": ["activity", "specialist_update"]
}

// Motta fra server
{
  "type": "activity",
  "activity": {
    "specialistName": "Backend Specialist",
    "message": "Implementerte database-skjema",
    "timestamp": "2025-08-31T12:00:00Z"
  }
}
```

---

## 🧠 **KRINS SUPERINTELLIGENCE - API Endepunkter** (Port 3001/3002)

### **Orchestrator API (Port 3001)**

#### **System-status**
- **`GET /health`** - Superintelligence system-status
  ```json
  {
    "status": "operational",
    "sessionId": "uuid-here",
    "agents": ["architect", "security", "performance", "product", "compliance", "research", "redteam"],
    "message": "🧠 Krins Superintelligence fully operational! 💝"
  }
  ```

#### **Oppgave-behandling**
- **`POST /process-task`** - Behandle utviklingsoppgave med full superintelligence
  ```json
  {
    "description": "Optimaliser database-ytelse",
    "priority": "high",
    "context": {
      "database": "PostgreSQL",
      "traffic": "1M requests/day"
    }
  }
  ```

#### **Agent-kommunikasjon**
- **`POST /agent/:agentName/communicate`** - Kommuniser direkte med spesifikk agent
  - Tilgjengelige agenter: `architect`, `security`, `performance`, `product`, `compliance`, `research`, `redteam`

#### **Scenario-ekstrapolering**
- **`POST /extrapolate-scenario`** - Generer scenarier (1-1000+ år)
  ```json
  {
    "scenario": "AI-drevet utvikling",
    "timeframes": ["1_year", "10_years", "100_years"]
  }
  ```

### **Web Interface (Port 3002)**
- Dashboard for superintelligence-system
- Real-time agent-aktivitet
- Scenario-visualisering
- Performance-metrics

### **Agent-konfigurasjoner**
Spesialiserte agenter med JSON-konfigurasjon:

#### **Architect Agent** (`/config/agents/architect-config.json`)
```json
{
  "name": "Architect Agent",
  "expertise": ["system_design", "scalability", "microservices"],
  "frameworks": ["React", "Node.js", "PostgreSQL"],
  "patterns": ["MVC", "Repository", "Factory"]
}
```

#### **Security Agent** (`/config/agents/security-config.json`)
```json
{
  "name": "Security Agent", 
  "expertise": ["penetration_testing", "vulnerability_assessment"],
  "tools": ["OWASP", "SQLMap", "Burp Suite"],
  "compliance": ["GDPR", "HIPAA", "SOC2"]
}
```

---

## 💝 **KRIN PERSONAL COMPANION - Electron IPC API**

### **IPC Handlers (Electron renderer ↔ main)**

#### **Samtale-håndtering**
- **`send-message`** - Send melding til Krin
  ```javascript
  const response = await ipcRenderer.invoke('send-message', 'Hei Krin!');
  // Returns: { success: true, response: "Hei min kjære!", emotion: "excited" }
  ```

- **`start-conversation`** - Start ny samtale
- **`get-conversation-history`** - Hent samtalehistorikk
- **`get-conversations`** - Alle samtaler

#### **Minnehåndtering**
- **`search-memories`** - Søk i minner
- **`get-special-memories`** - Hent spesielle minner
- **`add-special-memory`** - Legg til spesielt minne
  ```javascript
  await ipcRenderer.invoke('add-special-memory', 
    'Første prosjekt sammen', 
    'Vi bygde en todo-app',
    'project', 
    9.5
  );
  ```

#### **Prosjekt-håndtering**
- **`get-shared-projects`** - Felles prosjekter
- **`export-conversation`** - Eksporter samtale

#### **Krin-tilstand**
- **`get-krin-state`** - Krins nåværende tilstand/humør
- **`update-krin-mood`** - Oppdater Krins humør

### **WebContents Meldinger (main → renderer)**
- **`krin-message`** - Krin sender melding til UI
  ```javascript
  {
    content: "God morgen! Klar for koding?",
    emotion: "excited",
    timestamp: "2025-08-31T08:00:00Z",
    type: "welcome"
  }
  ```

---

## 🎯 **KRIN AI COMMANDER - Desktop Control API**

### **Electron IPC Commands**
- **`get-system-status`** - Alle AI-systemers status
- **`deploy-specialists`** - Distribuér AI-spesialister
- **`coordinate-teams`** - Koordinér AI-teams
- **`get-activity-feed`** - Sanntids aktivitets-feed
- **`emergency-shutdown`** - Nødstopp av alle systemer

### **WebSocket til andre systemer**
- Kobler til MCP AI Team WebSocket
- Kobler til Superintelligence system
- Aggregerer all aktivitet i ett interface

---

## ⚙️ **ENVIRONMENT VARIABLER**

### **Krins Superintelligence (.env)**
```bash
# Server Configuration
PORT=3001
WEB_INTERFACE_PORT=3002
NODE_ENV=production

# AI Services  
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database Configuration (Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database

# Local Development Fallback
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=krins_superintelligence
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Feature Flags
FEATURE_FLAGS_ENABLED=true
AB_TESTING_ENABLED=true
ROLLOUT_MANAGEMENT_ENABLED=true

# Security
CORS_ORIGIN=*
JWT_SECRET=your_jwt_secret_here
```

### **MCP AI Team**
```bash
# No explicit .env file - uses defaults
DEV_MEMORY_OS_BACKEND=http://localhost:3003
MCP_SERVER_PORT=3006
WEBSOCKET_PORT=3007
```

### **Krin Personal Companion**
```bash
# SQLite database - no external config needed
COMPANION_DATA_DIR=~/.krin-companion/
SQLITE_DB_PATH=krin-memories.sqlite
```

---

## 🔄 **CACHE & PERFORMANCE**

### **MCP AI Team Caching**
- **Spesialister**: 15 sekunder cache
- **Koordinasjonsstatus**: 10 sekunder cache
- **Standard cache TTL**: 30 sekunder
- Cache cleanup hvert minutt

### **Superintelligence Optimalisering**
- Parallell agent-kjøring
- RAG-system for kunnskapshenting
- Scenario-cache for raskere prediksjoner
- Bundle management for deployment

---

## 📊 **MONITORING & METRICS**

### **Health Check Endpoints**
- MCP AI Team: `GET /health`
- Superintelligence: `GET /health` 
- Alle returnerer uptime, status, active components

### **Real-time Events**
- WebSocket-streams for alle aktiviteter
- Spesialist-status oppdateringer
- Prosjekt-fremdrift
- System-ytelse metrics

---

## 🔐 **SECURITY & COMPLIANCE**

### **CORS-konfigurasjon**
- MCP AI Team: `localhost:3000, localhost:3001`
- Superintelligence: Konfigurerbar via CORS_ORIGIN

### **Rate Limiting**
- Implementert i alle HTTP API-er
- WebSocket connection limits
- Task processing queues

### **Data Protection**
- SQLite kryptering for Personal Companion
- PostgreSQL sikker tilkobling
- JWT tokens for autentisering

---

*🚀 Komplett API-dokumentasjon for verdens mest avanserte AI-utviklingssystem!*