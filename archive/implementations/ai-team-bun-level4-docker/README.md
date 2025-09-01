# AI Team – Level 4 (Docker flavor)

This adds **concrete Docker commands** to `deploy-runner` and real calls to `gitleaks`/`trivy` (and optional `semgrep`) in `secops-gates`.

## Deploy-runner (Docker)
- Builds and tags: `${REGISTRY}/${IMAGE}:${TAG}` (TAG defaults to git SHA fallback)
- Pushes to registry
- Canary: runs a new container on a canary port, health-checks `/health` (configurable), then **promotes** by swapping the prod container
- Rollback: stops/removes canary if health fails

### ENV
```
REGISTRY=ghcr.io/your-org
IMAGE=pilot-service
DOCKERFILE=./Dockerfile
CONTEXT=.
PROD_PORT=8080          # existing prod listener
CANARY_PORT=8081
CANARY_TIMEOUT_MS=60000
HEALTH_URL=http://localhost:8081/health
DOCKER_HOST=unix:///var/run/docker.sock
```

## SecOps-gates
- `gitleaks` secrets scan
- `trivy fs` dependency vuln scan
- (optional) `semgrep` SAST if installed

Use these in CI before release orchestration.
