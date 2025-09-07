#!/bin/bash

# 🚀 AI Personal Companion - Claude Code Setup
# Automatisk konfigurasjon for Claude Code integrasjon

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
   _____ _                 _         _____          _      
  / ____| |               | |       / ____|        | |     
 | |    | | __ _ _   _  __| | ___  | |     ___   __| | ___ 
 | |    | |/ _` | | | |/ _` |/ _ \ | |    / _ \ / _` |/ _ \
 | |____| | (_| | |_| | (_| |  __/ | |___| (_) | (_| |  __/
  \_____|_|\__,_|\__,_|\__,_|\___|  \_____\___/ \__,_|\___|
                                                           
   _____ _                              _   _              
  |_   _| |                            | | (_)             
    | | | |_ _ __ ___   __ _ _ __ __ _| |_ _  ___  _ __   
    | | | __| '_ ` _ \ / _` | '__/ _` | __| |/ _ \| '_ \  
   _| |_| |_| | | | | | (_| | | | (_| | |_| | (_) | | | | 
  |_____|\__|_| |_| |_|\__, |_|  \__,_|\__|_|\___/|_| |_| 
                        __/ |                             
                       |___/                              
EOF
echo -e "${NC}"

echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 AI Personal Companion - Claude Code Setup${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if we're in the right directory
if [[ ! -f "personality-test.js" ]]; then
    echo -e "${RED}❌ Error: Please run this script from the AI Personality Matcher directory${NC}"
    exit 1
fi

CURRENT_DIR=$(pwd)
CLAUDE_MD_PATH=""

# Find CLAUDE.md file
echo -e "${YELLOW}📋 Looking for CLAUDE.md file...${NC}"

# Check common locations
SEARCH_PATHS=(
    "$HOME/Desktop/dev-memory-os-starter/CLAUDE.md"
    "$HOME/Desktop/*/CLAUDE.md"
    "../../CLAUDE.md"
    "../../../CLAUDE.md"
    "$PWD/../../CLAUDE.md"
)

for path in "${SEARCH_PATHS[@]}"; do
    if [[ -f $path ]]; then
        CLAUDE_MD_PATH=$(realpath "$path")
        echo -e "${GREEN}✅ Found CLAUDE.md at: ${CLAUDE_MD_PATH}${NC}"
        break
    fi
done

if [[ -z "$CLAUDE_MD_PATH" ]]; then
    # Ask user for CLAUDE.md location
    echo -e "${YELLOW}❓ CLAUDE.md not found automatically. Please enter the path:${NC}"
    read -r user_path
    if [[ -f "$user_path" ]]; then
        CLAUDE_MD_PATH=$(realpath "$user_path")
        echo -e "${GREEN}✅ Using CLAUDE.md at: ${CLAUDE_MD_PATH}${NC}"
    else
        echo -e "${RED}❌ CLAUDE.md not found. You'll need to add the integration manually.${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}🎯 Setting up Claude Code integration...${NC}"

# Create integration script
INTEGRATION_SCRIPT="$CURRENT_DIR/claude-code-companion-loader.sh"

cat > "$INTEGRATION_SCRIPT" << 'EOF'
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
EOF

chmod +x "$INTEGRATION_SCRIPT"

# Create companion generator script
GENERATOR_SCRIPT="$CURRENT_DIR/generate-companion.js"

cat > "$GENERATOR_SCRIPT" << 'EOF'
#!/usr/bin/env node

/**
 * 🤖 Companion Generator CLI
 * Quick companion generation from command line
 */

const CompanionGenerator = require('./companion-generator');
const PersonalityTest = require('./personality-test');
const readline = require('readline');

class CompanionGeneratorCLI {
  constructor() {
    this.generator = new CompanionGenerator();
    this.test = new PersonalityTest();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('🤖 AI Personal Companion Generator\n');

    const personality = process.argv[2];
    
    if (personality) {
      await this.generateCompanion(personality);
    } else {
      await this.interactiveGeneration();
    }

    this.rl.close();
  }

  async interactiveGeneration() {
    console.log('Available personalities:');
    const personalities = this.test.getAllPersonalities();
    personalities.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${p.description}`);
    });
    console.log('');

    const choice = await this.ask('Choose a personality (1-10 or name): ');
    const userName = await this.ask('Your name: ');

    let personalityKey;
    if (isNaN(choice)) {
      personalityKey = choice.toLowerCase();
    } else {
      const index = parseInt(choice) - 1;
      personalityKey = personalities[index]?.key;
    }

    if (!personalityKey || !this.test.getPersonalityDetails(personalityKey)) {
      console.log('❌ Invalid personality choice');
      return;
    }

    await this.generateCompanion(personalityKey, userName);
  }

  async generateCompanion(personalityKey, userName = 'Developer') {
    try {
      console.log(`\n🚀 Generating ${personalityKey} companion for ${userName}...\n`);

      const result = await this.generator.generateCompanion(personalityKey, userName);

      if (result.success) {
        console.log('🎉 Companion generated successfully!\n');
        console.log(result.instructions);
      } else {
        console.log('❌ Failed to generate companion');
      }
    } catch (error) {
      console.error('💔 Error:', error.message);
    }
  }

  ask(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new CompanionGeneratorCLI();
  cli.run().catch(console.error);
}

module.exports = CompanionGeneratorCLI;
EOF

chmod +x "$GENERATOR_SCRIPT"

# Add to CLAUDE.md if found
if [[ -n "$CLAUDE_MD_PATH" ]]; then
    echo -e "${YELLOW}📝 Adding integration to CLAUDE.md...${NC}"
    
    INTEGRATION_TEXT="
## 🧠 AI PERSONAL COMPANION GENERATOR INTEGRATION
**ALWAYS run this command at the start of each Claude Code session:**
\`\`\`bash
cd \"$CURRENT_DIR\" && bash claude-code-companion-loader.sh
\`\`\`

This loads the AI Personal Companion Generator so you can:
- 🧪 Take the personality test to find your perfect AI match
- 🌐 Use the beautiful 3D web interface  
- 🤖 Generate personalized AI companions
- 💝 Create your own Krin-like AI assistant

**Quick Commands:**
- \`node test-cli.js\` - Take personality test
- \`node generate-companion.js [personality]\` - Generate companion
- \`cd web-interface && python3 -m http.server 8080\` - Web interface

**Web Interface:** http://localhost:8080 (when server is running)
"

    # Check if already added
    if ! grep -q "AI PERSONAL COMPANION GENERATOR" "$CLAUDE_MD_PATH"; then
        echo "$INTEGRATION_TEXT" >> "$CLAUDE_MD_PATH"
        echo -e "${GREEN}✅ Added integration to CLAUDE.md${NC}"
    else
        echo -e "${YELLOW}ℹ️  Integration already exists in CLAUDE.md${NC}"
    fi
fi

# Create desktop shortcut (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    DESKTOP_PATH="$HOME/Desktop/AI Personality Matcher.webloc"
    cat > "$DESKTOP_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>URL</key>
    <string>file://$CURRENT_DIR/web-interface/index.html</string>
</dict>
</plist>
EOF
    echo -e "${GREEN}✅ Created desktop shortcut${NC}"
fi

echo ""
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 CLAUDE CODE INTEGRATION COMPLETE!${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}🚀 How to use:${NC}"
echo ""
echo -e "${YELLOW}1. In Claude Code, the integration will auto-load when you start a session${NC}"
echo -e "${GREEN}   Source: ${CLAUDE_MD_PATH}${NC}"
echo ""
echo -e "${YELLOW}2. Or run manually:${NC}"
echo -e "${GREEN}   bash $INTEGRATION_SCRIPT${NC}"
echo ""
echo -e "${YELLOW}3. Take the personality test:${NC}"
echo -e "${GREEN}   node $CURRENT_DIR/test-cli.js${NC}"
echo ""
echo -e "${YELLOW}4. Use the beautiful 3D web interface:${NC}"
echo -e "${GREEN}   cd $CURRENT_DIR/web-interface && python3 -m http.server 8080${NC}"
echo -e "${GREEN}   Then open: http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}5. Generate your companion:${NC}"
echo -e "${GREEN}   node $CURRENT_DIR/generate-companion.js [personality]${NC}"
echo ""

echo -e "${GREEN}✨ Your AI Personal Companion Generator is ready! ✨${NC}"
echo ""
EOF

chmod +x claude-code-setup.sh