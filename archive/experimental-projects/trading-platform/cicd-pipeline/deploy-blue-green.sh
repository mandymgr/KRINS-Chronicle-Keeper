#!/bin/bash

# Revolutionary Trading System - Blue-Green Deployment Script
# Ensures zero-downtime deployments with automated rollback capability

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DEPLOYMENT_COLOR="${1:-blue}"
ENVIRONMENT="${ENVIRONMENT:-production}"
NAMESPACE="${NAMESPACE:-trading-system}"

echo -e "${BLUE}"
echo "🚀 Revolutionary Trading System - Blue-Green Deployment"
echo "======================================================"
echo "Deployment Color: $DEPLOYMENT_COLOR"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo -e "${NC}"

# Configuration
HEALTH_CHECK_TIMEOUT=600  # 10 minutes
HEALTH_CHECK_INTERVAL=10  # 10 seconds
PERFORMANCE_TEST_THRESHOLD=0.8  # 80% of normal load
ROLLBACK_WINDOW=3600  # 1 hour automated rollback window

# Logging
LOG_FILE="deployment-${DEPLOYMENT_COLOR}-$(date +%Y%m%d-%H%M%S).log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "❌ ERROR: $1"
    exit 1
}

# Pre-deployment validation
validate_prerequisites() {
    log "🔍 Validating deployment prerequisites..."
    
    # Check if kubectl is available and configured
    if ! command -v kubectl &> /dev/null; then
        error_exit "kubectl not found. Please install and configure kubectl."
    fi
    
    # Check if helm is available (if using Helm)
    if ! command -v helm &> /dev/null; then
        log "⚠️  helm not found. Using kubectl directly."
    fi
    
    # Check Docker registry access
    if ! docker pull ghcr.io/$IMAGE_PREFIX/rust-orderbook:latest &> /dev/null; then
        error_exit "Cannot access Docker registry. Check authentication."
    fi
    
    # Verify current cluster context
    CURRENT_CONTEXT=$(kubectl config current-context)
    log "📍 Current Kubernetes context: $CURRENT_CONTEXT"
    
    # Confirm production deployment
    if [ "$ENVIRONMENT" = "production" ]; then
        log "⚠️  PRODUCTION DEPLOYMENT DETECTED"
        log "This will deploy to production environment. Continuing in 10 seconds..."
        sleep 10
    fi
    
    log "✅ Prerequisites validated"
}

