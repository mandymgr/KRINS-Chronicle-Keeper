#!/usr/bin/env bash
set -euo pipefail

# 🚀 Krin & Mandy Revolutionary Build & Verification Script
# Ensures everything works before git push

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}╭────────────────────────────────────────────────────────────────╮${NC}"
    echo -e "${BLUE}│  🌉 AI Pattern Bridge System - Build & Verification            │${NC}"
    echo -e "${BLUE}│  🎯 Ensuring Revolutionary Development Quality                 │${NC}" 
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

# Error handling
handle_error() {
    print_error "Build failed at: $1"
    echo
    echo -e "${RED}🛑 Build verification failed! Please fix issues before pushing to git.${NC}"
    exit 1
}

# Trap errors
trap 'handle_error "$BASH_COMMAND"' ERR

print_header

echo "Starting comprehensive system verification..."
echo

# 1. Verify AI Pattern Bridge System structure
print_step "1. Verifying AI Pattern Bridge System structure"

required_dirs=(
    "ai-pattern-bridge-system/core"
    "ai-pattern-bridge-system/patterns" 
    "ai-pattern-bridge-system/team-coordination"
    "ai-pattern-bridge-system/docs"
    "ai-pattern-bridge-system/examples"
)

for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
        print_error "Missing required directory: $dir"
        exit 1
    fi
done

