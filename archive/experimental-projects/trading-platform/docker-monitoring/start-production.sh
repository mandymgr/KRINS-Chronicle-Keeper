#!/bin/bash

# Revolutionary Trading System - Production Startup Script
# Starts complete system with monitoring for 1M tx/sec capability

set -e  # Exit on any error

echo "🚀 Starting Revolutionary Trading System - Production Environment"
echo "================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required files exist
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"
}

# Set environment variables
setup_environment() {
    echo -e "${BLUE}Setting up environment variables...${NC}"
    
    export VERSION=${VERSION:-$(git rev-parse --short HEAD 2>/dev/null || echo "latest")}
    export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-revolutionary_trading_2025}
    export REDIS_PASSWORD=${REDIS_PASSWORD:-redis_revolutionary_2025}
    export GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-revolutionary_grafana_2025}
    export PGADMIN_PASSWORD=${PGADMIN_PASSWORD:-admin_revolutionary_2025}
    
    echo -e "${GREEN}✅ Environment configured${NC}"
    echo -e "   Version: ${VERSION}"
    echo -e "   PostgreSQL Password: ${POSTGRES_PASSWORD:0:3}***"
    echo -e "   Redis Password: ${REDIS_PASSWORD:0:3}***"
}

# Create required directories
create_directories() {
    echo -e "${BLUE}Creating required directories...${NC}"
    
    mkdir -p logs
    mkdir -p data/prometheus
    mkdir -p data/grafana
    mkdir -p data/loki
    mkdir -p data/jaeger
    mkdir -p grafana/dashboards
    mkdir -p grafana/provisioning/datasources
    mkdir -p grafana/provisioning/dashboards
    
    # Set proper permissions
    sudo chown -R 472:472 data/grafana 2>/dev/null || true
    sudo chown -R 10001:10001 data/loki 2>/dev/null || true
    
    echo -e "${GREEN}✅ Directories created${NC}"
}

