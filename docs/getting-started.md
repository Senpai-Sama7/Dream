# Getting Started with Production Dream

This guide will help you get Dream up and running in various environments.

## Quick Start

### Option 1: Traditional Development (Recommended for Contributors)

```bash
# Clone the repository
git clone https://github.com/Senpai-Sama7/Dream.git
cd Dream

# Install dependencies
npm install

# Start all services
npm run dev
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Planner: http://localhost:8001
- Sandbox: http://localhost:8002

### Option 2: Docker Compose (Recommended for Local Testing)

```bash
# Start all services
docker compose -f dev/compose/docker-compose.yml up -d

# Check health
curl http://localhost:8080/api/health
curl http://localhost:8090/health
curl http://localhost:8070/health

# View logs
docker compose -f dev/compose/docker-compose.yml logs -f

# Stop services
docker compose -f dev/compose/docker-compose.yml down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Planner: http://localhost:8090
- Sandbox: http://localhost:8070

### Option 3: Kubernetes (Production)

```bash
# Deploy to cluster
kubectl apply -k deploy/k8s/base/

# Check status
kubectl get pods -n dream

# Access services (after port-forward or ingress setup)
kubectl port-forward -n dream svc/frontend 3000:80
```

## Prerequisites

### For Traditional Development
- Node.js 18+
- npm 9+
- Git

### For Docker Compose
- Docker 20+
- Docker Compose 2+

### For Kubernetes
- kubectl CLI
- Access to a Kubernetes cluster (1.21+)
- kustomize (included in kubectl 1.14+)

## Configuration

### Environment Variables

Copy `.env.example` to `.env.dev` and customize:

```bash
cp .env.example .env.dev
```

Key variables:
- `PORT`: Service port (varies by service)
- `PLANNER_URL`: Planner service URL
- `SANDBOX_URL`: Sandbox service URL
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS allowed origins

### Service Ports

| Service  | Dev Port | Docker Port | K8s Port |
|----------|----------|-------------|----------|
| Frontend | 3000     | 3000        | 80       |
| Backend  | 8000     | 8080        | 8080     |
| Planner  | 8001     | 8090        | 8090     |
| Sandbox  | 8002     | 8070        | 8070     |

## Development Workflow

### 1. Make Changes

Edit code in `packages/*/src/` directories.

### 2. Test Locally

```bash
# Run linters
npm run lint --workspaces

# Run tests
npm run test --workspaces

# Build
npm run build --workspaces
```

### 3. Test with Docker

```bash
# Build and start
docker compose -f dev/compose/docker-compose.yml up -d --build

# Test endpoints
curl http://localhost:8080/api/health
curl http://localhost:8080/metrics
```

### 4. Create Pull Request

Changes are automatically tested by CI:
- Linting
- Type checking
- Unit tests
- Docker Compose integration tests
- Security scanning (Trivy)

## Observability

### Metrics

All backend services expose Prometheus metrics:

```bash
# Backend
curl http://localhost:8080/metrics

# Planner
curl http://localhost:8090/metrics
```

### Logs

View logs in real-time:

```bash
# Docker Compose
docker compose -f dev/compose/docker-compose.yml logs -f backend

# Kubernetes
kubectl logs -n dream -l app=backend -f
```

### Health Checks

Check service health:

```bash
# Backend
curl http://localhost:8080/api/health

# Planner
curl http://localhost:8090/health

# Sandbox
curl http://localhost:8070/health
```

## Contracts (Protobuf)

Generate TypeScript types from protobuf definitions:

```bash
# Install buf CLI (if not already installed)
brew install bufbuild/buf/buf

# Generate code
cd packages/contracts
make gen
```

Generated files will be in `packages/contracts/gen/ts/`.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Docker Build Fails

```bash
# Clean up Docker
docker system prune -af
docker volume prune -f

# Rebuild without cache
docker compose -f dev/compose/docker-compose.yml build --no-cache
```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules packages/*/node_modules
npm install
```

### Kubernetes Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n dream

# Check logs
kubectl logs <pod-name> -n dream

# Check events
kubectl get events -n dream --sort-by='.lastTimestamp'
```

## Common Tasks

### Add a New Service

1. Create package directory: `packages/new-service/`
2. Add `package.json` with scripts
3. Create Dockerfile
4. Add to `dev/compose/docker-compose.yml`
5. Create Kubernetes manifests in `deploy/k8s/base/`
6. Update `kustomization.yaml`

### Update Dependencies

Dependencies are managed by Dependabot. PRs will be created automatically.

Manual update:
```bash
# Update all workspaces
npm update --workspaces

# Update specific package
cd packages/backend
npm update <package-name>
```

### Scale Services

Docker Compose:
```bash
docker compose -f dev/compose/docker-compose.yml up -d --scale backend=3
```

Kubernetes:
```bash
kubectl scale deployment backend -n dream --replicas=3
```

### View Metrics

Set up Prometheus to scrape `/metrics` endpoints:

```yaml
scrape_configs:
  - job_name: 'dream-backend'
    static_configs:
      - targets: ['backend:8080']
  - job_name: 'dream-planner'
    static_configs:
      - targets: ['planner:8090']
```

## Next Steps

- Read [Production Architecture](./docs/production-architecture.md)
- Review [API Contracts](./docs/api-contracts.md)
- Check [Deployment Guide](./docs/deployment.md)
- Explore [Kubernetes README](./deploy/k8s/README.md)

## Getting Help

- Issues: https://github.com/Senpai-Sama7/Dream/issues
- Contributing: See [CONTRIBUTING.md](./CONTRIBUTING.md)
- Documentation: See [docs/](./docs/) directory
