# 🚀 AI Pattern Bridge System - Usage Guide

## Quick Reference

### 1. Start Auto-Capture System
```bash
cd ai-coordination/core
PORT=3002 AUTO_CREATE_ADR=true bun github-webhook-handler.js
```

### 2. Generate Multi-Terminal Tasks
```bash
# For any project, get specialized AI tasks:
node -e "
const { AIPatternBridge } = require('./core/ai-pattern-bridge');
const bridge = new AIPatternBridge();
bridge.generateAIInstructions('Your project description', 'project-type').then(console.log);
"
```

### 3. Coordinate Multiple AIs
- Copy tasks from `team-coordination/` to separate Claude Code terminals
- Each AI works on specialized component (frontend, backend, testing)
- Use pattern guidelines to ensure consistency

## System Files Location

```
ai-coordination/
├── core/                    # Main system components
├── patterns/               # Pattern library (5 patterns ready)
├── team-coordination/      # Multi-terminal task templates
├── examples/              # Working proof-of-concept projects
├── docs/                  # System documentation
└── templates/             # Code and doc templates
```

## Pattern-Driven Development Workflow

1. **Choose patterns** from `patterns/` folder
2. **Generate AI instructions** using core system
3. **Distribute tasks** to multiple AI terminals
4. **Auto-capture decisions** via GitHub webhooks
5. **Maintain quality** through pattern consistency

## Revolutionary Impact

This system enables:
- ✅ **Parallel AI development** - Multiple specialists working simultaneously
- ✅ **Pattern consistency** - Reusable solutions across projects
- ✅ **Auto-documentation** - Decisions captured automatically
- ✅ **Quality enforcement** - Built-in gates and guidelines

---

*Ready to revolutionize development with coordinated AI teams!*