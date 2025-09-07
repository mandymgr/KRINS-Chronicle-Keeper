#!/usr/bin/env bash
# 🤖 AI INTEGRATION Workflow Tool
# Quick access to AI coordination and integration tools

set -euo pipefail

show_help() {
  echo "🤖 AI INTEGRATION Workflow"
  echo ""
  echo "Commands:"
  echo "  slack-bot                          Start Slack ADR bot"
  echo "  ai-coordinator                     Run AI pattern coordinator"
  echo "  test-integration                   Test AI integration"
  echo "  check-status                       Check integration status"
  echo "  help                              Show this help"
  echo ""
  echo "Environment variables needed:"
  echo "  SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET (for Slack bot)"
}

case "${1:-help}" in
  "slack-bot")
    echo "🤖 Starting Slack ADR Bot..."
    if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
      echo "❌ SLACK_BOT_TOKEN not set"
      exit 1
    fi
    node ../tools/slack-adr-bot.js
    ;;
  "ai-coordinator")
    echo "🎯 Running AI Pattern Coordinator..."
    node ../tools/pattern-ai-coordinator.js
    ;;
  "test-integration")
    echo "🧪 Testing AI integration..."
    # Test context provider
    if [[ -f "../ai-integration/context-provider.ts" ]]; then
      echo "✅ Context provider found"
    else
      echo "❌ Context provider missing"
    fi
    # Test ADR parser
    if [[ -f "../ai-integration/adr-parser.ts" ]]; then
      echo "✅ ADR parser found"
    else
      echo "❌ ADR parser missing"
    fi
    ;;
  "check-status")
    echo "📊 Integration Status:"
    echo "Available tools:"
    echo "  - Slack ADR Bot: $(test -f ../tools/slack-adr-bot.js && echo '✅' || echo '❌')"
    echo "  - AI Coordinator: $(test -f ../tools/pattern-ai-coordinator.js && echo '✅' || echo '❌')"
    echo "  - Context Provider: $(test -f ../ai-integration/context-provider.ts && echo '✅' || echo '❌')"
    ;;
  "help"|*)
    show_help
    ;;
esac