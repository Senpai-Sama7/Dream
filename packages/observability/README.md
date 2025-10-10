# Dream Observability

Shared observability library providing tracing, metrics, and logging for Dream services.

## Features

- OpenTelemetry instrumentation for HTTP and Express
- Prometheus metrics collection
- Request counting with labels
- Default system metrics

## Usage

### Backend/Planner Integration

```typescript
import { startTelemetry, metricsRegistry, requestCounter } from '@dream/observability';

// Start telemetry at app initialization
startTelemetry('backend');

const reqCounter = requestCounter();

// Add metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

// Track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    reqCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode.toString()
    });
  });
  next();
});
```
