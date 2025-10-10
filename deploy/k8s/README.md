# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying Dream to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (1.21+)
- kubectl CLI tool
- kustomize (included in kubectl 1.14+)

## Architecture

The deployment consists of:
- **Namespace**: `dream` with Pod Security Standards enforced
- **Backend**: API server (2 replicas)
- **Planner**: NLP/AI service (2 replicas)
- **Sandbox**: Runtime environment (2 replicas)
- **Frontend**: Web UI (2 replicas)
- **Network Policies**: Default deny with explicit allow rules
- **Pod Security**: Restricted security context for all pods

## Quick Start

### Deploy with kubectl and kustomize

```bash
# Deploy all resources
kubectl apply -k deploy/k8s/base/

# Check deployment status
kubectl get pods -n dream
kubectl get services -n dream

# View logs
kubectl logs -n dream -l app=backend --tail=100
kubectl logs -n dream -l app=planner --tail=100
```

### Validate Before Deploying

```bash
# Dry run to validate manifests
kubectl apply -k deploy/k8s/base/ --dry-run=client

# Server-side validation
kubectl apply -k deploy/k8s/base/ --dry-run=server
```

## Container Images

Update image tags in `kustomization.yaml`:

```yaml
images:
  - name: ghcr.io/senpai-sama7/dream-backend
    newTag: v1.0.0  # Change from 'latest'
```

## Configuration

### Environment Variables

Create a ConfigMap or Secret for environment-specific config:

```bash
kubectl create configmap dream-config \
  --from-literal=NODE_ENV=production \
  --namespace=dream

kubectl create secret generic dream-secrets \
  --from-literal=OPENAI_API_KEY=your_key \
  --namespace=dream
```

Then reference in deployment manifests.

### Resource Limits

Resource requests and limits are defined per service:
- **Backend**: 100m-500m CPU, 256Mi-512Mi RAM
- **Planner**: 100m-500m CPU, 256Mi-512Mi RAM
- **Sandbox**: 200m-1000m CPU, 512Mi-1Gi RAM
- **Frontend**: 50m-200m CPU, 128Mi-256Mi RAM

Adjust in deployment files based on workload.

## Security

### Pod Security Standards

The namespace enforces the `restricted` Pod Security Standard:
- Non-root containers required
- No privilege escalation
- Seccomp profile enforced
- All capabilities dropped

### Network Policies

Default deny all traffic with explicit allow rules:
- Frontend can receive external traffic
- Backend can call planner and sandbox
- Planner can make external API calls (for AI services)
- All pods can perform DNS lookups

### Health Checks

All services have:
- **Readiness probes**: Check if pod is ready to serve traffic
- **Liveness probes**: Restart pod if unhealthy

## Monitoring

### Metrics

Access Prometheus metrics:

```bash
# Port forward to backend
kubectl port-forward -n dream svc/backend 8080:8080

# Access metrics
curl http://localhost:8080/metrics
```

### Logs

```bash
# Stream logs
kubectl logs -n dream -l app=backend -f

# View recent logs
kubectl logs -n dream deployment/backend --tail=100
```

## Scaling

```bash
# Scale backend
kubectl scale deployment backend -n dream --replicas=3

# Autoscaling (HPA)
kubectl autoscale deployment backend -n dream \
  --cpu-percent=80 \
  --min=2 \
  --max=10
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n dream
kubectl describe pod <pod-name> -n dream
```

### Check Events

```bash
kubectl get events -n dream --sort-by='.lastTimestamp'
```

### Shell into Pod

```bash
kubectl exec -it -n dream <pod-name> -- sh
```

### Check Network Policies

```bash
kubectl get networkpolicies -n dream
kubectl describe networkpolicy backend-policy -n dream
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k deploy/k8s/base/

# Or delete namespace (removes everything)
kubectl delete namespace dream
```

## Production Considerations

1. **Use specific image tags** instead of `latest`
2. **Set up Ingress** for external access (currently using LoadBalancer)
3. **Configure persistent storage** for sandbox runtime
4. **Set up monitoring** with Prometheus and Grafana
5. **Configure log aggregation** (ELK, Loki, etc.)
6. **Implement backup strategy** for database
7. **Set up secrets management** (Vault, Sealed Secrets, etc.)
8. **Configure SSL/TLS** certificates
9. **Set resource quotas** for the namespace
10. **Implement pod disruption budgets** for high availability
