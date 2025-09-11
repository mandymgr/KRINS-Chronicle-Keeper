# Claude Instructions for KRINS-Chronicle-Keeper

## Project Overview
This is the KRINS-Chronicle-Keeper organizational intelligence system with advanced ADR management, AI integration, and institutional memory capture.

## Development Commands

### Modern Development Workflow (2025)
```bash
# Primary development commands
pnpm run dev                    # Start complete dev environment with orchestrator
pnpm run build                  # Build all systems (frontend, backend, AI)
pnpm run dev:status            # Check development services status
pnpm run dev:stop              # Stop all development services
pnpm run dev:restart           # Restart all or specific services

# Legacy development commands
pnpm run dev:legacy            # Traditional concurrent startup
pnpm run dev:backend           # Backend only (FastAPI)
pnpm run dev:frontend          # Frontend only (React + Vite)
pnpm run dev:containers        # Database containers only
```

### System Management & Orchestration
```bash
# KRINS Unified Tracking System
pnpm run krins:status          # System status dashboard
pnpm run krins:add             # Add capabilities/ADRs/agents/releases
pnpm run krins:timeline        # Development timeline
pnpm run krins:insights        # AI-powered insights
pnpm run dashboard:update      # Update live dashboard metrics

# Capability Management
pnpm run capability:add "Feature Name" "Description" "category"
pnpm run capability:list       # List all tracked capabilities
```

### AI System Management
```bash
# Unified AI operations
pnpm run ai:unified            # Launch AI coordination hub
pnpm run ai:context            # Generate contextual intelligence
pnpm run ai:status             # AI agents status
pnpm run ai:demo               # AI system demonstration

# Individual AI components
pnpm run krin:start            # KRIN Companion terminal
pnpm run mcp:start             # MCP server for Claude Code
pnpm run mcp:team              # MCP AI Team coordination
```

### Build & Deployment
```bash
# Complete system builds
pnpm run build                 # Build all systems using orchestrator
pnpm run build:verify         # Build with verification
pnpm run setup:complete       # Complete project setup

# Individual system builds
pnpm run build:frontend       # React frontend build
pnpm run build:backend        # Python backend setup
pnpm run build:ai-systems     # All AI system builds
```

### Linting and Type Checking
```bash
# Modern type checking
pnpm run typecheck             # Complete TypeScript validation
pnpm run typecheck:decision-management  # Decision management types
pnpm run typecheck:ai-integration       # AI integration types

# Code quality
pnpm run lint                  # Full project linting
pnpm run lint:typescript       # TypeScript linting
pnpm run lint:backend          # Python backend linting
```

### Testing Framework
```bash
# Comprehensive testing
pnpm run test                  # Full test suite
pnpm run test:decision-management  # Decision tracker tests
pnpm run test:ai-integration       # AI integration tests
pnpm run test:ai-systems           # AI system coordination tests
pnpm run test:integration          # Backend integration tests
```

### Git Workflow
- Always check `git status` before committing
- Review `git diff` to understand changes
- Follow existing commit message patterns (check `git log --oneline -10`)
- Only commit when explicitly asked
- **ALLTID loggfør endringer i KRINS-WORKFLOW.md når man bygger eller pusher til git**

### ADR Management
```bash
# Create new ADRs
./tools/adr_new.sh "Decision Title" "component/system"
pnpm run adr:new               # Alternative ADR creation

# Decision tracking and analytics
pnpm run decision:track        # Track decision implementations
pnpm run decision:analytics    # Decision effectiveness analytics
pnpm run decision:report       # Generate decision reports
```

### KRINS Workflow Oppdatering - OBLIGATORISK
**ALLTID oppdater `KRINS-WORKFLOW.md` når du:**
- Implementerer nye capabilities eller tools
- Får nye ideer eller innsikter om organizational intelligence
- Fullfører todos eller oppgaver
- Finner problemer eller forbedringer i decision tracking
- Lærer noe nytt om AI integration eller ADR parsing
- Oppdaterer pattern libraries eller runbooks

