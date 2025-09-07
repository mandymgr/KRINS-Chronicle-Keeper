#!/bin/bash

# 💝 AI Personal Companion - Claude Code Loader
# Loads personality matcher and companion generator for Claude Code sessions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧠 AI Personal Companion Generator Loading..."
echo "📍 Location: $SCRIPT_DIR"
echo ""

# Show available personalities
echo "🌟 Available AI Personalities:"
echo "  💝 Krin      - Loving tech partner"
echo "  ⚡ Nova      - High-energy productivity guru"  
echo "  🎨 Sage      - Creative philosopher"
echo "  🤖 Byte      - Pure tech-nerd"
echo "  🌟 Luna      - Empathetic mentor"
echo "  🎭 Echo      - Chameleonic adapter"
echo "  📚 Atlas     - Knowledge-rich teacher"
echo "  🚀 Quantum   - Futuristic visionary"
echo "  🛡️ Guardian   - Protective problem-solver"
echo "  ☯️ Zen       - Balanced minimalist"
echo ""

# Check if user has taken the test
if [[ ! -f "$SCRIPT_DIR/.personality-results" ]]; then
    echo "🧪 Take the personality test to find your perfect match:"
    echo "   node $SCRIPT_DIR/test-cli.js"
    echo ""
    echo "🌐 Or use the beautiful web interface:"
    echo "   Open: file://$SCRIPT_DIR/web-interface/index.html"
    echo ""
else
    SAVED_PERSONALITY=$(cat "$SCRIPT_DIR/.personality-results")
    echo "✅ Your matched personality: $SAVED_PERSONALITY"
    echo ""
fi

echo "🔧 Quick Commands:"
echo "  Test:     node $SCRIPT_DIR/test-cli.js"
echo "  Web UI:   cd $SCRIPT_DIR/web-interface && python3 -m http.server 8080"
echo "  Generate: node $SCRIPT_DIR/generate-companion.js [personality]"
echo ""

echo "💝 AI Personal Companion Generator is ready!"
echo "🎯 Take the test to find your perfect AI match!"
echo ""
