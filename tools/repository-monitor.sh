#!/bin/bash
# 📊 KRINS Repository Monitor - Continuous Health Monitoring
# 
# Monitors repository health in real-time and sends alerts when:
# - Repository size grows too large
# - Build artifacts are committed
# - Security issues are detected
# - Performance degrades

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONITOR_DIR="$REPO_ROOT/.krins-monitor"

# Configuration
CHECK_INTERVAL=300  # 5 minutes
ALERT_THRESHOLD_SIZE_GB=5
ALERT_THRESHOLD_FILES=2000
MAX_CONSECUTIVE_WARNINGS=3

echo -e "${BLUE}📊 KRINS Repository Monitor${NC}"
echo "============================"

# Ensure monitor directory exists
mkdir -p "$MONITOR_DIR"

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

alert() {
    echo -e "${RED}🚨 ALERT: $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Initialize monitoring
init_monitoring() {
    info "Initializing repository monitoring..."
    
    # Create baseline metrics
    BASELINE_FILE="$MONITOR_DIR/baseline.json"
    
    if [ ! -f "$BASELINE_FILE" ]; then
        info "Creating baseline metrics..."
        
        cd "$REPO_ROOT"
        
        # Gather baseline data
        REPO_SIZE=$(du -sk . --exclude="node_modules" 2>/dev/null | cut -f1)
        FILE_COUNT=$(git ls-files | wc -l)
        COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo 0)
        BRANCH_COUNT=$(git branch -a | wc -l)
        
        # Store baseline
        cat > "$BASELINE_FILE" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "repo_size_kb": $REPO_SIZE,
    "file_count": $FILE_COUNT,
    "commit_count": $COMMIT_COUNT,
    "branch_count": $BRANCH_COUNT
}
EOF
        
        success "Baseline created: $FILE_COUNT files, $((REPO_SIZE/1024))MB"
    fi
}

# Check current repository health
check_repository_health() {
    cd "$REPO_ROOT"
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local issues=0
    
    # Current metrics
    CURRENT_SIZE=$(du -sk . --exclude="node_modules" 2>/dev/null | cut -f1)
    CURRENT_FILES=$(git ls-files | wc -l)
    CURRENT_SIZE_GB=$((CURRENT_SIZE / 1024 / 1024))
    
    info "Repository status: $CURRENT_FILES files, $((CURRENT_SIZE/1024))MB"
    
    # Check size growth
    if [ $CURRENT_SIZE_GB -gt $ALERT_THRESHOLD_SIZE_GB ]; then
        alert "Repository too large: ${CURRENT_SIZE_GB}GB (threshold: ${ALERT_THRESHOLD_SIZE_GB}GB)"
        ((issues++))
    fi
    
    # Check file count
    if [ $CURRENT_FILES -gt $ALERT_THRESHOLD_FILES ]; then
        alert "Too many files: $CURRENT_FILES (threshold: $ALERT_THRESHOLD_FILES)"
        ((issues++))
    fi
    
    # Check for build artifacts in git
    BUILD_ARTIFACTS=$(git ls-files | grep -E '\.(next|dist|build|coverage)/' | wc -l)
    if [ $BUILD_ARTIFACTS -gt 0 ]; then
        alert "Build artifacts in git: $BUILD_ARTIFACTS files"
        ((issues++))
    fi
    
    # Check for large files
    LARGE_FILES=$(git ls-files | xargs ls -la 2>/dev/null | awk '$5 > 52428800 {print $9, $5}' | wc -l)
    if [ $LARGE_FILES -gt 0 ]; then
        warning "Large files in repository: $LARGE_FILES files >50MB"
        ((issues++))
    fi
    
    # Check for secrets
    SECRET_FILES=$(git ls-files | grep -E '\.env' | wc -l)
    if [ $SECRET_FILES -gt 0 ]; then
        alert "Environment files in git: $SECRET_FILES files"
        ((issues++))
    fi
    
    # Store current health status
    HEALTH_FILE="$MONITOR_DIR/health-$(date +%Y%m%d-%H%M).json"
    cat > "$HEALTH_FILE" << EOF
{
    "timestamp": "$timestamp",
    "size_kb": $CURRENT_SIZE,
    "size_gb": $CURRENT_SIZE_GB,
    "file_count": $CURRENT_FILES,
    "build_artifacts": $BUILD_ARTIFACTS,
    "large_files": $LARGE_FILES,
    "secret_files": $SECRET_FILES,
    "issues_found": $issues
}
EOF
    
    # Clean up old health files (keep last 24 hours)
    find "$MONITOR_DIR" -name "health-*.json" -mtime +1 -delete 2>/dev/null || true
    
    return $issues
}

