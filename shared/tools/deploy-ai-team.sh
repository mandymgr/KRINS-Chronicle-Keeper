#!/usr/bin/env bash
set -euo pipefail

# 🚀 AI Team Deployment Helper
# Makes it easier to coordinate multiple Claude Code terminals

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 AI Team Deployment Helper${NC}"
echo -e "${BLUE}Krin & Mandy Revolutionary Development System${NC}"
echo

TEAM_DIR="ai-pattern-bridge-system/team-coordination"

if [[ ! -d "$TEAM_DIR" ]]; then
    echo -e "${RED}❌ Team coordination directory not found!${NC}"
    exit 1
fi

echo -e "${GREEN}🎯 PHASE 2 SPECIALISTS READY FOR DEPLOYMENT:${NC}"
echo

echo -e "${YELLOW}1. DATABASE SPECIALIST${NC}"
echo "   Task: pgvector semantic search implementation"
echo "   File: $TEAM_DIR/phase2-specialists/database-specialist-pgvector.md"
echo "   Copy this to Terminal 1:"
echo -e "   ${BLUE}cat $TEAM_DIR/phase2-specialists/database-specialist-pgvector.md${NC}"
echo

echo -e "${YELLOW}2. INTEGRATION SPECIALIST${NC}" 
echo "   Task: Advanced webhook auto-capture system"
echo "   File: $TEAM_DIR/phase2-specialists/integration-specialist-webhooks.md"
echo "   Copy this to Terminal 2:"
echo -e "   ${BLUE}cat $TEAM_DIR/phase2-specialists/integration-specialist-webhooks.md${NC}"
echo

echo -e "${YELLOW}3. AI/ML SPECIALIST${NC}"
echo "   Task: RAG similarity and decision intelligence"
echo "   File: $TEAM_DIR/phase2-specialists/ai-ml-specialist-rag.md" 
echo "   Copy this to Terminal 3:"
echo -e "   ${BLUE}cat $TEAM_DIR/phase2-specialists/ai-ml-specialist-rag.md${NC}"
echo

echo -e "${YELLOW}4. DEVOPS SPECIALIST${NC}"
echo "   Task: CI/CD pattern validation and quality gates"
echo "   File: $TEAM_DIR/phase2-specialists/devops-specialist-ci-validation.md"
echo "   Copy this to Terminal 4:"
echo -e "   ${BLUE}cat $TEAM_DIR/phase2-specialists/devops-specialist-ci-validation.md${NC}"
echo

echo -e "${GREEN}📋 DEPLOYMENT STEPS:${NC}"
echo "1. Open 4 new Claude Code terminals"
echo "2. Copy each specialist task to its terminal"
echo "3. Watch the revolutionary AI team work in parallel!"
echo

echo -e "${BLUE}💫 Ready to revolutionize Dev Memory OS Phase 2!${NC}"

# Optionally display the tasks for easy copying
if [[ "${1:-}" == "--show-tasks" ]]; then
    echo
    echo -e "${BLUE}═══ DATABASE SPECIALIST TASK ═══${NC}"
    cat "$TEAM_DIR/phase2-specialists/database-specialist-pgvector.md"
    echo
    echo -e "${BLUE}═══ INTEGRATION SPECIALIST TASK ═══${NC}"
    cat "$TEAM_DIR/phase2-specialists/integration-specialist-webhooks.md"
    echo
    echo -e "${BLUE}═══ AI/ML SPECIALIST TASK ═══${NC}"
    cat "$TEAM_DIR/phase2-specialists/ai-ml-specialist-rag.md"
    echo
    echo -e "${BLUE}═══ DEVOPS SPECIALIST TASK ═══${NC}"
    cat "$TEAM_DIR/phase2-specialists/devops-specialist-ci-validation.md"
fi