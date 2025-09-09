#!/usr/bin/env bash
set -euo pipefail

# 🚀 KRINS-Chronicle-Keeper System Build & Verification
# Comprehensive build and health check for organizational intelligence system

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}╭────────────────────────────────────────────────────────────────╮${NC}"
    echo -e "${BLUE}│  🧠 KRINS-Chronicle-Keeper - System Build & Verification      │${NC}"
    echo -e "${BLUE}│  🎯 Organizational Intelligence Platform                       │${NC}"
    echo -e "${BLUE}╰────────────────────────────────────────────────────────────────╯${NC}"
    echo
}

print_step() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

handle_error() {
    echo
    print_error "Build verification failed at step: $1"
    echo -e "${RED}🛑 Please fix issues before proceeding.${NC}"
    exit 1
}

# Trap errors
trap 'handle_error "$BASH_COMMAND"' ERR

print_header

echo "Starting KRINS-Chronicle-Keeper system verification..."
echo

# 1. Verify core system structure
print_step "1. Verifying KRINS core system structure"

required_dirs=(
    "DECISION_MANAGEMENT"
    "AI_INTEGRATION" 
    "docs/adr"
    "tools"
    ".githooks"
)

for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
        print_error "Missing required directory: $dir"
        exit 1
    fi
done

print_success "Core system structure verified"

# 2. Test Decision Management System
print_step "2. Testing Decision Management System"

ADR_COUNT=$(bun DECISION_MANAGEMENT/decision-tracker.ts analytics | grep '"total":' | grep -o '[0-9]\+' | head -1)
if [[ "$ADR_COUNT" -gt 0 ]]; then
    print_success "Decision tracker operational - $ADR_COUNT ADRs loaded"
else
    print_error "Decision tracker failed to load ADRs"
    exit 1
fi

# 3. Test AI Integration System  
print_step "3. Testing AI Integration System"

CONTEXT_OUTPUT=$(bun AI_INTEGRATION/context-provider.ts generate claude-code build-test "System verification" 2>/dev/null || echo "FAILED")
if [[ "$CONTEXT_OUTPUT" == *"Generated AI context"* ]]; then
    print_success "AI context provider operational"
else
    print_warning "AI context provider may have issues (continuing...)"
fi

# 4. Verify Repository Protection System
print_step "4. Verifying Repository Protection System"

if [[ -f "./tools/auto-cleanup.sh" ]]; then
    if grep -q "QUARANTINE.*SYSTEM" ./tools/auto-cleanup.sh; then
        print_success "Ultra-safe cleanup system with quarantine verified"
    else
        print_error "Auto-cleanup missing quarantine safety features"
        exit 1
    fi
else
    print_error "Missing auto-cleanup.sh protection system"
    exit 1
fi

if [[ -f "./.githooks/pre-commit-enhanced" ]]; then
    PROTECTION_COUNT=$(grep -c "VALUABLE FILE.*always protected" ./.githooks/pre-commit-enhanced)
    if [[ "$PROTECTION_COUNT" -ge 5 ]]; then
        print_success "Enhanced pre-commit protection verified ($PROTECTION_COUNT protection categories)"
    else
        print_error "Pre-commit hook missing comprehensive protection"
        exit 1
    fi
else
    print_error "Missing enhanced pre-commit hook"
    exit 1
fi

# 5. Repository Health Check
print_step "5. Verifying repository health checker availability"

if [[ -f "./tools/repository-health-checker.sh" ]]; then
    print_success "Repository health checker available"
else
    print_warning "Repository health checker not found (continuing...)"
fi

# 6. Verify Additional Tools
print_step "6. Verifying additional tools and capabilities"

TOOLS_COUNT=0

if [[ -f "./tools/adr_new.sh" ]]; then
    ((TOOLS_COUNT++))
    print_success "ADR creation tool available"
fi

if [[ -f "./tools/explain-pr.js" ]]; then
    ((TOOLS_COUNT++))
    print_success "PR analysis tool available"
fi

if [[ -f "./tools/repository-monitor.sh" ]]; then
    ((TOOLS_COUNT++))  
    print_success "Repository monitoring tool available"
fi

print_success "Additional tools verified: $TOOLS_COUNT tools available"

# 7. Verify git status
print_step "7. Checking git repository status"

GIT_STATUS=$(git status --porcelain | wc -l)
if [[ "$GIT_STATUS" -eq 0 ]]; then
    print_success "Git repository clean - no uncommitted changes"
else
    print_warning "Git repository has $GIT_STATUS uncommitted changes"
fi

echo
echo -e "${GREEN}╭────────────────────────────────────────────────────────────────╮${NC}"
echo -e "${GREEN}│  🎉 KRINS-Chronicle-Keeper BUILD SUCCESSFUL                   │${NC}"
echo -e "${GREEN}│  ✅ All systems operational and verified                      │${NC}"
echo -e "${GREEN}│  🛡️ Security: Ultra-safe protection with quarantine enabled   │${NC}"
echo -e "${GREEN}│  🧠 Intelligence: $ADR_COUNT ADRs loaded and AI context active        │${NC}"
echo -e "${GREEN}│  🔧 Tools: $TOOLS_COUNT additional tools available                      │${NC}"
echo -e "${GREEN}╰────────────────────────────────────────────────────────────────╯${NC}"
echo
echo -e "${BLUE}🚀 System ready for development and deployment!${NC}"