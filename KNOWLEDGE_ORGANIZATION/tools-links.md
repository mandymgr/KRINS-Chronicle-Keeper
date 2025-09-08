# 🔗 Knowledge Organization Tools

## Pattern Management Tools

Disse verktøyene finnes i `/tools/` men er organisert her for logisk struktur:

- **create-pattern.js** → `../tools/create-pattern.js` - Pattern generator
- **validate-patterns.js** → `../tools/validate-patterns.js` - Pattern validator  
- **pattern-analytics-engine.js** → `../tools/pattern-analytics-engine.js` - Analytics system

## Usage

```bash
# Pattern creation
node ../tools/create-pattern.js "Service Layer" "backend" "Service layer implementation"

# Pattern validation
node ../tools/validate-patterns.js

# Analytics
node ../tools/pattern-analytics-engine.js --report
```

## Files Organization

Alle pattern-relaterte dokumenter finnes også i:
- `../docs/patterns/` - Pattern library
- `../docs/runbooks/` - Operational procedures