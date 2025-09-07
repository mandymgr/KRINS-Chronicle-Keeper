#!/usr/bin/env bash
# 📚 KNOWLEDGE ORGANIZATION Workflow Tool  
# Quick access to patterns, runbooks, and knowledge management

set -euo pipefail

show_help() {
  echo "📚 KNOWLEDGE ORGANIZATION Workflow"
  echo ""
  echo "Commands:"
  echo "  create-pattern [name] [category]    Create new pattern"
  echo "  validate                           Validate all patterns"
  echo "  analytics                          Run pattern analytics"
  echo "  search-patterns [term]             Search patterns"
  echo "  list-runbooks                      List all runbooks"
  echo "  help                              Show this help"
  echo ""
  echo "Examples:"
  echo "  ./workflow.sh create-pattern \"API Rate Limiting\" \"backend\""
  echo "  ./workflow.sh validate"
  echo "  ./workflow.sh analytics"
}

case "${1:-help}" in
  "create-pattern")
    echo "🆕 Creating new pattern..."
    node ../tools/create-pattern.js "${2:-New Pattern}" "${3:-general}" "${4:-Pattern description}"
    ;;
  "validate")
    echo "✅ Validating patterns..."
    node ../tools/validate-patterns.js
    ;;
  "analytics")
    echo "📊 Running pattern analytics..."
    node ../tools/pattern-analytics-engine.js --report
    ;;
  "search-patterns")
    echo "🔍 Searching patterns for: ${2:-}"
    grep -r "${2:-}" ../docs/patterns/ 2>/dev/null || echo "No matches found"
    ;;
  "list-runbooks")
    echo "📖 Available runbooks:"
    find ../docs/runbooks/ -name "*.md" -not -name "TEMPLATE*" 2>/dev/null | sed 's|../docs/runbooks/||' || echo "No runbooks found"
    ;;
  "help"|*)
    show_help
    ;;
esac