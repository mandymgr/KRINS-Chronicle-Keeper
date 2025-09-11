# KRINS-REPORT.md - Prosjektanalyse
Generert: Thu Sep 11 10:10:29 CEST 2025

## 🏗️ Prosjektstruktur
```
.
./.vercel
./.vercel/README.txt
./.vercel/project.json
./DECISION_MANAGEMENT
./DECISION_MANAGEMENT/README.md
./DECISION_MANAGEMENT/__tests__
./DECISION_MANAGEMENT/__tests__/decision-tracker.test.ts
./DECISION_MANAGEMENT/adr_new.sh
./DECISION_MANAGEMENT/decision-impact-tracker.ts
./DECISION_MANAGEMENT/decision-linker.ts
./DECISION_MANAGEMENT/decision-tracker.ts
./DECISION_MANAGEMENT/evidence-collector.ts
./DECISION_MANAGEMENT/workflow.sh
./ai-systems
./ai-systems/ai-personality-matcher
./ai-systems/ai-personality-matcher/companion-generator.js
./ai-systems/ai-systems-reference
./ai-systems/ai-systems-reference/README.md
./ai-systems/ai-systems-reference/ai-specialist-coordinator.js
./ai-systems/ai-systems-reference/bun.lock
./ai-systems/ai-systems-reference/create-ai-specialists.js
./ai-systems/ai-systems-reference/docs
./ai-systems/ai-systems-reference/docs/TRIPLE_AI_COORDINATION_SUCCESS.md
./ai-systems/ai-systems-reference/krin-team-coordination-protocol.js
./ai-systems/ai-systems-reference/nordic-design-system.css
./ai-systems/ai-systems-reference/package.json
./ai-systems/ai-systems-reference/websocket-ai-bridge.js
./ai-systems/mcp-ai-team
./ai-systems/mcp-ai-team/.mcp.json
./ai-systems/mcp-ai-team/Dockerfile
./ai-systems/mcp-ai-team/bun.lock
./ai-systems/mcp-ai-team/package.json
./ai-systems/mcp-ai-team/src
./ai-systems/mcp-ai-team/src/mcp-server.js
./ai-systems/mcp-ai-team/src/security-specialist.js
./ai-systems/mcp-ai-team/test-file.js
./ai-systems/mcp-ai-team/test-mcp-server.js
./semantic-search-backend
./semantic-search-backend/.env.example
./semantic-search-backend/README.md
./semantic-search-backend/logs
./semantic-search-backend/package.json
./semantic-search-backend/search-performance-monitor.ts
./semantic-search-backend/src
./semantic-search-backend/src/memory-store.js
./semantic-search-backend/src/pattern-matcher.js
./semantic-search-backend/src/semantic-engine.js
./semantic-search-backend/src/server.js
./semantic-search-backend/src/validators.js
```

## 📁 Filer og Teknologier
### Filtyper:
- js: 271 filer
- tsx: 204 filer
- pak: 174 filer
- json: 144 filer
- ts: 136 filer
- md: 131 filer
- py: 56 filer
- sh: 29 filer
- css: 24 filer
- jsx: 22 filer
- html: 18 filer
- pyc: 17 filer
- plist: 17 filer
- lock: 17 filer
- woff2: 11 filer
- yml: 9 filer
- svg: 9 filer
- dylib: 9 filer
- example: 8 filer
- txt: 6 filer

### Konfigurasjonsfiler:
- ./.vercel
- ./semantic-search-backend/package.json
- ./github-webhook-handler/package.json
- ./tools/package.json
- ./architecture-improvements-backup/jest.config.js
- ./frontend/.vercel
- ./frontend/tailwind.config.js
- ./frontend/Dockerfile
- ./frontend/Dockerfile 3
- ./frontend/package.json
- ./frontend/vite.config.ts
- ./frontend/postcss.config.js
- ./config/bunfig.toml
- ./config/railway.toml
- ./config/package.json
- ./config/docker-compose.yml
- ./Dockerfile
- ./jest.config.js
- ./bunfig.toml
- ./backend/Dockerfile

