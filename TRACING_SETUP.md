# OpenTelemetry Tracing Configuration

## Overview
Quantum Pi Forge now has comprehensive distributed tracing using OpenTelemetry. This enables monitoring, debugging, and performance analysis across all components.

## Components Traced

### 🔧 Infrastructure
- **OpenTelemetry SDK**: Automatic instrumentation for HTTP requests, database calls
- **AI Toolkit Integration**: Traces are sent to http://localhost:4318 (OTLP HTTP endpoint)
- **Next.js Integration**: Server-side rendering and API routes are automatically traced

### 📊 API Routes
- **`GET /api/health`**: Health check with performance metrics
- **`GET /api/supabase/status`**: Database connectivity tracing
- **`POST /api/payments/*`**: Payment flow tracing
- **`POST /api/pi-webhooks/*`**: Webhook processing tracing

### 🗄️ Database Operations
- **Connection checks**: Traces database connection attempts
- **User queries**: Traces user lookup operations
- **Deployment logging**: Traces deployment record insertions

### 🔗 External API Calls
- **Pi Network API**: Payment creation, completion, status checks
- **Webhook validation**: HMAC signature verification

## Trace Attributes

### Standard Attributes
- `service.name`: quantum-pi-forge
- `service.version`: 2.0.0
- `deployment.environment`: development/production
- `http.method`: GET/POST
- `http.route`: API route path
- `http.status_code`: Response status

### Database Attributes
- `db.system`: postgresql
- `db.operation.name`: select/insert/update
- `db.connection.status`: connected/failed/error
- `user.id`: User identifier (when applicable)

### Pi Network Attributes
- `pi.app_id`: Pi Network application ID
- `pi.payment.id`: Payment identifier
- `pi.payment.amount`: Payment amount
- `pi.payment.status`: Payment status
- `pi.transaction.id`: Transaction ID

## Usage

### Starting Trace Collection
1. Open VS Code
2. Ensure AI Toolkit extension is installed
3. The trace collector was automatically started when you added tracing

### Viewing Traces
1. Traces are automatically sent to AI Toolkit
2. View traces in the AI Toolkit trace viewer
3. Filter by operation, service, or time range

### Development Workflow
```bash
# Start the development server
pnpm dev

# Make API calls to generate traces
curl http://localhost:3000/api/health
curl http://localhost:3000/api/supabase/status

# View traces in AI Toolkit trace viewer
```

## Trace Structure

### Example Health Check Trace
```
api.health.check
├── Span: GET /api/health
├── Event: health.check.start
├── Event: health.check.complete
└── Attributes:
    ├── http.method: GET
    ├── http.route: /api/health
    ├── health.status: healthy
    ├── service.version: 2.0.0
    └── process.uptime: 42.5
```

### Example Database Operation Trace
```
api.supabase.status_check
├── supabase.connection_check
│   ├── Event: database.connection.attempt
│   ├── Event: database.connection.result
│   └── Attributes:
│       ├── db.system: postgresql
│       ├── db.operation.name: select
│       └── db.connection.status: success
└── Attributes:
    ├── http.method: GET
    ├── http.route: /api/supabase/status
    └── db.system: postgresql
```

### Example Pi Network Payment Trace
```
pi_network.payment.create
├── Event: pi.payment.create.start
├── Event: pi.payment.create.success
└── Attributes:
    ├── pi.app_id: your-app-id
    ├── pi.payment.amount: 1.5
    ├── pi.payment.id: payment-123
    ├── http.method: POST
    └── http.status_code: 200
```

## Performance Benefits

### Monitoring
- **Request latency**: Track API response times
- **Database performance**: Monitor query execution time
- **External API calls**: Track Pi Network API response times
- **Error tracking**: Automatic error capture and context

### Debugging
- **Request correlation**: Follow requests across services
- **Error context**: See exact operation that failed
- **Performance bottlenecks**: Identify slow operations
- **Dependency analysis**: Understand service relationships

### Production Readiness
- **Distributed tracing**: Works across multiple services
- **Low overhead**: Minimal performance impact
- **Configurable sampling**: Reduce trace volume in production
- **Standard format**: OpenTelemetry compatible with all observability tools

## Configuration

### Environment Variables
- `OTEL_SERVICE_NAME`: Service name (default: quantum-pi-forge)
- `OTEL_SERVICE_VERSION`: Service version (default: 2.0.0)
- `OTEL_EXPORTER_OTLP_ENDPOINT`: Trace endpoint (default: http://localhost:4318)
- `NODE_ENV`: Environment (development/production)

### Sampling
In production, consider adjusting sampling rates:
```typescript
// In instrumentation.ts
sampler: new TraceIdRatioBasedSampler(0.1), // Sample 10% of traces
```

## Next Steps

1. **Monitor traces**: Watch trace data as you use the application
2. **Add custom spans**: Add more detailed tracing to specific operations
3. **Set up alerts**: Configure alerts for high latency or error rates
4. **Performance optimization**: Use trace data to optimize slow operations

The tracing system is now fully operational and will provide comprehensive visibility into your application's behavior and performance.