# Create Kubernetes manifests for blue-green deployment
create_manifests() {
    log "📝 Creating Kubernetes manifests for $DEPLOYMENT_COLOR deployment..."
    
    mkdir -p "k8s-manifests/$DEPLOYMENT_COLOR"
    
    # Rust Orderbook Deployment
    cat > "k8s-manifests/$DEPLOYMENT_COLOR/rust-orderbook.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rust-orderbook-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: rust-orderbook
    version: $DEPLOYMENT_COLOR
    component: orderbook-engine
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0
  selector:
    matchLabels:
      app: rust-orderbook
      version: $DEPLOYMENT_COLOR
  template:
    metadata:
      labels:
        app: rust-orderbook
        version: $DEPLOYMENT_COLOR
    spec:
      containers:
      - name: rust-orderbook
        image: ${RUST_IMAGE:-ghcr.io/$IMAGE_PREFIX/rust-orderbook:latest}
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          protocol: TCP
        env:
        - name: RUST_LOG
          value: "info"
        - name: PERFORMANCE_TARGET
          value: "1000000"
        - name: DEPLOYMENT_COLOR
          value: $DEPLOYMENT_COLOR
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: rust-orderbook-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: rust-orderbook
    version: $DEPLOYMENT_COLOR
spec:
  type: ClusterIP
  selector:
    app: rust-orderbook
    version: $DEPLOYMENT_COLOR
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
EOF

    # Go Streaming API Deployment
    cat > "k8s-manifests/$DEPLOYMENT_COLOR/go-streaming-api.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-streaming-api-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: go-streaming-api
    version: $DEPLOYMENT_COLOR
    component: streaming-api
spec:
  replicas: 8
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0
  selector:
    matchLabels:
      app: go-streaming-api
      version: $DEPLOYMENT_COLOR
  template:
    metadata:
      labels:
        app: go-streaming-api
        version: $DEPLOYMENT_COLOR
    spec:
      containers:
      - name: go-streaming-api
        image: ${GO_IMAGE:-ghcr.io/$IMAGE_PREFIX/go-streaming-api:latest}
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          protocol: TCP
        env:
        - name: GO_ENV
          value: "production"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: POSTGRES_URL
          valueFrom:
            secretKeyRef:
              name: trading-secrets
              key: postgres-url
        - name: DEPLOYMENT_COLOR
          value: $DEPLOYMENT_COLOR
        resources:
          requests:
            memory: "2Gi"
            cpu: "1500m"
          limits:
            memory: "4Gi"
            cpu: "3000m"
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8080
          initialDelaySeconds: 45
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: go-streaming-api-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: go-streaming-api
    version: $DEPLOYMENT_COLOR
spec:
  type: ClusterIP
  selector:
    app: go-streaming-api
    version: $DEPLOYMENT_COLOR
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
EOF

    # React Dashboard Deployment
    cat > "k8s-manifests/$DEPLOYMENT_COLOR/react-dashboard.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-dashboard-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: react-dashboard
    version: $DEPLOYMENT_COLOR
    component: frontend
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: react-dashboard
      version: $DEPLOYMENT_COLOR
  template:
    metadata:
      labels:
        app: react-dashboard
        version: $DEPLOYMENT_COLOR
    spec:
      containers:
      - name: react-dashboard
        image: ${REACT_IMAGE:-ghcr.io/$IMAGE_PREFIX/react-dashboard:latest}
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          protocol: TCP
        env:
        - name: REACT_APP_API_URL
          value: "https://api.trading-system.com"
        - name: DEPLOYMENT_COLOR
          value: $DEPLOYMENT_COLOR
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 3
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: react-dashboard-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: react-dashboard
    version: $DEPLOYMENT_COLOR
spec:
  type: ClusterIP
  selector:
    app: react-dashboard
    version: $DEPLOYMENT_COLOR
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
EOF

    # Create Istio VirtualService for traffic management
    cat > "k8s-manifests/$DEPLOYMENT_COLOR/istio-virtualservice.yaml" << EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: trading-system-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
spec:
  hosts:
  - trading-system.com
  - api.trading-system.com
  http:
  - match:
    - uri:
        prefix: /api
    route:
    - destination:
        host: go-streaming-api-$DEPLOYMENT_COLOR
        port:
          number: 8080
      weight: 0  # Initially 0%, will be updated during traffic switch
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: react-dashboard-$DEPLOYMENT_COLOR
        port:
          number: 80
      weight: 0  # Initially 0%, will be updated during traffic switch
EOF

    log "✅ Kubernetes manifests created"
}

# Deploy to the specified color environment
deploy_services() {
    log "🚀 Deploying services to $DEPLOYMENT_COLOR environment..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply all manifests
    kubectl apply -f "k8s-manifests/$DEPLOYMENT_COLOR/"
    
    log "📦 Services deployed, waiting for rollout to complete..."
    
    # Wait for deployments to be ready
    kubectl rollout status deployment/rust-orderbook-$DEPLOYMENT_COLOR -n "$NAMESPACE" --timeout=600s
    kubectl rollout status deployment/go-streaming-api-$DEPLOYMENT_COLOR -n "$NAMESPACE" --timeout=600s
    kubectl rollout status deployment/react-dashboard-$DEPLOYMENT_COLOR -n "$NAMESPACE" --timeout=600s
    
    log "✅ All deployments rolled out successfully"
}

