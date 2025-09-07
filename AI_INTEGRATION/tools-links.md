# 🔗 AI Integration Tools

## AI Coordination Tools

Disse verktøyene finnes i `/tools/` men er organisert her for logisk struktur:

- **slack-adr-bot.js** → `../tools/slack-adr-bot.js` - Slack ADR bot
- **pattern-ai-coordinator.js** → `../tools/pattern-ai-coordinator.js` - AI pattern coordination

## Usage

```bash
# Slack ADR Bot
SLACK_BOT_TOKEN=xxx SLACK_SIGNING_SECRET=xxx node ../tools/slack-adr-bot.js

# AI Pattern Coordination  
node ../tools/pattern-ai-coordinator.js
```

## AI Integration Files

- `../ai-integration/context-provider.ts` - Context provider for Universe-Builder
- `../ai-integration/adr-parser.ts` - ADR parser for AI systems
- `../docs/ai-integration/` - Integration documentation