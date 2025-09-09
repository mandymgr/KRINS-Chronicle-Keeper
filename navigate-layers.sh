#!/bin/bash

# 🧭 KRINS-Chronicle-Keeper Layer Navigation
# Quick access to architectural layers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}🧭 KRINS-Chronicle-Keeper Layer Navigation${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to show layer info and navigate
show_layer() {
    local layer_name="$1"
    local layer_path="$2" 
    local layer_icon="$3"
    local description="$4"
    
    echo -e "${GREEN}${layer_icon} ${layer_name}${NC}"
    echo -e "   Path: ${YELLOW}${layer_path}${NC}"
    echo -e "   ${description}"
    
    if [ -d "$PROJECT_ROOT/$layer_path" ]; then
        echo -e "   Status: ✅ Available"
    else
        echo -e "   Status: ❌ Directory not found"
        return 1
    fi
    echo ""
}

# Display usage if no arguments
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage:${NC} $0 [layer]"
    echo ""
    echo "Available layers:"
    echo ""
    
    show_layer "WEB LAYER" "frontend" "🌐" "React frontend application and dashboards"
    show_layer "API LAYER" "backend" "⚡" "FastAPI backend and Node.js semantic search"
    show_layer "INTELLIGENCE LAYER" "AI_INTEGRATION" "🧠" "AI systems and organizational intelligence"
    show_layer "DATA LAYER" "DECISION_MANAGEMENT" "🗄️" "Decision tracking and data management"  
    show_layer "INFRASTRUCTURE LAYER" "scripts" "🐳" "Deployment scripts and configuration"
    
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 web              # Navigate to web layer"
    echo "  $0 api              # Navigate to API layer"
    echo "  $0 intelligence     # Navigate to intelligence layer"
    echo "  $0 data             # Navigate to data layer"
    echo "  $0 infrastructure   # Navigate to infrastructure layer"
    echo ""
    echo -e "${BLUE}Architecture Documentation:${NC}"
    echo "  See ARCHITECTURAL-MAPPING.md for complete layer analysis"
    echo ""
    exit 0
fi

# Parse layer argument
LAYER="$1"

case "$LAYER" in
    "web"|"frontend"|"ui")
        LAYER_PATH="frontend"
        LAYER_NAME="🌐 WEB LAYER"
        COMMANDS=("npm run dev" "npm run build" "npm run test")
        ;;
    "api"|"backend"|"server")
        LAYER_PATH="backend" 
        LAYER_NAME="⚡ API LAYER"
        COMMANDS=("python main.py" "bun websocket-server.ts" "docker-compose up api")
        ;;
    "intelligence"|"ai"|"brain")
        LAYER_PATH="AI_INTEGRATION"
        LAYER_NAME="🧠 INTELLIGENCE LAYER"
        COMMANDS=("bun context-provider.ts generate claude-code" "bun adr-parser.ts parse --all" "bun unified-ai-launcher.js")
        ;;
    "data"|"database"|"storage")
        LAYER_PATH="DECISION_MANAGEMENT"
        LAYER_NAME="🗄️ DATA LAYER"
        COMMANDS=("bun decision-tracker.ts analytics" "bun evidence-collector.ts validate" "psql -h localhost -U postgres krins_db")
        ;;
    "infrastructure"|"deploy"|"ops")
        LAYER_PATH="scripts"
        LAYER_NAME="🐳 INFRASTRUCTURE LAYER"  
        COMMANDS=("docker-compose up" "./build-krins-system.sh" "make deploy")
        ;;
    *)
        echo -e "${RED}❌ Unknown layer: $LAYER${NC}"
        echo "Use '$0' without arguments to see available layers"
        exit 1
        ;;
esac

# Check if layer directory exists
if [ ! -d "$PROJECT_ROOT/$LAYER_PATH" ]; then
    echo -e "${RED}❌ Layer directory not found: $LAYER_PATH${NC}"
    exit 1
fi

# Navigate to layer
echo -e "${GREEN}🚀 Navigating to ${LAYER_NAME}${NC}"
echo -e "   Path: ${YELLOW}$PROJECT_ROOT/$LAYER_PATH${NC}"
echo ""

# Show available commands
if [ ${#COMMANDS[@]} -gt 0 ]; then
    echo -e "${BLUE}💡 Common commands for this layer:${NC}"
    for cmd in "${COMMANDS[@]}"; do
        echo -e "   ${YELLOW}$cmd${NC}"
    done
    echo ""
fi

# Show directory contents
echo -e "${BLUE}📁 Directory contents:${NC}"
ls -la "$PROJECT_ROOT/$LAYER_PATH" | head -10
echo ""

# Change to directory
echo -e "${GREEN}✅ Ready! Use 'cd $LAYER_PATH' to navigate${NC}"
echo -e "${BLUE}📚 For more info, see: ARCHITECTURAL-MAPPING.md${NC}"

# Optional: Open directory if in supported terminal
if [ -n "$TERM_PROGRAM" ] && [ "$2" = "--open" ]; then
    cd "$PROJECT_ROOT/$LAYER_PATH"
    echo -e "${GREEN}🎯 Opened $LAYER_NAME directory${NC}"
fi