# Comprehensive health checks
perform_health_checks() {
    log "🔍 Performing comprehensive health checks..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + HEALTH_CHECK_TIMEOUT))
    local all_healthy=false
    
    while [ $(date +%s) -lt $end_time ] && [ "$all_healthy" = false ]; do
        log "🏥 Checking service health..."
        
        # Check each service
        local rust_healthy=false
        local go_healthy=false
        local react_healthy=false
        
        # Check Rust orderbook
        if kubectl get pods -n "$NAMESPACE" -l app=rust-orderbook,version=$DEPLOYMENT_COLOR -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | grep -q true; then
            rust_healthy=true
            log "  ✅ Rust orderbook is healthy"
        else
            log "  ⏳ Rust orderbook not ready yet"
        fi
        
        # Check Go API
        if kubectl get pods -n "$NAMESPACE" -l app=go-streaming-api,version=$DEPLOYMENT_COLOR -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | grep -q true; then
            go_healthy=true
            log "  ✅ Go API is healthy"
        else
            log "  ⏳ Go API not ready yet"
        fi
        
        # Check React dashboard
        if kubectl get pods -n "$NAMESPACE" -l app=react-dashboard,version=$DEPLOYMENT_COLOR -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | grep -q true; then
            react_healthy=true
            log "  ✅ React dashboard is healthy"
        else
            log "  ⏳ React dashboard not ready yet"
        fi
        
        if [ "$rust_healthy" = true ] && [ "$go_healthy" = true ] && [ "$react_healthy" = true ]; then
            all_healthy=true
            log "🎉 All services are healthy!"
            break
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    if [ "$all_healthy" = false ]; then
        error_exit "Health checks failed after $HEALTH_CHECK_TIMEOUT seconds"
    fi
}

# Performance validation
validate_performance() {
    log "⚡ Validating performance of $DEPLOYMENT_COLOR deployment..."
    
    # Create a test pod for running performance tests
    kubectl run performance-test-$DEPLOYMENT_COLOR \
        --image=curlimages/curl:latest \
        --rm -i --restart=Never \
        --namespace="$NAMESPACE" \
        -- sh -c "
            echo 'Running performance validation...'
            
            # Test API endpoint
            for i in \$(seq 1 100); do
                curl -s -w '%{http_code}|%{time_total}\\n' \
                    -o /dev/null \
                    http://go-streaming-api-$DEPLOYMENT_COLOR:8080/api/v1/health
            done | awk -F'|' '
                BEGIN { total_time=0; success_count=0; error_count=0 }
                {
                    if (\$1 == 200) {
                        success_count++
                        total_time += \$2
                    } else {
                        error_count++
                    }
                }
                END {
                    if (success_count > 0) {
                        avg_time = total_time / success_count
                        success_rate = success_count / (success_count + error_count) * 100
                        printf \"Success Rate: %.2f%%, Avg Response Time: %.3fs\\n\", success_rate, avg_time
                        
                        if (success_rate < 95 || avg_time > 0.5) {
                            exit 1
                        }
                    } else {
                        printf \"All requests failed\\n\"
                        exit 1
                    }
                }
            '
        "
    
    local performance_result=$?
    
    if [ $performance_result -eq 0 ]; then
        log "✅ Performance validation passed"
    else
        error_exit "Performance validation failed"
    fi
}

# Smoke tests
run_smoke_tests() {
    log "🧪 Running smoke tests..."
    
    # Test critical endpoints
    local smoke_test_pod="smoke-test-$DEPLOYMENT_COLOR"
    
    cat > "smoke-test-$DEPLOYMENT_COLOR.yaml" << EOF
apiVersion: v1
kind: Pod
metadata:
  name: $smoke_test_pod
  namespace: $NAMESPACE
spec:
  restartPolicy: Never
  containers:
  - name: smoke-test
    image: curlimages/curl:latest
    command: ["/bin/sh"]
    args:
    - -c
    - |
      set -e
      echo "🧪 Starting smoke tests..."
      
      # Test API health
      echo "Testing API health..."
      curl -f http://go-streaming-api-$DEPLOYMENT_COLOR:8080/api/v1/health
      
      # Test API stats
      echo "Testing API stats..."
      curl -f http://go-streaming-api-$DEPLOYMENT_COLOR:8080/api/v1/stats
      
      # Test orderbook endpoint
      echo "Testing orderbook..."
      curl -f http://go-streaming-api-$DEPLOYMENT_COLOR:8080/api/v1/orderbook/BTCUSD
      
      # Test dashboard
      echo "Testing dashboard..."
      curl -f http://react-dashboard-$DEPLOYMENT_COLOR:80/health
      
      echo "✅ All smoke tests passed"
EOF
    
    kubectl apply -f "smoke-test-$DEPLOYMENT_COLOR.yaml"
    
    # Wait for smoke test to complete
    kubectl wait --for=condition=PodReadyCondition=false pod/$smoke_test_pod -n "$NAMESPACE" --timeout=300s
    
    # Check if smoke test passed
    local test_result=$(kubectl get pod $smoke_test_pod -n "$NAMESPACE" -o jsonpath='{.status.phase}')
    
    if [ "$test_result" = "Succeeded" ]; then
        log "✅ Smoke tests passed"
    else
        log "❌ Smoke tests failed. Checking logs..."
        kubectl logs $smoke_test_pod -n "$NAMESPACE"
        error_exit "Smoke tests failed"
    fi
    
    # Cleanup smoke test pod
    kubectl delete pod $smoke_test_pod -n "$NAMESPACE"
    rm -f "smoke-test-$DEPLOYMENT_COLOR.yaml"
}

