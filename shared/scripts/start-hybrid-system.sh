#!/bin/bash
# 🚀 Dev Memory OS - Level 4 + MCP Hybrid System Startup Script
# The world's first production-ready AI Team Coordination System

set -e

echo "🚀 ============================================"
echo "🚀 DEV MEMORY OS - HYBRID SYSTEM STARTUP"
echo "🚀 Level 4 + MCP Integration"
echo "🚀 ============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONFIG_DIR="$(dirname "$0")/../../config"
LOG_DIR="$(dirname "$0")/../../logs"
PID_DIR="$(dirname "$0")/../../pids"

# Create necessary directories
mkdir -p "$LOG_DIR" "$PID_DIR"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start service in background with PID tracking
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local pid_file="$PID_DIR/$name.pid"
    local log_file="$LOG_DIR/$name.log"
    
    echo -e "${BLUE}🚀 Starting $name...${NC}"
    
    if [ -f "$pid_file" ]; then
        local existing_pid=$(cat "$pid_file")
        if kill -0 "$existing_pid" 2>/dev/null; then
            echo -e "${GREEN}✅ $name is already running (PID: $existing_pid)${NC}"
            return 0
        else
            rm -f "$pid_file"
        fi
    fi
    
    if ! check_port "$port" && [ "$port" != "0" ]; then
        echo -e "${RED}❌ Cannot start $name - port $port is occupied${NC}"
        return 1
    fi
    
    cd "$CONFIG_DIR"
    nohup $command > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "$pid_file"
    
    sleep 2
    if kill -0 "$pid" 2>/dev/null; then
        echo -e "${GREEN}✅ $name started successfully (PID: $pid, Port: $port)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start $name${NC}"
        rm -f "$pid_file"
        return 1
    fi
}

# Function to check service health
check_health() {
    local name=$1
    local url=$2
    local max_attempts=10
    local attempt=1
    
    echo -e "${CYAN}🔍 Checking $name health...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is healthy${NC}"
            return 0
        fi
        
        sleep 1
        ((attempt++))
    done
    
    echo -e "${YELLOW}⚠️  $name health check timeout${NC}"
    return 1
}

echo -e "${PURPLE}🧹 Cleaning up any existing processes...${NC}"
pkill -f "mcp-ai-team" 2>/dev/null || true
pkill -f "mcp-adapter" 2>/dev/null || true
pkill -f "KRINS-HUB.*server.js" 2>/dev/null || true

echo ""
echo -e "${PURPLE}🚀 Starting Core Services...${NC}"

# 1. Start MCP-AI-Team Server (Core AI Coordination)
start_service "mcp-ai-team" "bun run ai:mcp-team" "3006" || exit 1

# 2. Start KRINS-HUB Backend (Semantic Search)
start_service "semantic-server" "bun run semantic-server:dev" "3003" || exit 1

# 3. Start MCP-Adapter (Protocol Bridge)
start_service "mcp-adapter" "bun run mcp:adapter" "0" || exit 1

echo ""
echo -e "${PURPLE}🔍 Running Health Checks...${NC}"

check_health "MCP-AI-Team" "http://localhost:3006/health"
check_health "KRINS-HUB Backend" "http://localhost:3003/health"

echo ""
echo -e "${GREEN}🚀 ============================================${NC}"
echo -e "${GREEN}🚀 HYBRID SYSTEM STARTUP COMPLETE!${NC}"
echo -e "${GREEN}🚀 ============================================${NC}"
echo ""
echo -e "${CYAN}📊 Service Dashboard:${NC}"
echo -e "  • ${BLUE}MCP-AI-Team HTTP:${NC}    http://localhost:3006"
echo -e "  • ${BLUE}MCP-AI-Team WebSocket:${NC} ws://localhost:3007/ws"
echo -e "  • ${BLUE}KRINS-HUB Backend:${NC}    http://localhost:3003"
echo -e "  • ${BLUE}MCP-Adapter:${NC}          Active (WebSocket bridge)"
echo ""
echo -e "${CYAN}📋 Quick Test Commands:${NC}"
echo -e "  • ${YELLOW}curl http://localhost:3006/health${NC}"
echo -e "  • ${YELLOW}curl http://localhost:3006/specialists${NC}"
echo -e "  • ${YELLOW}curl http://localhost:3003/health${NC}"
echo ""
echo -e "${CYAN}📁 Logs Directory:${NC} $LOG_DIR"
echo -e "${CYAN}📁 PIDs Directory:${NC} $PID_DIR"
echo ""
echo -e "${GREEN}✨ The future of software development is now running! ✨${NC}"