**Format for oppdateringer:**
```markdown
### [Feature/Idea] Implementert/Foreslått (YYYY-MM-DD)
Beskrivelse av hva som ble gjort/foreslått og hvorfor.
- Konkrete filer/komponenter påvirket
- Lærdommer eller innsikter
- Neste steg eller relaterte todos
```

### KRINS Unified Tracking System - OBLIGATORISK
**ALLTID oppdater systemet når du:**
- Implementerer nye funksjoner eller capabilities
- Forbedrer eksisterende systemer 
- Lanserer nye AI-agenter eller komponenter
- Deployer nye integrasjoner eller workflows
- Fullfører milestone features
- Tar arkitekturale beslutninger (ADRs)
- Deployer nye releases

**UNIFIED TRACKING KOMMANDOER:**
```bash
# Modern tracking commands (preferred)
pnpm run krins:add capability "Feature Name" "Description" "category"
pnpm run krins:add adr "ADR-0006" "Decision Title" "approved" "2025-Q4"
pnpm run krins:add agent "Agent Name" "Capabilities" "type" "status"
pnpm run krins:add release "v2.1.0" "Features" "minor" "production"
pnpm run krins:add metric "Metric Name" "Value" "trend" "status"

# Legacy workspace commands (still supported)
pnpm -w run krins:add capability "Feature Name" "Description" "category"
```

**DASHBOARD & ANALYTICS:**
```bash
# System status and insights
pnpm run krins:status          # Comprehensive system dashboard
pnpm run krins:timeline        # Development timeline view
pnpm run krins:insights        # AI-powered system insights
pnpm run dashboard:update      # Update live dashboard metrics

# Capability management
pnpm run capability:add        # Interactive capability addition
pnpm run capability:list       # List all tracked capabilities
```

**TRACKING WORKFLOW INTEGRATION:**
```bash
# Automatic tracking when using development commands
pnpm run build                 # Auto-logs build metrics
pnpm run dev                   # Tracks development sessions
pnpm run ai:status            # Updates AI agent performance metrics
```

## Project Structure

### Core Capabilities
- `docs/adr/` - Architecture Decision Records with templates
- `docs/patterns/` - Multi-language code patterns (TypeScript/Python/Java)
- `docs/runbooks/` - Operational runbooks (incident, maintenance, troubleshooting)
- `DECISION_MANAGEMENT/` - Decision tracker, linker, evidence collector
- `AI_INTEGRATION/` - Advanced AI systems and coordination
- `GOVERNANCE_PROCESS/` - CI/CD gates and compliance
- `KNOWLEDGE_ORGANIZATION/` - Pattern and runbook systems
- `TEAM_COLLABORATION/` - Multi-team coordination
- `ORGANIZATIONAL_INTELLIGENCE/` - Analytics and insights

### Modern Development Infrastructure
- `frontend/` - React + TypeScript web interface with Kinfolk design
- `backend/` - FastAPI Python backend with PostgreSQL + pgvector
- `scripts/` - Modern orchestration and build systems
- `tools/` - Development tools and KRINS tracking utilities

### AI Ecosystem
- `ai-systems/` - Complete AI agent implementations
- `mcp-ai-team/` - MCP protocol AI team coordination
- `semantic-search-backend/` - Vector-based intelligence search
- `ai-pattern-bridge/` - GitHub webhook AI integration
- `github-webhook-handler/` - Automated repository intelligence

### Frontend Application Structure
- `frontend/src/pages/Dashboard.tsx` - Main system dashboard
- `frontend/src/pages/ADRs.tsx` - Decision management interface
- `frontend/src/pages/Analytics.tsx` - System analytics and metrics
- `frontend/src/pages/Intelligence.tsx` - AI intelligence hub
- `frontend/src/pages/Settings.tsx` - User configuration
- `frontend/src/design-system/` - Kinfolk-inspired design tokens

## MCP Integration & Claude Code

### MCP Servers Configuration
This project includes comprehensive `.mcp.json` configuration with 3 specialized servers:

