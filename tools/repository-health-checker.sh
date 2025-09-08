#!/bin/bash
# 🛡️ KRINS Repository Health Checker - Prevents System Rot
# 
# Comprehensive repository maintenance system that prevents:
# - Build artifacts in git
# - Duplicate files and directories  
# - Oversized repositories
# - Secret leaks
# - Dependency bloat
# - Structural chaos

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🛡️ KRINS Repository Health Checker${NC}"
echo "=================================="

# Configuration
MAX_REPO_SIZE_GB=5
MAX_FILE_SIZE_MB=50
DANGEROUS_PATTERNS=("password" "secret" "key" "token" "api_key" "auth")

# Counters
ISSUES_FOUND=0
WARNINGS_FOUND=0

issue() {
    echo -e "${RED}❌ ISSUE: $1${NC}"
    ((ISSUES_FOUND++))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS_FOUND++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. CHECK FOR BUILD ARTIFACTS
check_build_artifacts() {
    info "Checking for build artifacts in git..."
    
    BUILD_ARTIFACTS=$(git ls-files | grep -E '\.(next|dist|build|coverage|out)/' || true)
    if [ ! -z "$BUILD_ARTIFACTS" ]; then
        issue "Build artifacts tracked in git:"
        echo "$BUILD_ARTIFACTS" | sed 's/^/   - /'
        return 1
    fi
    
    # Check for common build file patterns
    ARTIFACT_FILES=$(git ls-files | grep -E '\.(min\.js|bundle\.js|\.map|\.d\.ts\.map)$' || true)
    if [ ! -z "$ARTIFACT_FILES" ]; then
        warning "Potential build files tracked:"
        echo "$ARTIFACT_FILES" | head -5 | sed 's/^/   - /'
        [ $(echo "$ARTIFACT_FILES" | wc -l) -gt 5 ] && echo "   ... and $(($(echo "$ARTIFACT_FILES" | wc -l) - 5)) more"
    fi
    
    success "Build artifacts check complete"
}

# 2. CHECK FOR DUPLICATES
check_duplicates() {
    info "Checking for duplicate files..."
    
    # Find files with identical names (potential duplicates)
    DUPLICATE_NAMES=$(find "$REPO_ROOT" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" \
        | xargs basename -a | sort | uniq -d)
    
    if [ ! -z "$DUPLICATE_NAMES" ]; then
        warning "Files with duplicate names found:"
        for name in $DUPLICATE_NAMES; do
            echo "   📁 $name:"
            find "$REPO_ROOT" -name "$name" -not -path "*/node_modules/*" -not -path "*/.git/*" | sed 's/^/      - /'
        done
    fi
    
    success "Duplicate files check complete"
}

# 3. CHECK REPOSITORY SIZE
check_repository_size() {
    info "Checking repository size..."
    
    # Get repository size (excluding node_modules)
    REPO_SIZE_KB=$(du -sk "$REPO_ROOT" --exclude="node_modules" 2>/dev/null | cut -f1)
    REPO_SIZE_GB=$((REPO_SIZE_KB / 1024 / 1024))
    
    if [ $REPO_SIZE_GB -gt $MAX_REPO_SIZE_GB ]; then
        issue "Repository too large: ${REPO_SIZE_GB}GB (max: ${MAX_REPO_SIZE_GB}GB)"
        
        # Find largest directories
        info "Largest directories:"
        du -h "$REPO_ROOT"/* 2>/dev/null | grep -v node_modules | sort -hr | head -5 | sed 's/^/   - /'
    else
        success "Repository size OK: ${REPO_SIZE_GB}GB"
    fi
    
    # Check for large files
    LARGE_FILES=$(find "$REPO_ROOT" -type f -size +${MAX_FILE_SIZE_MB}M -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null || true)
    if [ ! -z "$LARGE_FILES" ]; then
        warning "Large files found (>${MAX_FILE_SIZE_MB}MB):"
        echo "$LARGE_FILES" | while read file; do
            size=$(du -h "$file" | cut -f1)
            echo "   - $size: $(basename "$file")"
        done
    fi
}

# 4. CHECK FOR SECRETS
check_secrets() {
    info "Scanning for potential secrets..."
    
    # Check for common secret patterns in tracked files
    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        MATCHES=$(git ls-files | xargs grep -i "$pattern" 2>/dev/null | grep -v ".md:" | head -3 || true)
        if [ ! -z "$MATCHES" ]; then
            warning "Potential secret pattern '$pattern' found:"
            echo "$MATCHES" | sed 's/^/   - /'
        fi
    done
    
    # Check for .env files in git
    ENV_FILES=$(git ls-files | grep "\.env" || true)
    if [ ! -z "$ENV_FILES" ]; then
        issue ".env files tracked in git:"
        echo "$ENV_FILES" | sed 's/^/   - /'
    fi
    
    success "Secret scan complete"
}

# 5. CHECK DEPENDENCY HEALTH
check_dependencies() {
    info "Checking dependency health..."
    
    # Count package.json files
    PACKAGE_COUNT=$(find "$REPO_ROOT" -name "package.json" -not -path "*/node_modules/*" | wc -l)
    if [ $PACKAGE_COUNT -gt 20 ]; then
        warning "Many package.json files: $PACKAGE_COUNT (consider consolidation)"
    fi
    
    # Check for node_modules size
    NODE_MODULES_SIZE=$(find "$REPO_ROOT" -name "node_modules" -type d -exec du -sh {} \; 2>/dev/null | head -5 || true)
    if [ ! -z "$NODE_MODULES_SIZE" ]; then
        info "Node modules sizes:"
        echo "$NODE_MODULES_SIZE" | sed 's/^/   - /'
    fi
    
    success "Dependencies check complete"
}

# 6. CHECK STRUCTURAL INTEGRITY
check_structure() {
    info "Checking structural integrity..."
    
    # Check for empty directories
    EMPTY_DIRS=$(find "$REPO_ROOT" -type d -empty -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null || true)
    if [ ! -z "$EMPTY_DIRS" ]; then
        warning "Empty directories found:"
        echo "$EMPTY_DIRS" | sed 's/^/   - /'
    fi
    
    # Check for broken symlinks
    BROKEN_LINKS=$(find "$REPO_ROOT" -type l ! -exec test -e {} \; -print 2>/dev/null || true)
    if [ ! -z "$BROKEN_LINKS" ]; then
        issue "Broken symlinks found:"
        echo "$BROKEN_LINKS" | sed 's/^/   - /'
    fi
    
    success "Structure check complete"
}

# 7. RUN ALL CHECKS
main() {
    cd "$REPO_ROOT"
    
    echo ""
    check_build_artifacts || true
    echo ""
    check_duplicates || true  
    echo ""
    check_repository_size || true
    echo ""
    check_secrets || true
    echo ""
    check_dependencies || true
    echo ""
    check_structure || true
    
    # Summary
    echo ""
    echo "=================================="
    if [ $ISSUES_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
        success "🎉 PERFECT REPOSITORY HEALTH!"
        echo -e "${GREEN}No issues or warnings found. Repository is in excellent condition.${NC}"
        exit 0
    elif [ $ISSUES_FOUND -eq 0 ]; then
        echo -e "${YELLOW}⚠️  REPOSITORY MOSTLY HEALTHY${NC}"
        echo -e "${YELLOW}Found $WARNINGS_FOUND warnings (no critical issues)${NC}"
        exit 0
    else
        echo -e "${RED}❌ REPOSITORY NEEDS ATTENTION${NC}"
        echo -e "${RED}Found $ISSUES_FOUND critical issues and $WARNINGS_FOUND warnings${NC}"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --fix)
        info "Auto-fix mode not implemented yet"
        exit 1
        ;;
    --help)
        echo "Usage: $0 [--fix] [--help]"
        echo ""
        echo "Repository health checker that prevents system rot by detecting:"
        echo "  • Build artifacts in git"
        echo "  • Duplicate files and directories"
        echo "  • Repository bloat"
        echo "  • Secret leaks"
        echo "  • Dependency issues"
        echo "  • Structural problems"
        echo ""
        echo "Options:"
        echo "  --fix    Attempt to automatically fix issues (coming soon)"
        echo "  --help   Show this help message"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac