#!/bin/bash
# 🧹 KRINS Auto-Cleanup - Automated Repository Maintenance
# 
# Automatically cleans and maintains repository health by:
# - Removing build artifacts
# - Cleaning empty directories  
# - Updating gitignore patterns
# - Optimizing git repository
# - Clearing dependency caches

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🧹 KRINS Auto-Cleanup System${NC}"
echo "============================="

CLEANED_COUNT=0
CLEANED_SIZE=0

clean_action() {
    local description="$1"
    local size_freed="${2:-0}"
    echo -e "${GREEN}✅ $description${NC}"
    ((CLEANED_COUNT++))
    CLEANED_SIZE=$((CLEANED_SIZE + size_freed))
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. ULTRA-SAFE BUILD ARTIFACT CLEANUP
clean_build_artifacts() {
    info "🛡️ Ultra-safe build artifact cleanup..."
    
    cd "$REPO_ROOT"
    
    # ULTRA-SAFE: Only remove directories that are clearly build outputs
    # and NOT in critical paths
    
    # Define SAFE directories to clean (only obvious build outputs)
    SAFE_BUILD_DIRS=(
        ".next"      # Next.js build output
        "coverage"   # Test coverage reports
        ".nyc_output" # Istanbul coverage
    )
    
    # Define PROTECTED paths that should NEVER be touched
    PROTECTED_PATHS=(
        # Core development directories
        "./src"
        "./app"
        "./pages" 
        "./components"
        "./lib"
        "./utils"
        "./styles"
        "./public"
        "./docs"
        "./tools"
        "./scripts"
        "./config"
        "./.github"
        "./shared"
        
        # Project-specific directories
        "./CORE-PLATFORM"
        "./AI-SYSTEMS"
        "./AI_INTEGRATION"
        "./DECISION_MANAGEMENT"
        "./KRINS-HUB"
        "./ai-systems"
        "./frontend"
        "./backend"
        
        # Planning and documentation directories
        "./adrs"
        "./archive" 
        "./backup"
        "./backups"
        "./planning"
        "./strategies"
        "./specifications"
        "./analysis"
        "./reports"
        
        # Organization and workflow directories
        "./DASHBOARD"
        "./GOVERNANCE_PROCESS"
        "./KNOWLEDGE_ORGANIZATION"
        "./TEAM_COLLABORATION"
        "./ORGANIZATIONAL_INTELLIGENCE"
        
        # Any directory containing valuable data
        "./data"
        "./assets"
        "./resources"
        "./templates"
        "./examples"
        "./samples"
    )
    
    # Define PROTECTED file patterns that should NEVER be touched
    PROTECTED_FILE_PATTERNS=(
        "*WORKFLOW*"
        "*PLAN*"
        "*STRATEGY*"
        "*BACKUP*"
        "*roadmap*"
        "*spec*"
        "*analysis*"
        "*report*"
        "ADR-*"
        "*decision*"
        "*architecture*"
        "*design*"
        "README*"
        "CHANGELOG*"
        "LICENSE*"
        "CONTRIBUTING*"
        "*.md"
        "*.txt"
        "*.doc*"
        "*.pdf"
        "*.json"
        "*.yml"
        "*.yaml"
    )
    
    # ULTRA-SAFE: Only clean build directories that are NOT in protected paths
    for build_dir in "${SAFE_BUILD_DIRS[@]}"; do
        info "Checking for safe $build_dir directories..."
        
        # Find build directories
        BUILD_PATHS=$(find . -name "$build_dir" -type d -not -path "*/node_modules/*" 2>/dev/null || true)
        
        if [ ! -z "$BUILD_PATHS" ]; then
            while IFS= read -r path; do
                # Check if path is in ANY protected directory
                is_protected=false
                for protected in "${PROTECTED_PATHS[@]}"; do
                    if [[ "$path" == *"$protected"* ]]; then
                        is_protected=true
                        warning "PROTECTED: Skipping $path (in protected path $protected)"
                        break
                    fi
                done
                
                # Only clean if not protected AND clearly a build output
                if [ "$is_protected" = false ]; then
                    # CRITICAL: Check for any valuable files inside the directory
                    VALUABLE_FILES=$(find "$path" -name "*.md" -o -name "*.txt" -o -name "*.json" -o -name "README*" -o -name "CHANGELOG*" 2>/dev/null | head -5)
                    
                    if [ ! -z "$VALUABLE_FILES" ]; then
                        warning "SAFETY BLOCK: $path contains valuable files:"
                        echo "$VALUABLE_FILES" | sed 's/^/      - /'
                        warning "PROTECTED: $path preserved (contains documentation)"
                    else
                        # Double-check: must be in root or in DASHBOARD/ directory
                        if [[ "$path" == "./$build_dir" ]] || [[ "$path" == *"/DASHBOARD/"* ]]; then
                            BUILD_SIZE=$(du -sk "$path" 2>/dev/null | cut -f1 || echo 0)
                            info "SAFE TO CLEAN: $path (${BUILD_SIZE}KB, no valuable files)"
                            rm -rf "$path" 2>/dev/null || true
                            clean_action "Removed safe build directory: $path" "$BUILD_SIZE"
                        else
                            warning "SAFETY CHECK: Skipping $path (not in safe location)"
                        fi
                    fi
                else
                    info "PROTECTED: $path preserved"
                fi
            done <<< "$BUILD_PATHS"
        fi
    done
    
    # ULTRA-SAFE: Only remove obvious temporary files with specific extensions
    # CRITICAL: NEVER include patterns that could match valuable files
    SAFE_TEMP_PATTERNS=(
        "*.tmp"
        "*.temp"  
        ".DS_Store"
        "Thumbs.db"
        "desktop.ini"
        "*.log"  # Only if not in protected directory
        "*.cache"
        "*.swp"
        "*.swo"
        "*~"     # Vim backup files
    )
    
    for pattern in "${SAFE_TEMP_PATTERNS[@]}"; do
        TEMP_FILES=$(find . -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null || true)
        if [ ! -z "$TEMP_FILES" ]; then
            # Double-check each file against protected patterns
            SAFE_TO_DELETE=""
            while IFS= read -r temp_file; do
                file_is_protected=false
                
                # Check against protected file patterns
                filename=$(basename "$temp_file")
                for protected_pattern in "${PROTECTED_FILE_PATTERNS[@]}"; do
                    if [[ "$filename" == $protected_pattern ]] || [[ "$temp_file" == *"$protected_pattern"* ]]; then
                        file_is_protected=true
                        warning "PROTECTED: Keeping $temp_file (matches pattern: $protected_pattern)"
                        break
                    fi
                done
                
                # Check if file is in protected directory
                for protected_path in "${PROTECTED_PATHS[@]}"; do
                    if [[ "$temp_file" == *"$protected_path"* ]]; then
                        file_is_protected=true
                        warning "PROTECTED: Keeping $temp_file (in protected path: $protected_path)"
                        break
                    fi
                done
                
                if [ "$file_is_protected" = false ]; then
                    SAFE_TO_DELETE="$SAFE_TO_DELETE$temp_file\n"
                fi
            done <<< "$TEMP_FILES"
            
            if [ ! -z "$SAFE_TO_DELETE" ]; then
                info "Removing verified safe temp files: $pattern"
                echo -e "$SAFE_TO_DELETE" | grep -v '^$' | xargs rm -f 2>/dev/null || true
                clean_action "Removed verified safe temporary files: $pattern"
            fi
        fi
    done
    
    warning "SAFETY MODE: Only obvious build outputs and temp files removed"
    warning "Source code, configs, and important files are fully protected"
}

# 2. ULTRA-SAFE EMPTY DIRECTORY CLEANUP
clean_empty_directories() {
    info "🛡️ Ultra-safe empty directory cleanup..."
    
    cd "$REPO_ROOT"
    
    # Define directories that are NEVER safe to remove (even if empty)
    NEVER_REMOVE_DIRS=(
        "src"
        "app" 
        "pages"
        "components"
        "lib"
        "utils"
        "styles"
        "public"
        "docs"
        "tools" 
        "scripts"
        "config"
        ".github"
        "shared"
        "tests"
        "__tests__"
        "spec"
        "e2e"
    )
    
    # Find empty directories (excluding critical paths)
    EMPTY_DIRS=$(find . -type d -empty -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null || true)
    
    if [ ! -z "$EMPTY_DIRS" ]; then
        while IFS= read -r empty_dir; do
            # Check if directory name matches any protected pattern
            dir_name=$(basename "$empty_dir")
            is_protected=false
            
            for protected in "${NEVER_REMOVE_DIRS[@]}"; do
                if [[ "$dir_name" == "$protected" ]]; then
                    is_protected=true
                    warning "PROTECTED: Keeping empty directory $empty_dir (critical name: $protected)"
                    break
                fi
            done
            
            # Also check full path for protection
            for protected in "${PROTECTED_PATHS[@]}"; do
                if [[ "$empty_dir" == "$protected"* ]]; then
                    is_protected=true
                    warning "PROTECTED: Keeping $empty_dir (in critical path)"
                    break
                fi
            done
            
            # Only remove if clearly safe (temp/cache directories)
            if [ "$is_protected" = false ]; then
                # Only remove directories with obviously safe names
                if [[ "$dir_name" == *"cache"* ]] || [[ "$dir_name" == *"tmp"* ]] || [[ "$dir_name" == *"temp"* ]] || [[ "$dir_name" == ".next"* ]]; then
                    info "SAFE TO REMOVE: $empty_dir (clearly temporary)"
                    rmdir "$empty_dir" 2>/dev/null || true
                    clean_action "Removed safe empty directory: $empty_dir"
                else
                    warning "SAFETY CHECK: Keeping empty directory $empty_dir (unclear purpose)"
                fi
            fi
        done <<< "$EMPTY_DIRS"
    fi
    
    warning "SAFETY MODE: Only obviously temporary empty directories removed"
}

# 3. OPTIMIZE GIT REPOSITORY
optimize_git() {
    info "Optimizing git repository..."
    
    cd "$REPO_ROOT"
    
    # Clean up git references
    if git reflog expire --all --expire=now 2>/dev/null; then
        clean_action "Cleaned git reflog"
    fi
    
    # Garbage collect
    if git gc --prune=now --aggressive 2>/dev/null; then
        clean_action "Git garbage collection completed"
    fi
    
    # Remove untracked files (carefully)
    UNTRACKED=$(git clean -d -n 2>/dev/null | wc -l || echo 0)
    if [ $UNTRACKED -gt 0 ]; then
        warning "Found $UNTRACKED untracked files/directories"
        info "Run 'git clean -d -f' manually to remove them"
    fi
}

# 4. CLEAN DEPENDENCY CACHES
clean_dependency_caches() {
    info "Cleaning dependency caches..."
    
    cd "$REPO_ROOT"
    
    # Clean npm cache (if npm is available)
    if command -v npm >/dev/null 2>&1; then
        NPM_CACHE_SIZE=$(npm cache verify 2>/dev/null | grep "Total size" | awk '{print $3}' | sed 's/[^0-9]//g' || echo 0)
        if npm cache clean --force >/dev/null 2>&1; then
            clean_action "Cleaned npm cache" "$NPM_CACHE_SIZE"
        fi
    fi
    
    # Clean bun cache (if bun is available)  
    if command -v bun >/dev/null 2>&1; then
        if bun pm cache rm >/dev/null 2>&1; then
            clean_action "Cleaned bun cache"
        fi
    fi
    
    # Clean yarn cache (if yarn is available)
    if command -v yarn >/dev/null 2>&1; then
        if yarn cache clean >/dev/null 2>&1; then
            clean_action "Cleaned yarn cache"
        fi
    fi
}

# 5. UPDATE GITIGNORE PATTERNS
update_gitignore() {
    info "Checking .gitignore patterns..."
    
    cd "$REPO_ROOT"
    
    # Essential patterns that should be in .gitignore
    REQUIRED_PATTERNS=(
        "**/node_modules/"
        "**/.next/"
        "**/dist/"
        "**/build/" 
        "**/coverage/"
        "**/.env*"
        "**/.DS_Store"
        "**/Thumbs.db"
        "**/*.log"
        "**/.cache/"
        "**/.tmp/"
        "**/*.tmp"
        "**/*.temp"
    )
    
    MISSING_PATTERNS=""
    
    for pattern in "${REQUIRED_PATTERNS[@]}"; do
        if ! grep -q "^$pattern" .gitignore 2>/dev/null; then
            MISSING_PATTERNS="$MISSING_PATTERNS$pattern\n"
        fi
    done
    
    if [ ! -z "$MISSING_PATTERNS" ]; then
        info "Adding missing .gitignore patterns..."
        echo "" >> .gitignore
        echo "# Auto-added by KRINS cleanup system" >> .gitignore  
        echo -e "$MISSING_PATTERNS" >> .gitignore
        clean_action "Updated .gitignore with missing patterns"
    fi
}

# 6. CHECK FOR DUPLICATE FILES
check_duplicates() {
    info "Checking for duplicate files..."
    
    cd "$REPO_ROOT"
    
    # Find potential duplicate files by size and name
    DUPLICATES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -exec basename {} \; | sort | uniq -d)
    
    if [ ! -z "$DUPLICATES" ]; then
        warning "Files with duplicate names found:"
        for dup in $DUPLICATES; do
            echo "   📁 $dup:"
            find . -name "$dup" -not -path "*/node_modules/*" -not -path "*/.git/*" | sed 's/^/      - /'
        done
        echo ""
        info "Review these files manually to see if they can be consolidated"
    fi
}

