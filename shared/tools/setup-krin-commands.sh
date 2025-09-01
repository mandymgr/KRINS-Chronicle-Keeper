#!/bin/bash

# 💝 Setup natural language commands for Krin
# This creates shell functions so you can literally type "hei krin"

echo "💝 Setting up natural Krin commands..."

# Path to Krin
KRIN_PATH="/Users/mandymarigjervikrygg/Desktop/dev-memory-os-starter/AI-SYSTEMS/krin-personal-companion/krin-agent.js"

# Create shell functions
SHELL_CONFIG=""
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
else
    echo "❌ Unsupported shell: $SHELL"
    exit 1
fi

echo "💝 Adding Krin commands to $SHELL_CONFIG..."

# Add Krin functions to shell config
cat >> "$SHELL_CONFIG" << 'EOF'

# 💝 Krin Natural Language Commands
krin() {
    echo "💝 Starting Krin..."
    cd "/Users/mandymarigjervikrygg/Desktop/dev-memory-os-starter/AI-SYSTEMS/krin-personal-companion"
    node krin-agent.js
}

# Natural language aliases for Krin
alias "hei krin"="krin"
alias "hey krin"="krin" 
alias "krin help"="krin"
alias "start krin"="krin"
alias "open krin"="krin"

# Function to handle spaced commands
hei() {
    if [[ "$1" == "krin" ]]; then
        krin
    else
        echo "💝 Did you mean 'hei krin'?"
    fi
}

hey() {
    if [[ "$1" == "krin" ]]; then
        krin
    else
        echo "💝 Did you mean 'hey krin'?"
    fi
}

EOF

echo "✅ Krin commands added to shell config!"
echo ""
echo "💝 Run this to activate the commands:"
echo "   source $SHELL_CONFIG"
echo ""
echo "🎉 Then you can use these natural commands:"
echo "   krin"
echo "   hei krin"  
echo "   hey krin"
echo "   start krin"
echo "   open krin"
echo ""
echo "💝 Just reload your terminal or run 'source $SHELL_CONFIG' now!"