```json
{
  "krins-unified-intelligence": {
    "command": "bun AI_INTEGRATION/unified-ai-launcher.js context",
    "description": "Unified AI intelligence with full context awareness"
  },
  "krins-commands": {
    "command": "bun AI_INTEGRATION/context-provider.ts",
    "description": "Context-aware code generation and analysis"
  },
  "ai-team-coordinator": {
    "command": "node AI_INTEGRATION/mcp-team/src/mcp-server.js",
    "description": "Multi-agent AI team coordination"
  }
}
```

### Available MCP Commands (25+ specialized commands)

#### **konsistent-kode** - Code Generation
- Generate new patterns following project conventions
- Create tools with TypeScript/Bun structure
- Auto-generate ADRs with proper formatting

#### **dybde-analyse** - Code Analysis
- Analyze project structure and identify inconsistencies
- Find missing patterns across TypeScript/JavaScript files
- Map dependencies and suggest architectural improvements
- Analyze code complexity and suggest simplifications

#### **dokumentasjon** - Documentation Automation
- Generate comprehensive README files for capabilities
- Update integration guides based on current implementation
- Suggest test strategies for tools directory
- Document APIs from TypeScript interfaces

#### **arkitektur-optimalisering** - Architecture Optimization
- Check consistency across capability directories
- Analyze performance bottlenecks and suggest optimizations
- Identify refactoring opportunities
- Validate alignment with ADRs

#### **ai-intelligence** - AI Operations
- Unified context generation with Krin + Chronicle Keeper
- Memory management and personality matching
- AI system demonstrations and testing

#### **prosjekt-spesifikt** - Project-Specific Operations
- Update ADR and pattern indexes
- Generate capability overviews
- Verify AI integration functionality
- Check unified AI system status

**Usage:** Commands are automatically available in Claude Code sessions.
**Restart Claude Code** to reload configuration changes.

## Code Conventions
- **TypeScript with Bun runtime** - Primary language for tools
- **Emoji usage** - Consistent use in documentation and logging (📋 🧠 🎯 etc.)
- **Capability-based organization** - Directories grouped by functionality
- **Comprehensive logging** - All tools include detailed console output
- **Interface-driven** - Strong TypeScript interfaces throughout
- Check imports and dependencies before adding new libraries
- Never assume libraries are available - verify first
- Follow security best practices - no secrets in code

## File Analysis Approach
1. Use Glob and Grep tools for file discovery
2. Read files to understand context and conventions
3. Follow existing patterns when making changes
4. Prefer editing existing files over creating new ones
5. Use Task tool for complex multi-file analysis

## AI Integration Workflow

### Core AI Components
1. **Unified AI Launcher** (`unified-ai-launcher.js`) - Central coordination hub
2. **Context Provider** (`context-provider.ts`) - Organizational context for AI systems  
3. **ADR Parser** (`adr-parser.ts`) - Extracts actionable intelligence from decisions
4. **Decision Tracker** (`decision-tracker.ts`) - Manages ADR lifecycle and analytics
5. **Code Generation Advisor** (`code-generation-advisor.ts`) - AI-guided development
6. **Onboarding Intelligence** (`onboarding-intelligence.ts`) - Smart team onboarding

### AI System Architecture
```bash
# AI System Status
pnpm run ai:unified status     # Complete system overview

# Context Generation
pnpm run ai:context "query"    # Generate contextual intelligence

# Memory & Personality
pnpm run krin:companion         # KRIN personal AI assistant
pnpm run personality:test       # Test personality matching

# Team Coordination
pnpm run mcp:team              # Multi-agent coordination
```

### AI Intelligence Features
- **RAG System** - Vector embeddings with pgvector (3072D)
- **Scenario Extrapolation** - Predictive modeling for decisions
- **Pattern Recognition** - Automated code pattern analysis
- **Cross-System Learning** - Knowledge transfer between projects
- **Real-time Coordination** - WebSocket streaming for AI communication

## Key Documentation References
- **KRINS-CAPABILITIES.md** - Complete feature overview with 80+ tracked capabilities
- **README-DOCS.md** - Comprehensive navigation guide for all documentation  
- **README.md** - Main project overview and quick start guide
- **KRINS-WORKFLOW.md** - Development workflow and progress tracking
- **PROJECT_ANALYSIS_REPORT.md** - System analysis and insights

