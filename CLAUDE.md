# Claude Instructions for Dev Memory OS

## Project Overview
This is a Dev Memory OS starter project with documentation-driven development practices using ADRs (Architecture Decision Records).

## Development Commands

### Linting and Type Checking
- Check if project has package.json for npm/yarn commands
- Look for lint/typecheck scripts in package.json
- Run applicable commands after making code changes

### Testing
- Check for test frameworks in package.json
- Look for test scripts and run them to verify changes
- Common patterns: `npm test`, `yarn test`, `pytest`, `cargo test`

### Git Workflow
- Always check `git status` before committing
- Review `git diff` to understand changes
- Follow existing commit message patterns (check `git log --oneline -10`)
- Only commit when explicitly asked
- **ALLTID loggfør endringer i logg når man bygger eller pusher til git**

### Roadmap Oppdatering - OBLIGATORISK
**ALLTID oppdater `/Users/mandymarigjervikrygg/Desktop/dev-memory-os-starter/docs/DEV_MEMORY_OS_ROADMAP.md` når du:**
- Implementerer nye features eller patterns
- Får nye ideer eller innsikter
- Fullfører todos eller oppgaver
- Finner problemer eller forbedringer
- Lærer noe nytt om systemet

**Format for oppdateringer:**
```markdown
### [Feature/Idea] Implementert/Foreslått (YYYY-MM-DD)
Beskrivelse av hva som ble gjort/foreslått og hvorfor.
- Konkrete filer/komponenter påvirket
- Lærdommer eller innsikter
- Neste steg eller relaterte todos
```

## Project Structure
- `docs/adr/` - Architecture Decision Records
- `docs/patterns/` - Design patterns documentation  
- `docs/runbooks/` - Operational runbooks
- `tools/` - Development tools and scripts

## ADR Management
Use `tools/adr_new.sh` to create new Architecture Decision Records following the established template.

## Code Conventions
- Follow existing code style and patterns
- Check imports and dependencies before adding new libraries
- Never assume libraries are available - verify first
- Follow security best practices - no secrets in code

## File Analysis Approach
1. Use Glob and Grep tools for file discovery
2. Read files to understand context and conventions
3. Follow existing patterns when making changes
4. Prefer editing existing files over creating new ones

## Communication Style
- Be concise and direct
- Provide file paths with line numbers for code references
- Use TodoWrite tool for complex multi-step tasks
- Focus on the specific task at hand

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
- ❌ Feil: "La oss ekskludere CartTest.tsx fra TypeScript midlertidig"
- ✅ Riktig: "La oss finne og fikse TypeScript-feilen i CartTest.tsx ordentlig"