## 📦 Avhengigheter (package.json)
### Dependencies:
-   dependencies: {
-     @slack/bolt: ^3.14.0
-     @octokit/rest: ^20.0.2
-     openai: ^4.20.1
-     dotenv: ^16.3.1
-     commander: ^11.0.0
-     chalk: ^5.3.0
-     inquirer: ^9.2.0
-     fs-extra: ^11.1.1
-     glob: ^10.3.0

### DevDependencies:
-   devDependencies: {
-     @types/node: ^20.0.0
-     @types/uuid: ^9.0.0
-     @types/fs-extra: ^11.0.0
-     typescript: ^5.0.2
-     husky: ^8.0.3
-     prettier: ^3.0.0
-     eslint: ^8.45.0
-     @typescript-eslint/eslint-plugin: ^6.0.0
-     @typescript-eslint/parser: ^6.0.0

## 🔧 Skript og Kommandoer
### NPM Scripts:
-   scripts: {
-     dev: node scripts/dev-orchestrator.js start
-     dev:legacy: concurrently \bun run dev:backend\ \bun run dev:frontend\ \docker-compose up postgres redis -d\
-     dev:backend: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
-     dev:frontend: cd frontend && bun run dev
-     dev:containers: docker-compose up postgres redis -d
-     dev:watch: docker-compose watch
-     build: node scripts/build-all-systems.js
-     build:legacy: bun run build:frontend && bun run build:backend
-     build:frontend: cd frontend && bun install && bun run build
-     build:backend: cd backend && pip install -r requirements.txt
-     start: docker-compose up --build
-     start:production: NODE_ENV=production docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
-     stop: docker-compose down
-     db:up: docker-compose up postgres redis -d
-     db:down: docker-compose stop postgres redis
-     db:reset: docker-compose down -v && docker-compose up postgres redis -d
-     migrate: cd backend && python migrate.py
-     migrate:reset: cd backend && python migrate.py --reset
-     logs: docker-compose logs -f
-     logs:api: docker-compose logs -f fastapi

## 📄 Dokumentasjon
- ./DECISION_MANAGEMENT/README.md
- ./.vercel/README.txt
- ./semantic-search-backend/README.md
- ./ai-systems/ai-systems-reference/docs/TRIPLE_AI_COORDINATION_SUCCESS.md
- ./ai-systems/ai-systems-reference/README.md
- ./ai-systems/ai-personality-matcher/README.md
- ./ai-systems/COMPLETE_TECHNOLOGY_DOCUMENTATION.md
- ./ai-systems/krins-superintelligence-team/README.md
- ./ai-systems/mcp-adapter/README.md
- ./ai-systems/krin-personal-companion/KRIN-SYSTEM/README_KRIN_SYSTEM.md

## 🔒 Miljøvariabler og Konfig
- ./semantic-search-backend/.env.example (ikke lest av sikkerhetshensyn)
- ./ai-systems/krins-superintelligence-team/.env.example (ikke lest av sikkerhetshensyn)
- ./ai-systems/mcp-adapter/.env (ikke lest av sikkerhetshensyn)
- ./.env.production (ikke lest av sikkerhetshensyn)
- ./frontend/.env.production (ikke lest av sikkerhetshensyn)
- ./archive/examples-archive/examples-archive/chat-backend/.env.example (ikke lest av sikkerhetshensyn)
- ./archive/implementations/ai-team-mcp-adapter/.env.example (ikke lest av sikkerhetshensyn)
- ./config/.env.production (ikke lest av sikkerhetshensyn)
- ./config/.env.template (ikke lest av sikkerhetshensyn)
- ./config/.env.railway (ikke lest av sikkerhetshensyn)
- ./KRINS-HUB/backend-api/.env (ikke lest av sikkerhetshensyn)
- ./KRINS-HUB/backend-api/.env.example (ikke lest av sikkerhetshensyn)
- ./backend/.env.template (ikke lest av sikkerhetshensyn)
- ./backend/.env (ikke lest av sikkerhetshensyn)
- ./backend/.env.example (ikke lest av sikkerhetshensyn)
- ./DASHBOARD/living-spec-dashboard/.env.example (ikke lest av sikkerhetshensyn)
- ./.env.template (ikke lest av sikkerhetshensyn)
- ./ai-pattern-bridge/.env.example (ikke lest av sikkerhetshensyn)

## 📊 Kodemetrikker
### Filstørrelser:
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (144560160 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (144560160 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (144560160 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/Krin (103559155 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/Krin (100018843 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (37656582 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (16558616 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (16558616 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (16558616 bytes)
- ./quarantine-for-review/build-artifacts/krin-companion-KRIN-SYSTEM-dist/dist/mac-arm64/Krin (10717392 bytes)

### Kodelinjer (approx):
Total: 9687 linjer

## 🏃‍♂️ Anbefalinger
- Sjekk README.md for oppsett og bruk
- Gjennomgå package.json for avhengigheter
- Verifiser miljøvariabler i .env-filene
- Test bygging og kjøring av prosjektet

---
*Rapport generert automatisk*