# 7. SUMMARY AND RECOMMENDATIONS
show_summary() {
    echo ""
    echo "============================="
    
    if [ $CLEANED_COUNT -gt 0 ]; then
        SIZE_MB=$((CLEANED_SIZE / 1024))
        echo -e "${GREEN}🎉 Cleanup Complete!${NC}"
        echo -e "${GREEN}✅ $CLEANED_COUNT cleanup actions performed${NC}"
        if [ $SIZE_MB -gt 0 ]; then
            echo -e "${GREEN}💾 ~${SIZE_MB}MB disk space freed${NC}"
        fi
    else
        echo -e "${GREEN}✨ Repository Already Clean!${NC}"
        echo -e "${GREEN}No cleanup actions needed.${NC}"
    fi
    
    echo ""
    info "💡 Maintenance Recommendations:"
    echo "   • Run this script weekly: ./tools/auto-cleanup.sh"
    echo "   • Use health checker: ./tools/repository-health-checker.sh" 
    echo "   • Enable enhanced pre-commit: mv .githooks/pre-commit-enhanced .githooks/pre-commit"
    echo "   • Set up automated CI/CD health checks"
}

# MAIN EXECUTION
main() {
    cd "$REPO_ROOT"
    
    # Run all cleanup operations
    clean_build_artifacts
    echo ""
    clean_empty_directories  
    echo ""
    optimize_git
    echo ""
    clean_dependency_caches
    echo ""
    update_gitignore
    echo ""
    check_duplicates
    
    # Show summary
    show_summary
}

# Handle command line arguments
case "${1:-}" in
    --dry-run)
        info "Dry run mode - showing what would be cleaned..."
        echo ""
        info "This feature is not implemented yet"
        echo "The script will show what it would clean without actually doing it"
        exit 0
        ;;
    --help)
        echo "Usage: $0 [--dry-run] [--help]"
        echo ""
        echo "Automated repository maintenance that cleans:"
        echo "  • Build artifacts (.next, dist, coverage)"
        echo "  • Empty directories"
        echo "  • Git repository optimization"  
        echo "  • Dependency caches (npm, bun, yarn)"
        echo "  • Updates .gitignore with missing patterns"
        echo "  • Identifies duplicate files"
        echo ""
        echo "Options:"
        echo "  --dry-run  Show what would be cleaned (coming soon)"
        echo "  --help     Show this help message"
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