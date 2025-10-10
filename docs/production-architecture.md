# Production Architecture

This document describes the production-ready architecture of the Dream system.

## Overview

Dream is a cloud-native, microservices-based AI agent system designed for high availability, security, and observability.

## Components

### Services

1. **Frontend** (Port 3000)
   - React SPA served via static file server
   - Communicates with Backend via REST API
   - Production: 2+ replicas, LoadBalancer service

2. **Backend** (Port 8080)
   - Express.js API server
   - Coordinates requests between services
   - Manages application state in SQLite
   - Production: 2+ replicas, ClusterIP service

3. **Planner** (Port 8090)
   - NLP/AI service for intent analysis
   - Code generation from natural language
   - Stateless, horizontally scalable
   - Production: 2+ replicas, ClusterIP service

4. **Sandbox** (Port 8070)
   - Isolated runtime environment
   - Executes generated applications securely
   - Resource-limited containers
   - Production: 2+ replicas, ClusterIP service

### Supporting Packages

5. **Contracts** (`packages/contracts`)
   - Protobuf service definitions
   - Type-safe API contracts
   - Generated TypeScript/Python code

6. **Observability** (`packages/observability`)
   - OpenTelemetry instrumentation
   - Prometheus metrics collection
   - Shared tracing utilities

## Infrastructure

### Containerization

Each service has a production-optimized Dockerfile:
- Based on `node:20-alpine` for minimal size
- Multi-stage builds for frontend
- Non-root user execution
- Health checks included
- Read-only root filesystem where possible

### Local Development

Docker Compose orchestration (`dev/compose/docker-compose.yml`):
- Service dependency management
- Health check coordination
- Volume mounts for development
- Network isolation with `dream-dev` network

### Kubernetes Deployment

Production manifests in `deploy/k8s/base/`:

**Security:**
- Pod Security Standards: `restricted` policy
- Network Policies: default deny, explicit allow
- Security contexts on all pods
- Non-root containers, dropped capabilities
- Seccomp profiles enforced

**High Availability:**
- 2+ replicas per service
- Readiness and liveness probes
- Resource requests and limits
- Rolling update strategy

**Observability:**
- Metrics endpoints on all backend services
- Structured logging
- Distributed tracing with OpenTelemetry

## Data Flow

```
User Request
    ↓
Frontend (React SPA)
    ↓ REST API
Backend (Express)
    ↓ Internal APIs
┌───┴────┬─────────┐
Planner  Sandbox   DB
  ↓         ↓       ↓
 AI      Runtime  State
```

## Security Model

### Network Security

1. **Network Policies** (Kubernetes)
   - Default deny all traffic
   - Explicit allow rules per service
   - DNS access for all pods
   - External API access for Planner only

2. **Service Communication**
   - Backend ← Frontend (REST)
   - Planner ← Backend (internal)
   - Sandbox ← Backend (internal)
   - No direct frontend-to-planner/sandbox communication

### Container Security

1. **Image Security**
   - Alpine-based minimal images
   - No shell utilities unless required
   - Trivy scanning in CI

2. **Runtime Security**
   - Non-root users (UID 1000)
   - Read-only root filesystem (where possible)
   - No privilege escalation
   - All capabilities dropped
   - Seccomp profiles applied

### Application Security

1. **Input Validation**
   - express-validator on all endpoints
   - Rate limiting on write operations
   - CORS configured per environment

2. **Resource Limits**
   - CPU and memory limits on containers
   - Request timeouts
   - Connection pooling

## Observability

### Metrics

Prometheus metrics exposed on `/metrics`:
- `http_requests_total`: Request counter with labels
- `http_request_duration_seconds`: Request latency
- Node.js default metrics (memory, GC, event loop)

Integration:
```typescript
import { startTelemetry, metricsRegistry } from '@dream/observability';

startTelemetry('backend');

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});
```

### Tracing

OpenTelemetry instrumentation:
- HTTP request/response tracing
- Express middleware tracing
- Service-to-service correlation

### Logging

Structured logging to stdout:
- JSON format for production
- Correlation IDs for request tracking
- Error stack traces

## CI/CD Pipeline

### Build Stage
1. Checkout code
2. Install dependencies
3. Lint code
4. Type check (TypeScript compilation)
5. Run unit tests

### Integration Stage
1. Build Docker images
2. Start services with docker-compose
3. Wait for health checks
4. Test service endpoints
5. Verify metrics endpoints

### Security Stage
1. Trivy vulnerability scanning
2. Upload SARIF to GitHub Security
3. Fail on HIGH/CRITICAL vulnerabilities

## Deployment Strategies

### Development
- Docker Compose on developer machines
- Hot reload with volume mounts
- Direct port exposure

### Staging
- Kubernetes cluster (similar to production)
- Separate namespace
- Integration testing

### Production
- Kubernetes cluster with HA
- Multiple availability zones
- Blue-green or rolling deployments
- Resource quotas and limits
- Monitoring and alerting

## Scaling Considerations

### Horizontal Scaling
- Frontend: Stateless, scales easily
- Backend: Stateless, scales with load balancer
- Planner: Stateless, CPU-bound, scales well
- Sandbox: Stateful per execution, needs resource monitoring

### Vertical Scaling
- Backend: Increase memory for larger request payloads
- Planner: Increase CPU for faster code generation
- Sandbox: Increase memory/CPU for running more complex apps

### Auto-scaling
```bash
kubectl autoscale deployment backend -n dream \
  --cpu-percent=80 --min=2 --max=10
```

## Disaster Recovery

### Backup Strategy
- Database: Regular SQLite file backups
- Configuration: GitOps - all config in Git
- Secrets: External secret management (Vault, etc.)

### Recovery Procedures
1. Restore configuration from Git
2. Restore database from backup
3. Re-deploy with `kubectl apply`
4. Verify health checks

## Monitoring Checklist

- [ ] All services have health endpoints
- [ ] Metrics are being collected
- [ ] Logs are aggregated
- [ ] Alerts are configured
- [ ] Dashboards are created
- [ ] SLOs are defined
- [ ] On-call rotation is set up

## Future Enhancements

1. **Service Mesh** (Istio/Linkerd)
   - Mutual TLS between services
   - Advanced traffic management
   - Better observability

2. **API Gateway**
   - Rate limiting
   - Authentication
   - API versioning

3. **Database Migration**
   - Move from SQLite to PostgreSQL
   - Multi-region replication
   - Connection pooling

4. **Caching Layer**
   - Redis for session storage
   - Cache generated code
   - Rate limiting with Redis

5. **Message Queue**
   - Async job processing
   - Event-driven architecture
   - Better scalability