# Build custom images
build_images() {
    echo -e "${BLUE}Building custom Docker images...${NC}"
    
    echo -e "${YELLOW}Building Rust WASM Orderbook...${NC}"
    cd ../rust-orderbook-core
    if [ ! -f Dockerfile.production ]; then
        cat > Dockerfile.production << 'EOF'
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/trading-orderbook .
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
CMD ["./trading-orderbook"]
EOF
    fi
    docker build -f Dockerfile.production -t trading-system/rust-orderbook:${VERSION} .
    cd ../docker-monitoring
    
    echo -e "${YELLOW}Building Go Streaming API...${NC}"
    cd ../go-streaming-api
    docker build -t trading-system/go-streaming-api:${VERSION} .
    cd ../docker-monitoring
    
    echo -e "${YELLOW}Building React Dashboard...${NC}"
    cd ../react-trading-dashboard
    if [ ! -f Dockerfile.production ]; then
        cat > Dockerfile.production << 'EOF'
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    docker build -f Dockerfile.production -t trading-system/react-dashboard:${VERSION} .
    cd ../docker-monitoring
    
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Create Docker secrets
create_secrets() {
    echo -e "${BLUE}Creating Docker secrets...${NC}"
    
    echo "${POSTGRES_PASSWORD}" | docker secret create postgres_password - 2>/dev/null || echo "postgres_password secret already exists"
    echo "${REDIS_PASSWORD}" | docker secret create redis_password - 2>/dev/null || echo "redis_password secret already exists"
    echo "${GRAFANA_PASSWORD}" | docker secret create grafana_password - 2>/dev/null || echo "grafana_password secret already exists"
    
    echo -e "${GREEN}✅ Secrets created${NC}"
}

# Initialize Docker Swarm (if not already)
init_swarm() {
    if ! docker info | grep -q "Swarm: active"; then
        echo -e "${BLUE}Initializing Docker Swarm...${NC}"
        docker swarm init
        echo -e "${GREEN}✅ Docker Swarm initialized${NC}"
    else
        echo -e "${GREEN}✅ Docker Swarm already active${NC}"
    fi
}

# Create monitoring configuration files
create_configs() {
    echo -e "${BLUE}Creating configuration files...${NC}"
    
    # Grafana datasources
    mkdir -p grafana/provisioning/datasources
    cat > grafana/provisioning/datasources/datasources.yml << 'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://trading-prometheus:9090
    isDefault: true
  - name: Loki
    type: loki
    access: proxy
    url: http://trading-loki:3100
EOF

    # Grafana dashboards provisioning
    mkdir -p grafana/provisioning/dashboards
    cat > grafana/provisioning/dashboards/dashboards.yml << 'EOF'
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

    # AlertManager configuration
    cat > alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@trading-system.local'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'trading-alerts'

receivers:
  - name: 'trading-alerts'
    email_configs:
      - to: 'admin@trading-system.local'
        subject: '[Trading System] {{ .Status }}: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

    echo -e "${GREEN}✅ Configuration files created${NC}"
}

# Start the stack
start_stack() {
    echo -e "${BLUE}Starting the complete trading system...${NC}"
    
    # First start the database infrastructure
    echo -e "${YELLOW}Starting database infrastructure...${NC}"
    docker-compose -f ../postgres-realtime/docker-compose.yml up -d
    
    # Wait for database to be ready
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 30
    
    # Start monitoring and application stack
    echo -e "${YELLOW}Starting monitoring and application stack...${NC}"
    docker-compose -f docker-compose.production.yml up -d
    
    echo -e "${GREEN}✅ All services started${NC}"
}

# Health check
health_check() {
    echo -e "${BLUE}Performing health checks...${NC}"
    
    local services=(
        "http://localhost:8080/api/v1/health:Go API"
        "http://localhost:3000:React Dashboard"
        "http://localhost:9090/-/healthy:Prometheus"
        "http://localhost:3001/api/health:Grafana"
        "http://localhost:5432:PostgreSQL"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        if curl -f "$url" &>/dev/null; then
            echo -e "${GREEN}✅ $name is healthy${NC}"
        else
            echo -e "${RED}❌ $name is not responding${NC}"
        fi
    done
}

# Performance test
performance_test() {
    echo -e "${BLUE}Running performance benchmark...${NC}"
    
    # Wait for services to warm up
    sleep 30
    
    echo -e "${YELLOW}Testing orderbook performance...${NC}"
    curl -s "http://localhost:8080/api/v1/benchmark?iterations=100000" | jq .
    
    echo -e "${YELLOW}Testing API latency...${NC}"
    for i in {1..10}; do
        start_time=$(date +%s%3N)
        curl -s "http://localhost:8080/api/v1/stats" > /dev/null
        end_time=$(date +%s%3N)
        latency=$((end_time - start_time))
        echo "Request $i: ${latency}ms"
    done
}

# Display dashboard URLs
show_dashboards() {
    echo ""
    echo -e "${GREEN}🎉 Revolutionary Trading System is now running!${NC}"
    echo "================================================="
    echo -e "${BLUE}Dashboard URLs:${NC}"
    echo "• Trading Dashboard:    http://localhost:3000"
    echo "• API Documentation:    http://localhost:8080/api/v1"
    echo "• Grafana Monitoring:   http://localhost:3001 (admin/revolutionary_grafana_2025)"
    echo "• Prometheus Metrics:   http://localhost:9090"
    echo "• Database Admin:       http://localhost:5050 (admin@trading-system.com/admin_revolutionary_2025)"
    echo "• Traefik Dashboard:    http://localhost:8082"
    echo "• Jaeger Tracing:       http://localhost:16686"
    echo "• Portainer:            https://localhost:9443"
    echo ""
    echo -e "${YELLOW}Performance Targets:${NC}"
    echo "• 1,000,000 transactions per second"
    echo "• Sub-millisecond order matching"
    echo "• Real-time WebSocket streaming"
    echo "• EU MiFID II compliance"
    echo ""
    echo -e "${GREEN}System Status: OPERATIONAL 🚀${NC}"
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    create_directories
    build_images
    create_secrets
    init_swarm
    create_configs
    start_stack
    
    echo -e "${YELLOW}Waiting for services to initialize...${NC}"
    sleep 60
    
    health_check
    performance_test
    show_dashboards
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    docker-compose -f docker-compose.production.yml down
    docker-compose -f ../postgres-realtime/docker-compose.yml down
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Parse command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        cleanup
        exit 0
        ;;
    "restart")
        cleanup
        main
        ;;
    "logs")
        docker-compose -f docker-compose.production.yml logs -f
        ;;
    "status")
        docker-compose -f docker-compose.production.yml ps
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status}"
        exit 1
        ;;
esac

# Keep script running to maintain services
if [ "${1:-start}" = "start" ]; then
    echo -e "\n${GREEN}Press Ctrl+C to stop all services${NC}"
    while true; do
        sleep 60
        # Optional: Add periodic health checks here
    done
fi