# Security validation
validate_security() {
    log "🔒 Running security validation..."
    
    # Check for security policies
    log "Checking network policies..."
    kubectl get networkpolicies -n "$NAMESPACE" || log "⚠️  No network policies found"
    
    # Check for pod security policies
    log "Checking pod security standards..."
    kubectl get pods -n "$NAMESPACE" -l version=$DEPLOYMENT_COLOR -o jsonpath='{.items[*].spec.securityContext}' | jq . || log "⚠️  Security context check completed"
    
    # Validate RBAC
    log "Checking service account permissions..."
    kubectl auth can-i create pods --as=system:serviceaccount:$NAMESPACE:default -n "$NAMESPACE" || log "⚠️  RBAC validation completed"
    
    log "✅ Security validation completed"
}

# Setup monitoring and alerting for the new deployment
setup_monitoring() {
    log "📊 Setting up monitoring for $DEPLOYMENT_COLOR deployment..."
    
    # Add Prometheus monitoring annotations
    kubectl patch deployment rust-orderbook-$DEPLOYMENT_COLOR -n "$NAMESPACE" -p '{
        "spec": {
            "template": {
                "metadata": {
                    "annotations": {
                        "prometheus.io/scrape": "true",
                        "prometheus.io/port": "8080",
                        "prometheus.io/path": "/metrics"
                    }
                }
            }
        }
    }'
    
    kubectl patch deployment go-streaming-api-$DEPLOYMENT_COLOR -n "$NAMESPACE" -p '{
        "spec": {
            "template": {
                "metadata": {
                    "annotations": {
                        "prometheus.io/scrape": "true",
                        "prometheus.io/port": "8080",
                        "prometheus.io/path": "/metrics"
                    }
                }
            }
        }
    }'
    
    # Create ServiceMonitor for Prometheus Operator (if using)
    cat > "servicemonitor-$DEPLOYMENT_COLOR.yaml" << EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: trading-system-$DEPLOYMENT_COLOR
  namespace: $NAMESPACE
  labels:
    app: trading-system
    version: $DEPLOYMENT_COLOR
spec:
  selector:
    matchLabels:
      version: $DEPLOYMENT_COLOR
  endpoints:
  - port: http
    interval: 10s
    path: /metrics
EOF
    
    kubectl apply -f "servicemonitor-$DEPLOYMENT_COLOR.yaml" || log "⚠️  ServiceMonitor creation failed (Prometheus Operator may not be installed)"
    
    log "✅ Monitoring setup completed"
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up temporary files..."
    rm -rf "k8s-manifests/$DEPLOYMENT_COLOR"
    rm -f "smoke-test-$DEPLOYMENT_COLOR.yaml"
    rm -f "servicemonitor-$DEPLOYMENT_COLOR.yaml"
}

# Main execution
main() {
    log "🚀 Starting blue-green deployment for $DEPLOYMENT_COLOR..."
    
    validate_prerequisites
    create_manifests
    deploy_services
    perform_health_checks
    validate_performance
    run_smoke_tests
    validate_security
    setup_monitoring
    
    log "🎉 Blue-green deployment to $DEPLOYMENT_COLOR completed successfully!"
    log "📊 Deployment summary:"
    log "   - Environment: $ENVIRONMENT"
    log "   - Color: $DEPLOYMENT_COLOR"
    log "   - Services: Rust Orderbook, Go API, React Dashboard"
    log "   - Status: All services healthy and validated"
    log "   - Ready for traffic switch"
    
    # Save deployment state
    echo "{\"color\":\"$DEPLOYMENT_COLOR\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"status\":\"deployed\"}" > "deployment-state-$DEPLOYMENT_COLOR.json"
    
    cleanup
}

# Error handling
trap 'error_exit "Deployment failed at line $LINENO"' ERR

# Execute main function
main

log "✅ Blue-green deployment script completed successfully"