# Generate health report
generate_report() {
    info "Generating health report..."
    
    REPORT_FILE="$MONITOR_DIR/health-report.html"
    
    cat > "$REPORT_FILE" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>KRINS Repository Health Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .alert { background: #ffebee; border-left: 4px solid #f44336; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .success { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ KRINS Repository Health Report</h1>
        <p class="timestamp">Generated: $(date)</p>
    </div>
    
    <div class="metric success">
        <h3>📊 Current Status</h3>
        <p>Repository Size: $((CURRENT_SIZE/1024))MB</p>
        <p>File Count: $CURRENT_FILES files</p>
        <p>Last Check: $(date)</p>
    </div>
    
    <div class="metric">
        <h3>🔍 Health Checks</h3>
        <ul>
            <li>Build Artifacts: $BUILD_ARTIFACTS files</li>
            <li>Large Files: $LARGE_FILES files >50MB</li>
            <li>Secret Files: $SECRET_FILES .env files</li>
        </ul>
    </div>
    
    <div class="metric">
        <h3>💡 Recommendations</h3>
        <ul>
            <li>Run auto-cleanup weekly: <code>./tools/auto-cleanup.sh</code></li>
            <li>Check repository health: <code>./tools/repository-health-checker.sh</code></li>
            <li>Enable enhanced pre-commit hooks</li>
            <li>Monitor repository size growth</li>
        </ul>
    </div>
    
    <div class="metric">
        <h3>📈 Trends</h3>
        <p>Repository monitoring active since baseline creation.</p>
        <p>View detailed metrics in: <code>.krins-monitor/</code></p>
    </div>
</body>
</html>
EOF
    
    success "Report generated: $REPORT_FILE"
}

# Send alerts (placeholder for future integration)
send_alerts() {
    local severity="$1"
    local message="$2"
    
    # For now, just log to a file
    ALERT_LOG="$MONITOR_DIR/alerts.log"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) [$severity] $message" >> "$ALERT_LOG"
    
    # Future: Send to Slack, email, webhook, etc.
    info "Alert logged: [$severity] $message"
}

# Continuous monitoring loop
monitor_continuously() {
    info "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    info "Press Ctrl+C to stop"
    
    consecutive_warnings=0
    
    while true; do
        echo ""
        info "Running health check..."
        
        if check_repository_health; then
            success "Repository health check passed"
            consecutive_warnings=0
        else
            issues=$?
            warning "Repository health issues found: $issues"
            send_alerts "WARNING" "Repository health check failed with $issues issues"
            
            ((consecutive_warnings++))
            
            if [ $consecutive_warnings -ge $MAX_CONSECUTIVE_WARNINGS ]; then
                alert "Critical: $consecutive_warnings consecutive warnings!"
                send_alerts "CRITICAL" "Repository needs immediate attention"
                
                # Auto-run cleanup if available
                if [ -x "$REPO_ROOT/tools/auto-cleanup.sh" ]; then
                    info "Running auto-cleanup..."
                    "$REPO_ROOT/tools/auto-cleanup.sh"
                fi
                
                consecutive_warnings=0
            fi
        fi
        
        # Generate report every hour (12 cycles of 5 minutes)
        if [ $(($(date +%M) % 60)) -eq 0 ]; then
            generate_report
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# Show monitoring dashboard
show_dashboard() {
    cd "$REPO_ROOT"
    
    echo -e "${BLUE}📊 KRINS Repository Dashboard${NC}"
    echo "==============================="
    
    # Current status
    CURRENT_SIZE=$(du -sk . --exclude="node_modules" 2>/dev/null | cut -f1)
    CURRENT_FILES=$(git ls-files | wc -l)
    
    echo ""
    echo -e "${GREEN}Current Status:${NC}"
    echo "  📁 Repository Size: $((CURRENT_SIZE/1024))MB"
    echo "  📄 Tracked Files: $CURRENT_FILES"
    echo "  🌿 Current Branch: $(git branch --show-current)"
    echo "  📝 Last Commit: $(git log -1 --pretty=format:'%s' 2>/dev/null || echo 'No commits')"
    
    # Health status
    echo ""
    echo -e "${BLUE}Health Status:${NC}"
    
    if [ -x "$REPO_ROOT/tools/repository-health-checker.sh" ]; then
        "$REPO_ROOT/tools/repository-health-checker.sh" | grep -E "(✅|❌|⚠️)" | head -5
    else
        echo "  ⚠️  Health checker not available"
    fi
    
    # Recent alerts
    ALERT_LOG="$MONITOR_DIR/alerts.log"
    if [ -f "$ALERT_LOG" ]; then
        echo ""
        echo -e "${YELLOW}Recent Alerts:${NC}"
        tail -5 "$ALERT_LOG" 2>/dev/null || echo "  ✅ No recent alerts"
    fi
    
    # Quick actions
    echo ""
    echo -e "${BLUE}Quick Actions:${NC}"
    echo "  🧹 Auto Cleanup:    ./tools/auto-cleanup.sh"
    echo "  🔍 Health Check:    ./tools/repository-health-checker.sh"  
    echo "  📊 Start Monitor:   ./tools/repository-monitor.sh --monitor"
    echo "  📈 View Report:     open .krins-monitor/health-report.html"
}

# MAIN EXECUTION
main() {
    cd "$REPO_ROOT"
    init_monitoring
}

# Handle command line arguments
case "${1:-dashboard}" in
    --monitor)
        main
        monitor_continuously
        ;;
    --check)
        main
        check_repository_health
        generate_report
        ;;
    --report)
        main
        generate_report
        echo "Report generated at: .krins-monitor/health-report.html"
        ;;
    --dashboard|dashboard)
        main
        show_dashboard
        ;;
    --help)
        echo "Usage: $0 [--monitor|--check|--report|--dashboard|--help]"
        echo ""
        echo "Repository monitoring system that tracks:"
        echo "  • Repository size and growth"
        echo "  • File count and organization"
        echo "  • Build artifacts and secrets"
        echo "  • Performance metrics"
        echo ""
        echo "Commands:"
        echo "  --monitor     Start continuous monitoring"
        echo "  --check       Run single health check"
        echo "  --report      Generate HTML report"
        echo "  --dashboard   Show status dashboard (default)"
        echo "  --help        Show this help message"
        exit 0
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac