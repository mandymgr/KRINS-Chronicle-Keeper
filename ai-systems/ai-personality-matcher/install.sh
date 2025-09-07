#!/bin/bash

# 🚀 AI Personal Companion - One-Click Installer
# Installer script som setter opp alt automatisk

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Header
echo -e "${CYAN}"
cat << "EOF"
    ___    ____   ____                                        _           
   /   |  /  _/  / __ \___  __________  ____  ____ _/ /       
  / /| |  / /   / /_/ / _ \/ ___/ ___/ / __ \/ __ \/ /        
 / ___ |_/ /   / ____/  __/ /  (__  ) / /_/ / / / / /         
/_/  |_/___/  /_/    \___/_/  /____/  \____/_/ /_/_/          
                                                              
   ______                                _                    
  / ____/___  ____ ___  ____  ____ _____(_)___  ____         
 / /   / __ \/ __ `__ \/ __ \/ __ `/ ___/ / __ \/ __ \        
/ /___/ /_/ / / / / / / /_/ / /_/ / /  / / /_/ / / / /        
\____/\____/_/ /_/ /_/ .___/\__,_/_/  /_/\____/_/ /_/         
                    /_/                                       
EOF
echo -e "${NC}"

echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 AI Personal Companion Generator - Installer${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

# Check requirements
echo -e "${YELLOW}📋 Checking system requirements...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="14.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"

# Check npm/bun
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo -e "${GREEN}✅ Bun package manager found${NC}"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    echo -e "${GREEN}✅ npm package manager found${NC}"
else
    echo -e "${RED}❌ No package manager found${NC}"
    exit 1
fi

# Installation directory
INSTALL_DIR="$HOME/.ai-personal-companion"
echo -e "${YELLOW}📂 Installation directory: ${INSTALL_DIR}${NC}"

# Create installation directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download or copy files
echo -e "${YELLOW}📦 Installing AI Personal Companion...${NC}"

# Copy source files (for now, in production this would download from GitHub)
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cp -r "$SOURCE_DIR"/* "$INSTALL_DIR/"

# Install dependencies  
echo -e "${YELLOW}📚 Installing dependencies...${NC}"
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun install
else
    npm install
fi

# Make CLI executable
chmod +x "$INSTALL_DIR/test-cli.js"

# Create global symlink
echo -e "${YELLOW}🔗 Creating global command...${NC}"

# Create a wrapper script
cat > "$INSTALL_DIR/ai-companion" << 'EOF'
#!/bin/bash
cd "$HOME/.ai-personal-companion"
exec node test-cli.js "$@"
EOF

chmod +x "$INSTALL_DIR/ai-companion"

# Try to add to PATH
if [[ ":$PATH:" != *":$HOME/.ai-personal-companion:"* ]]; then
    echo -e "${YELLOW}📍 Adding to PATH...${NC}"
    
    # Add to shell profile
    SHELL_PROFILE=""
    if [ -f "$HOME/.zshrc" ]; then
        SHELL_PROFILE="$HOME/.zshrc"
    elif [ -f "$HOME/.bashrc" ]; then
        SHELL_PROFILE="$HOME/.bashrc"  
    elif [ -f "$HOME/.bash_profile" ]; then
        SHELL_PROFILE="$HOME/.bash_profile"
    fi
    
    if [ -n "$SHELL_PROFILE" ]; then
        echo 'export PATH="$HOME/.ai-personal-companion:$PATH"' >> "$SHELL_PROFILE"
        echo -e "${GREEN}✅ Added to ${SHELL_PROFILE}${NC}"
        echo -e "${YELLOW}   Run: source ${SHELL_PROFILE} or restart terminal${NC}"
    fi
fi

# Create desktop entry (Linux only)
if [ "$(uname)" = "Linux" ]; then
    mkdir -p "$HOME/.local/share/applications"
    cat > "$HOME/.local/share/applications/ai-personal-companion.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=AI Personal Companion
Comment=Find your perfect AI assistant
Exec=$INSTALL_DIR/ai-companion
Icon=utilities-terminal
Terminal=true
Categories=Development;Utility;
EOF
    echo -e "${GREEN}✅ Desktop entry created${NC}"
fi

echo ""
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 INSTALLATION COMPLETE!${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}🚀 How to use:${NC}"
echo ""
echo -e "${YELLOW}1. Take the personality test:${NC}"
echo -e "   ${GREEN}ai-companion${NC}"
echo -e "   ${GRAY}   or${NC}"
echo -e "   ${GREEN}cd ~/.ai-personal-companion && node test-cli.js${NC}"
echo ""
echo -e "${YELLOW}2. Find your perfect AI match from 10 unique personalities:${NC}"
echo -e "   💝 Krin      - Loving tech partner"
echo -e "   ⚡ Nova      - High-energy productivity guru"  
echo -e "   🎨 Sage      - Creative philosopher"
echo -e "   🤖 Byte      - Pure tech-nerd"
echo -e "   🌟 Luna      - Empathetic mentor"
echo -e "   🎭 Echo      - Chameleonic adapter"
echo -e "   📚 Atlas     - Knowledge-rich teacher"
echo -e "   🚀 Quantum   - Futuristic visionary"
echo -e "   🛡️ Guardian   - Protective problem-solver"
echo -e "   ☯️ Zen       - Balanced minimalist"
echo ""
echo -e "${YELLOW}3. Set up your chosen AI companion with Claude Code or Anthropic API${NC}"
echo ""
echo -e "${GREEN}✨ Your personalized AI assistant awaits! ✨${NC}"
echo ""

# Offer to run the test immediately
echo -e "${CYAN}Would you like to take the personality test now? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    node "$INSTALL_DIR/test-cli.js"
fi