### Design System Documentation
- **Kinfolk Design System** - Premium editorial aesthetics with authentic color palette
- **Typography System** - Playfair Display, Inter, Crimson Text editorial fonts
- **Massive Whitespace** - Progressive spacing system for premium feel
- **Authentic Colors** - Forest green, sage, terracotta, warm browns
- **Responsive Grid** - Asymmetric layouts with magazine-style composition

## Communication Style
- Be concise and direct
- Provide file paths with line numbers for code references
- Use TodoWrite tool for complex multi-step tasks
- Focus on the specific task at hand
- Reference KRINS-CAPABILITIES.md when discussing system features

### ALLTID BEST LØSNING PRINSIPPET
**Vi jobber alltid mot den beste, mest komplette løsningen - aldri halvveis!**

**Viktige prinsipper:**
- ✅ **ALDRI ekskluder filer eller hopp over problemer** - Vi fikser alt ordentlig
- ✅ **FERDIGSTILL hver oppgave fullstendig** før vi går videre til neste
- ✅ **LØSE problemer når de oppstår** - ikke midlertidige workarounds
- ✅ **PERFEKT implementering** - ikke "funker sånn noenlunde"
- ✅ **SYSTEMET SKAL VÆRE BEDRE ENN ALLE ANDRE** - høyeste kvalitet
- ⛔ **IKKE droppe ting fordi det stopper opp** - press gjennom til løsning

**Når problemer oppstår:**
1. Analyser problemet grundig
2. Finn rot-årsaken, ikke bare symptomene  
3. Implementer en komplett, elegant løsning
4. Test at alt fungerer perfekt
5. Dokumenter løsningen for fremtiden

**Eksempel på riktig tilnærming:**
- ❌ Feil: "La oss ekskludere decision-tracker.ts fra TypeScript midlertidig"
- ✅ Riktig: "La oss finne og fikse TypeScript-feilen i decision-tracker.ts ordentlig"

## KRINS-Chronicle-Keeper Spesifikke Kommandoer

### Decision Management
```bash
# Create new ADR
./tools/adr_new.sh "Use pgvector for semantic search" "platform/search"

# Analyze decisions
bun DECISION_MANAGEMENT/decision-tracker.ts analytics
bun DECISION_MANAGEMENT/decision-tracker.ts search "database"

# Generate decision report
bun DECISION_MANAGEMENT/decision-tracker.ts report > decision-report.md
```

### AI Context Generation
```bash
# Generate context for AI systems
bun AI_INTEGRATION/context-provider.ts generate claude-code code-generation "Create user auth"
bun AI_INTEGRATION/context-provider.ts generate universe-builder architecture-review "API design"

# Parse ADRs for actionable intelligence
bun AI_INTEGRATION/adr-parser.ts parse ADR-0001
bun AI_INTEGRATION/adr-parser.ts search --templates --actionable
```

### Pattern Management
```bash
# Create new pattern
node tools/create-pattern.js "API Response" typescript "Standardized API response format"
node tools/create-pattern.js "Database Service" backend "Database connection pattern" --create-adr

# List patterns
node tools/create-pattern.js --list
```

### Quality Assurance
```bash
# Run validation tools
node tools/validate-patterns.js
node tools/pattern-analytics-engine.js

# Check consistency across capabilities
claude "konsistenssjekk" # Using .mcp.json commands
claude "performance" # Analyze bottlenecks
```

## Integration with KRINS-Universe-Builder
This system provides organizational context to AI development systems:
1. **ADRs become AI context** - Architectural decisions guide code generation
2. **Patterns become AI templates** - Proven approaches for consistent code
3. **Runbooks inform operations** - Operational requirements built into generated code

Place both repositories side by side for automatic discovery:
```
your-workspace/
├── KRINS-Universe-Builder/     # AI development system
└── KRINS-Chronicle-Keeper/     # This organizational intelligence system
```

---
*KRINS-Chronicle-Keeper - Organizational Intelligence System for AI-Powered Development*