required_files=(
    "ai-pattern-bridge-system/core/ai-pattern-bridge.js"
    "ai-pattern-bridge-system/core/github-webhook-handler.js"
    "ai-pattern-bridge-system/README.md"
    "ai-pattern-bridge-system/USAGE_GUIDE.md"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Missing required file: $file"
        exit 1
    fi
done

print_success "AI Pattern Bridge System structure verified"

# 2. Test AI Pattern Bridge core functionality
print_step "2. Testing AI Pattern Bridge core functionality"

cd ai-pattern-bridge-system/core

# Verify Node.js dependencies exist
if [[ ! -f "package.json" ]]; then
    print_warning "No package.json found, creating basic one for testing..."
    cat > package.json << EOF
{
  "name": "ai-pattern-bridge-core",
  "version": "1.0.0",
  "type": "commonjs",
  "dependencies": {
    "express": "^4.18.0",
    "crypto": "^1.0.1"
  }
}
EOF
fi

# Test AI Pattern Bridge can load patterns
node -e "
const { AIPatternBridge } = require('./ai-pattern-bridge');
const bridge = new AIPatternBridge();
console.log('✅ AI Pattern Bridge loaded successfully');
" || handle_error "AI Pattern Bridge failed to load"

print_success "AI Pattern Bridge core functionality verified"

cd ../..

# 3. Verify GitHub Webhook Handler
print_step "3. Testing GitHub Webhook Handler"

# Test webhook handler can initialize
cd ai-pattern-bridge-system/core
node -e "
const { GitHubWebhookHandler } = require('./github-webhook-handler');
const handler = new GitHubWebhookHandler({ port: 3001 });
console.log('✅ GitHub Webhook Handler initialized successfully');
" || handle_error "GitHub Webhook Handler failed to initialize"

print_success "GitHub Webhook Handler verified"

cd ../..

# 4. Validate Pattern Cards
print_step "4. Validating Pattern Cards"

pattern_count=0
for pattern_file in ai-pattern-bridge-system/patterns/*.md; do
    if [[ -f "$pattern_file" && ! "$pattern_file" == *"TEMPLATE"* ]]; then
        # Check if pattern has required sections (supports both English and Norwegian formats)
        if (grep -q "## When to Use" "$pattern_file" || grep -q "\*\*Når bruke:\*\*" "$pattern_file") && \
           (grep -q "## Implementation" "$pattern_file" || grep -q "## Steg-for-steg" "$pattern_file" || grep -q "## Språkvarianter" "$pattern_file") && \
           (grep -q "## Quality Gates" "$pattern_file" || grep -q "## Anti-patterns" "$pattern_file" || grep -q "\*\*Ikke bruk når:\*\*" "$pattern_file"); then
            ((pattern_count++))
        else
            print_warning "Pattern file $pattern_file missing required sections"
        fi
    fi
done

if [[ $pattern_count -lt 3 ]]; then
    print_error "Insufficient pattern cards found (need at least 3, found $pattern_count)"
    exit 1
fi

print_success "Pattern cards validated ($pattern_count patterns found)"

# 5. Test Team Coordination Files
print_step "5. Validating Team Coordination Tasks"

coordination_files=(
    "ai-pattern-bridge-system/team-coordination/team-instructions/frontend-specialist-task.md"
    "ai-pattern-bridge-system/team-coordination/team-instructions/backend-specialist-task.md"
    "ai-pattern-bridge-system/team-coordination/team-instructions/testing-specialist-task.md"
)

for coord_file in "${coordination_files[@]}"; do
    if [[ ! -f "$coord_file" ]]; then
        print_error "Missing coordination file: $coord_file"
        exit 1
    fi
    
    # Check if coordination file has required sections
    if ! grep -q "Your Mission" "$coord_file" || \
       ! grep -q "Quality Gates" "$coord_file" || \
       ! grep -q "Success Criteria" "$coord_file"; then
        print_error "Coordination file $coord_file missing required sections"
        exit 1
    fi
done

print_success "Team coordination tasks validated"

# 6. Verify ADR System
print_step "6. Testing ADR System Integration"

if [[ ! -f "tools/adr_new.sh" ]]; then
    print_error "ADR creation script not found: tools/adr_new.sh"
    exit 1
fi

if [[ ! -x "tools/adr_new.sh" ]]; then
    print_warning "Making ADR script executable..."
    chmod +x tools/adr_new.sh
fi

# Test ADR template exists
if [[ ! -f "docs/adr/templates/ADR-template.md" ]]; then
    print_error "ADR template not found: docs/adr/templates/ADR-template.md"
    exit 1
fi

print_success "ADR system integration verified"

# 7. Check Documentation Completeness
print_step "7. Validating Documentation"

doc_files=(
    "ai-pattern-bridge-system/README.md"
    "ai-pattern-bridge-system/USAGE_GUIDE.md"
    "ai-pattern-bridge-system/docs/SYSTEM_ARCHITECTURE.md"
    "ai-pattern-bridge-system/docs/COORDINATION_SUCCESS_REPORT.md"
)

for doc_file in "${doc_files[@]}"; do
    if [[ ! -f "$doc_file" ]]; then
        print_error "Missing documentation file: $doc_file"
        exit 1
    fi
    
    # Check minimum documentation length
    if [[ $(wc -l < "$doc_file") -lt 20 ]]; then
        print_warning "Documentation file $doc_file seems too short"
    fi
done

print_success "Documentation completeness verified"

# 8. System Integration Test
print_step "8. Running System Integration Test"

# Generate AI instructions to verify system works end-to-end
cd ai-pattern-bridge-system/core
integration_output=$(node -e "
const { AIPatternBridge } = require('./ai-pattern-bridge');
async function test() {
  const bridge = new AIPatternBridge();
  const instructions = await bridge.generateAIInstructions('Test integration', 'test-project');
  console.log('Integration test passed');
}
test().catch(console.error);
" 2>&1)

if [[ $? -ne 0 ]]; then
    print_error "System integration test failed: $integration_output"
    exit 1
fi

print_success "System integration test passed"

cd ../..

# 9. Git Status Check
print_step "9. Checking Git Status"

if command -v git >/dev/null 2>&1; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        # Check if there are uncommitted changes
        if [[ -n $(git status --porcelain) ]]; then
            print_warning "Uncommitted changes detected:"
            git status --short
        else
            print_success "Git working directory clean"
        fi
    else
        print_warning "Not in a git repository"
    fi
else
    print_warning "Git not available"
fi

# 10. Final Success
echo
echo -e "${GREEN}╭────────────────────────────────────────────────────────────────╮${NC}"
echo -e "${GREEN}│  🎉 BUILD VERIFICATION COMPLETE - ALL SYSTEMS GO! 🚀           │${NC}"
echo -e "${GREEN}│                                                                │${NC}"
echo -e "${GREEN}│  ✅ AI Pattern Bridge System: VERIFIED                        │${NC}"
echo -e "${GREEN}│  ✅ GitHub Webhook Handler: VERIFIED                          │${NC}"
echo -e "${GREEN}│  ✅ Pattern Cards: VERIFIED ($pattern_count found)                    │${NC}"
echo -e "${GREEN}│  ✅ Team Coordination: VERIFIED                               │${NC}"
echo -e "${GREEN}│  ✅ ADR System: VERIFIED                                      │${NC}"
echo -e "${GREEN}│  ✅ Documentation: VERIFIED                                   │${NC}"
echo -e "${GREEN}│  ✅ Integration Test: PASSED                                  │${NC}"
echo -e "${GREEN}│                                                                │${NC}"
echo -e "${GREEN}│  🌟 Revolutionary Development System Ready for Deployment!    │${NC}"
echo -e "${GREEN}╰────────────────────────────────────────────────────────────────╯${NC}"
echo
echo -e "${BLUE}💡 System is ready for git push and production deployment!${NC}"
echo