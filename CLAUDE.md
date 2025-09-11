# Claude Instructions for KRINS-Chronicle-Keeper

## Project Overview
This is the KRINS-Chronicle-Keeper organizational intelligence system with advanced ADR management, AI integration, and institutional memory capture.

## Development Commands

### Linting and Type Checking
- Check TypeScript files: `bun run typecheck` (if configured)
- Check for lint scripts in package.json
- Run applicable commands after making code changes

### Testing
- Look for Bun/Node test frameworks in tools/ directory
- Test decision tracker: `bun DECISION_MANAGEMENT/decision-tracker.ts`
- Test context provider: `bun AI_INTEGRATION/context-provider.ts`
- Common patterns: `bun test`, `npm test`

### Git Workflow
- Always check `git status` before committing
- Review `git diff` to understand changes
- Follow existing commit message patterns (check `git log --oneline -10`)
- Only commit when explicitly asked
- **ALLTID loggfør endringer i KRINS-WORKFLOW.md når man bygger eller pusher til git**

### ADR Management
Use `./tools/adr_new.sh` to create new Architecture Decision Records:
```bash
./tools/adr_new.sh "Decision Title" "component/system"
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
# Capabilities
pnpm -w run krins:add capability "Feature Name" "Description" "category"

# ADR Decisions  
pnpm -w run krins:add adr "ADR-0006" "Decision Title" "approved" "2025-Q4"

# AI Agents
pnpm -w run krins:add agent "Agent Name" "Capabilities" "type" "status"

# Releases
pnpm -w run krins:add release "v2.1.0" "Features" "minor" "production"

# System Metrics
pnpm -w run krins:add metric "Metric Name" "Value" "trend" "status"
```

**DASHBOARD OPPDATERING:**
```bash
# Auto-update live dashboard
pnpm -w run dashboard:update

# System overview
pnpm -w run krins:status

# AI insights
pnpm -w run krins:insights
```

## Project Structure
- `docs/adr/` - Architecture Decision Records with templates
- `docs/patterns/` - Multi-language code patterns (TypeScript/Python/Java)
- `docs/runbooks/` - Operational runbooks (incident, maintenance, troubleshooting)
- `DECISION_MANAGEMENT/` - Decision tracker, linker, evidence collector
- `AI_INTEGRATION/` - Context provider, ADR parser for AI systems
- `GOVERNANCE_PROCESS/` - CI/CD gates and compliance
- `KNOWLEDGE_ORGANIZATION/` - Pattern and runbook systems
- `TEAM_COLLABORATION/` - Multi-team coordination
- `ORGANIZATIONAL_INTELLIGENCE/` - Analytics and insights
- `tools/` - Development tools and scripts

## MCP Integration
This project includes `.mcp.json` configuration for Claude Code with:
- **krins-commands** - Custom MCP server using context-provider.ts
- **filesystem** - File system access for current directory
- **everything** - Demo MCP server for testing

Restart Claude Code session to reload MCP configuration changes.

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
1. **Context Provider** - Supplies organizational context to AI systems
2. **ADR Parser** - Extracts actionable intelligence from decisions
3. **Decision Tracker** - Manages ADR lifecycle and analytics
4. **Pattern Library** - Code patterns for consistent generation

## Key Documentation References
- **KRINS-CAPABILITIES.md** - Complete feature overview with timeline tracking
- **README-DOCS.md** - Comprehensive navigation guide for all documentation  
- **README.md** - Main project overview and quick start guide
- **KRINS-WORKFLOW.md** - Development workflow and progress tracking

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