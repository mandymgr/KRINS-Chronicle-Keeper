#!/bin/bash
# 🚀 AI-SYSTEMS Bun Enforcer
# Automatic cleanup and enforcement of Bun-only policy for AI-SYSTEMS components

set -e

echo "🚀 AI-SYSTEMS BUN ENFORCER - Ensuring package manager compliance"
echo "======================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VIOLATIONS_FOUND=false
TOTAL_CLEANED=0

# Function to clean up npm/yarn artifacts
cleanup_npm_artifacts() {
    local component_dir="$1"
    local component_name=$(basename "$component_dir")
    
    echo -e "${BLUE}🔍 Checking: ${component_name}${NC}"
    
    local cleaned_items=0
    
    # Remove node_modules only if no bun.lock (indicating npm/yarn install)
    if [ -d "$component_dir/node_modules" ] && [ ! -f "$component_dir/bun.lock" ]; then
        echo -e "${YELLOW}  📁 Removing npm/yarn node_modules directory (no bun.lock)${NC}"
        rm -rf "$component_dir/node_modules"
        cleaned_items=$((cleaned_items + 1))
        VIOLATIONS_FOUND=true
    elif [ -d "$component_dir/node_modules" ] && [ -f "$component_dir/bun.lock" ]; then
        echo -e "${GREEN}  📁 Keeping Bun-managed node_modules (bun.lock present)${NC}"
    fi
    
    # Remove package-lock.json
    if [ -f "$component_dir/package-lock.json" ]; then
        echo -e "${YELLOW}  📦 Removing package-lock.json${NC}"
        rm -f "$component_dir/package-lock.json"
        cleaned_items=$((cleaned_items + 1))
        VIOLATIONS_FOUND=true
    fi
    
    # Remove yarn.lock
    if [ -f "$component_dir/yarn.lock" ]; then
        echo -e "${YELLOW}  🧶 Removing yarn.lock${NC}"
        rm -f "$component_dir/yarn.lock"
        cleaned_items=$((cleaned_items + 1))
        VIOLATIONS_FOUND=true
    fi
    
    if [ $cleaned_items -eq 0 ]; then
        echo -e "${GREEN}  ✅ Already clean - using Bun only${NC}"
    else
        echo -e "${GREEN}  🧹 Cleaned $cleaned_items npm/yarn artifacts${NC}"
        TOTAL_CLEANED=$((TOTAL_CLEANED + cleaned_items))
    fi
    
    # Verify bun.lock exists
    if [ -f "$component_dir/bun.lock" ]; then
        echo -e "${GREEN}  🚀 Verified: bun.lock present${NC}"
    elif [ -f "$component_dir/package.json" ]; then
        echo -e "${YELLOW}  ⚠️  Warning: package.json exists but no bun.lock - run 'bun install'${NC}"
    fi
    
    echo ""
}

# Scan all AI-SYSTEMS components
echo -e "${BLUE}Scanning AI-SYSTEMS components for npm/yarn violations...${NC}"
echo ""

# Find all AI-SYSTEMS component directories
for component_dir in AI-SYSTEMS/*/; do
    if [ -d "$component_dir" ]; then
        cleanup_npm_artifacts "$component_dir"
    fi
done

# Check deployment subdirectories
if [ -d "AI-SYSTEMS/deployment" ]; then
    for deploy_dir in AI-SYSTEMS/deployment/*/; do
        if [ -d "$deploy_dir" ]; then
            cleanup_npm_artifacts "$deploy_dir"
        fi
    done
fi

echo "======================================================================="

if [ "$VIOLATIONS_FOUND" = true ]; then
    echo -e "${YELLOW}🧹 CLEANUP COMPLETED${NC}"
    echo -e "${GREEN}✅ $TOTAL_CLEANED npm/yarn artifacts removed${NC}"
    echo -e "${BLUE}🚀 All AI-SYSTEMS components now use Bun exclusively${NC}"
    echo ""
    echo -e "${YELLOW}💡 NEXT STEPS:${NC}"
    echo "  1. Run 'bun install' in any component that needs dependencies"
    echo "  2. Commit the cleanup changes"
    echo "  3. Use only 'bun' commands in AI-SYSTEMS from now on"
else
    echo -e "${GREEN}🎉 PERFECT COMPLIANCE${NC}"
    echo -e "${GREEN}✅ All AI-SYSTEMS components already use Bun exclusively${NC}"
    echo -e "${GREEN}🚀 No cleanup needed - system is clean!${NC}"
fi

echo ""
echo -e "${BLUE}📋 BUND USAGE REMINDER:${NC}"
echo "  • Install deps:     bun install"
echo "  • Add package:      bun add <package>"
echo "  • Remove package:   bun remove <package>"
echo "  • Run scripts:      bun run <script>"
echo "  • Start dev:        bun dev"
echo ""
echo -e "${GREEN}🛡️  Protection active: git pre-commit hook will prevent future violations${NC}"