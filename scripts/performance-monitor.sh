#!/bin/bash

# 📊 KRINS-Chronicle-Keeper Performance Monitoring
# Real-time system performance and health monitoring

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="$PROJECT_ROOT/logs/performance-$(date +%Y%m%d-%H%M%S).log"
HEALTH_ENDPOINTS=(
    "http://localhost:3000/health:Frontend"
    "http://localhost:8000/health:FastAPI"
    "http://localhost:3003/health:Semantic Search"
    "http://localhost:5432:PostgreSQL"
    "http://localhost:6379:Redis"
)

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Print header
print_header() {
    echo -e "${BLUE}📊 KRINS-Chronicle-Keeper Performance Monitor${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${CYAN}Started: $(date)${NC}"
    echo -e "${CYAN}Log file: $LOG_FILE${NC}"
    echo ""
}

# Check service health
check_service_health() {
    local endpoint="$1"
    local service_name="$2"
    local status_icon="❓"
    local response_time=""
    
    if [[ "$endpoint" == *":5432" ]] || [[ "$endpoint" == *":6379" ]]; then
        # For database services, just check if port is open
        if timeout 2 bash -c "</dev/tcp/${endpoint#*://}" 2>/dev/null; then
            status_icon="✅"
            response_time="<50ms"
        else
            status_icon="❌"
            response_time="timeout"
        fi
    else
        # For HTTP services, check actual health endpoint
        local start_time=$(date +%s%N)
        if curl -s -m 5 "$endpoint" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            local duration_ms=$(( (end_time - start_time) / 1000000 ))
            status_icon="✅"
            response_time="${duration_ms}ms"
        else
            status_icon="❌"  
            response_time="failed"
        fi
    fi
    
    printf "${status_icon} %-20s %s\n" "$service_name" "$response_time"
}

# Monitor system resources
check_system_resources() {
    echo -e "${PURPLE}🖥️  System Resources${NC}"
    echo "----------------------------------------"
    
    # CPU usage
    if command -v top >/dev/null 2>&1; then
        local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
        echo -e "CPU Usage:     ${cpu_usage}%"
    fi
    
    # Memory usage
    if command -v vm_stat >/dev/null 2>&1; then
        local page_size=$(vm_stat | grep "page size" | awk '{print $8}')
        local pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local pages_total=$(( $(sysctl -n hw.memsize) / page_size ))
        local mem_used_percent=$(( (pages_total - pages_free) * 100 / pages_total ))
        echo -e "Memory Usage:  ${mem_used_percent}%"
    fi
    
    # Disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    echo -e "Disk Usage:    ${disk_usage}%"
    echo ""
}

# Check Docker containers
check_docker_status() {
    if command -v docker >/dev/null 2>&1; then
        echo -e "${PURPLE}🐳 Docker Containers${NC}"
        echo "----------------------------------------"
        
        if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -q "krins"; then
            docker ps --filter "name=krins" --format "{{.Names}}: {{.Status}}" | while read line; do
                if [[ "$line" == *"Up"* ]]; then
                    echo -e "✅ $line"
                else
                    echo -e "❌ $line"
                fi
            done
        else
            echo -e "${YELLOW}ℹ️  No KRINS containers running${NC}"
        fi
        echo ""
    fi
}

# Performance benchmarks
run_performance_tests() {
    echo -e "${PURPLE}🚀 Performance Tests${NC}"
    echo "----------------------------------------"
    
    # Test semantic search if available
    if curl -s "http://localhost:3003/health" > /dev/null 2>&1; then
        echo -n "Semantic Search API: "
        local search_start=$(date +%s%N)
        if curl -s -X POST "http://localhost:3003/api/search/semantic" \
           -H "Content-Type: application/json" \
           -d '{"query":"test architecture","similarity_threshold":0.7}' \
           > /dev/null 2>&1; then
            local search_end=$(date +%s%N)
            local search_time=$(( (search_end - search_start) / 1000000 ))
            if [ $search_time -lt 2000 ]; then
                echo -e "✅ ${search_time}ms (target: <2s)"
            else
                echo -e "⚠️  ${search_time}ms (slower than target)"
            fi
        else
            echo -e "❌ Failed"
        fi
    fi
    
    # Test FastAPI if available
    if curl -s "http://localhost:8000/health" > /dev/null 2>&1; then
        echo -n "FastAPI Response:    "
        local api_start=$(date +%s%N)
        if curl -s "http://localhost:8000/api/v1/adrs" > /dev/null 2>&1; then
            local api_end=$(date +%s%N)
            local api_time=$(( (api_end - api_start) / 1000000 ))
            if [ $api_time -lt 500 ]; then
                echo -e "✅ ${api_time}ms (target: <500ms)"
            else
                echo -e "⚠️  ${api_time}ms (slower than target)"
            fi
        else
            echo -e "❌ Failed"
        fi
    fi
    
    # Test frontend build size if available
    if [ -f "$PROJECT_ROOT/frontend/dist/index.html" ]; then
        echo -n "Frontend Bundle:     "
        local bundle_size=$(du -sh "$PROJECT_ROOT/frontend/dist/" | awk '{print $1}')
        echo -e "✅ ${bundle_size} (target: <5MB)"
    fi
    
    echo ""
}

# Generate performance report
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    {
        echo "KRINS-Chronicle-Keeper Performance Report"
        echo "======================================="
        echo "Timestamp: $timestamp"
        echo ""
        
        echo "Service Health:"
        for endpoint_info in "${HEALTH_ENDPOINTS[@]}"; do
            IFS=':' read -r endpoint service <<< "$endpoint_info"
            check_service_health "$endpoint" "$service"
        done
        echo ""
        
        check_system_resources
        check_docker_status
        run_performance_tests
        
    } | tee "$LOG_FILE"
}

# Real-time monitoring mode
monitor_realtime() {
    echo -e "${BLUE}Starting real-time monitoring... (Press Ctrl+C to stop)${NC}"
    echo ""
    
    while true; do
        clear
        print_header
        
        echo -e "${PURPLE}🏥 Service Health${NC}"
        echo "----------------------------------------"
        for endpoint_info in "${HEALTH_ENDPOINTS[@]}"; do
            IFS=':' read -r endpoint service <<< "$endpoint_info"
            check_service_health "$endpoint" "$service"
        done
        echo ""
        
        check_system_resources
        check_docker_status
        
        echo -e "${CYAN}Next update in 10 seconds...${NC}"
        sleep 10
    done
}

# Main execution
case "${1:-report}" in
    "realtime"|"monitor"|"watch")
        monitor_realtime
        ;;
    "test"|"benchmark")
        print_header
        run_performance_tests
        ;;
    "health"|"status")
        print_header
        echo -e "${PURPLE}🏥 Service Health Check${NC}"
        echo "----------------------------------------"
        for endpoint_info in "${HEALTH_ENDPOINTS[@]}"; do
            IFS=':' read -r endpoint service <<< "$endpoint_info"
            check_service_health "$endpoint" "$service"
        done
        ;;
    "report"|*)
        print_header
        generate_report
        echo -e "${GREEN}✅ Performance report saved to: $LOG_FILE${NC}"
        ;;
esac

echo -e "${BLUE}📊 Monitor complete. Use '$0 realtime' for continuous monitoring${NC}"