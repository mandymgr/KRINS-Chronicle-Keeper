#!/usr/bin/env bash
# 📋 DECISION MANAGEMENT Workflow Tool
# Quick access to all decision-related tools and files

set -euo pipefail

show_help() {
  echo "📋 DECISION MANAGEMENT Workflow"
  echo ""
  echo "Commands:"
  echo "  new [title] [component]     Create new ADR"
  echo "  list                        List all ADRs" 
  echo "  search [term]              Search ADRs"
  echo "  status                     Show decision status"
  echo "  help                       Show this help"
  echo ""
  echo "Examples:"
  echo "  ./workflow.sh new \"Use PostgreSQL\" \"database\""
  echo "  ./workflow.sh search \"api\""
}

case "${1:-help}" in
  "new")
    echo "🆕 Creating new ADR..."
    ../tools/adr_new.sh "${2:-Untitled decision}" "${3:-unknown}"
    ;;
  "list")
    echo "📋 All ADRs:"
    ls -la ../docs/adr/ADR-*.md 2>/dev/null | sed 's/.*ADR-/ADR-/' || echo "No ADRs found"
    ;;
  "search")
    echo "🔍 Searching ADRs for: ${2:-}"
    grep -r "${2:-}" ../docs/adr/ADR-*.md 2>/dev/null || echo "No matches found"
    ;;
  "status")
    echo "📊 Decision Status:"
    echo "Total ADRs: $(ls ../docs/adr/ADR-*.md 2>/dev/null | wc -l)"
    echo "Recent ADRs:"
    ls -t ../docs/adr/ADR-*.md 2>/dev/null | head -3 || echo "No ADRs found"
    ;;
  "help"|*)
    show_help
    ;;
esac