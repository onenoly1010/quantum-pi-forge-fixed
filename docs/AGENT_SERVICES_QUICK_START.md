# 🚀 Agent Services Integration - Quick Start Guide

## Overview

The Quantum Pi Forge now includes integrated monitoring for the agent service ecosystem. This guide helps you get started with the new integration features.

## What's New

### 1. Agent Status Widget (Dashboard)

**Location:** Integrated into `/dashboard`  
**Purpose:** Real-time monitoring of agent service health  
**Features:**
- Visual status indicators (green=healthy, red=unhealthy)
- Response time tracking
- Auto-refresh every 30 seconds
- Manual refresh button
- Detailed tooltips with service info

### 2. Agent Health API

**Endpoint:** `GET /api/agent-health`  
**Purpose:** Aggregate health check for all agent services  
**Response Time:** < 5 seconds (configurable)  
**Cache:** 30 seconds (configurable)

### 3. Documentation

**Location:** `/docs/ECOSYSTEM_ARCHITECTURE.md`  
**Size:** 23KB comprehensive guide  
**Contents:**
- System architecture
- Integration patterns
- API contracts
- Environment setup
- Security guidelines
- Deployment strategies

## Quick Setup

### Step 1: Environment Variables (Optional)

Add to `.env.local` (or Vercel environment variables):

```bash
# Agent Service URLs (optional - defaults to localhost)
FASTAPI_URL=http://localhost:8000
FLASK_URL=http://localhost:5000
GRADIO_URL=http://localhost:7860

# Health check timeout in milliseconds
HEALTH_CHECK_TIMEOUT=5000

# Feature flags (set to false to disable)
ENABLE_AGENT_SERVICES=true
ENABLE_AGENT_STATUS_WIDGET=true
```

**Note:** If you don't set these variables, the widget will still work and show services as unavailable (expected behavior).

### Step 2: Verify Installation

```bash
# Build the application
npm run build

# Start development server
npm run dev

# Open dashboard
open http://localhost:3000/dashboard
```

### Step 3: Test Agent Health API

```bash
# Check agent service health
curl http://localhost:3000/api/agent-health | jq .

# Expected response (when services are unavailable):
{
  "timestamp": "2026-01-04T17:02:05.104Z",
  "overallStatus": "unavailable",
  "services": {
    "fastapi": {
      "name": "FastAPI Quantum Conduit",
      "status": "unhealthy",
      "url": "http://localhost:8000",
      "responseTime": 39,
      "lastChecked": "2026-01-04T17:02:05.094Z",
      "error": "fetch failed"
    },
    ...
  }
}
```

## Running Agent Services

### Option 1: Run Services Locally

If you have the agent service repositories:

```bash
# Terminal 1: FastAPI Service
cd quantum-resonance-clean
python -m uvicorn main:app --port 8000

# Terminal 2: Flask Service
cd flask-glyph-weaver
python app.py

# Terminal 3: Gradio Service
cd gradio-truth-mirror
python app.py
```

### Option 2: Use Production URLs

Set environment variables to point to deployed services:

```bash
FASTAPI_URL=https://your-fastapi-service.onrender.com
FLASK_URL=https://your-flask-service.railway.app
GRADIO_URL=https://your-gradio-service.huggingface.space
```

### Option 3: Disable Agent Services

If you don't need agent services, just don't set the URLs. The main dApp will work perfectly fine without them.

```bash
# In .env.local
ENABLE_AGENT_SERVICES=false
ENABLE_AGENT_STATUS_WIDGET=false
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│          Dashboard UI                    │
│   - AgentStatusWidget component         │
└─────────────┬───────────────────────────┘
              │ Fetches every 30s
              ▼
┌─────────────────────────────────────────┐
│     /api/agent-health API Route         │
│   - Parallel health checks              │
│   - Timeout handling (5s)               │
│   - Response aggregation                │
└─────┬───────────┬───────────┬───────────┘
      │           │           │
      ▼           ▼           ▼
   FastAPI     Flask      Gradio
   Port 8000   Port 5000  Port 7860
```

### Graceful Degradation

The system is designed to work even when agent services are unavailable:

1. **Core Features Work**: Staking, wallet connection, and balance display are unaffected
2. **Visual Feedback**: Widget shows clear "unavailable" status
3. **No Breaking Errors**: Failed health checks don't break the application
4. **Progressive Enhancement**: Services add features when available, but aren't required

## Troubleshooting

### Widget Shows "Loading" Forever

**Cause:** API endpoint not responding  
**Solution:**
1. Check that Next.js dev server is running
2. Try accessing `/api/agent-health` directly in browser
3. Check browser console for errors

### All Services Show "Unhealthy"

**Cause:** Services are not running (expected in development)  
**Solution:**
1. This is normal if you haven't started the agent services
2. To test with healthy services, start them locally
3. Or configure production URLs in environment variables

### Build Fails

**Cause:** Missing dependencies or configuration issues  
**Solution:**
```bash
# Clear build cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Widget Not Showing

**Cause:** Feature flag disabled or import issue  
**Solution:**
1. Check `ENABLE_AGENT_STATUS_WIDGET=true` in `.env.local`
2. Verify Dashboard component imports AgentStatusWidget
3. Check browser console for import errors

## Configuration Options

### Timeout Configuration

Adjust health check timeout for slow networks:

```bash
# Development (faster feedback)
HEALTH_CHECK_TIMEOUT=5000

# Production (more reliable)
HEALTH_CHECK_TIMEOUT=10000
```

### Cache Configuration

Modify cache headers in `/app/api/agent-health/route.ts`:

```typescript
return NextResponse.json(response, {
  headers: {
    // Adjust cache duration (currently 30s)
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  },
});
```

### Widget Refresh Interval

Modify refresh interval in `AgentStatusWidget.tsx`:

```typescript
// Change from 30000ms (30s) to desired interval
const { data, isLoading, error } = useAgentHealth(60000); // 60 seconds
```

## API Reference

### GET /api/agent-health

**Response Schema:**

```typescript
interface AgentHealthResponse {
  timestamp: string;              // ISO 8601 timestamp
  overallStatus: string;          // "healthy" | "degraded" | "unavailable"
  services: {
    fastapi: ServiceHealth;
    flask: ServiceHealth;
    gradio: ServiceHealth;
  };
}

interface ServiceHealth {
  name: string;                   // Human-readable service name
  status: string;                 // "healthy" | "unhealthy" | "unknown"
  url: string;                    // Service URL
  responseTime?: number;          // Milliseconds (optional)
  lastChecked: string;            // ISO 8601 timestamp
  error?: string;                 // Error message (optional)
}
```

**Status Codes:**
- `200 OK` - Health check successful (services may still be unhealthy)
- `503 Service Unavailable` - Health check system failed

**Cache Headers:**
- `Cache-Control: public, s-maxage=30, stale-while-revalidate=60`

## Best Practices

### Development

1. **Don't Commit Secrets**: Never commit service URLs with credentials
2. **Use Localhost**: Default URLs point to localhost for development
3. **Mock Services**: Create mock health endpoints for testing
4. **Check Logs**: Monitor browser console for health check errors

### Production

1. **Set Real URLs**: Configure production service URLs in Vercel
2. **Increase Timeout**: Use 10-15 second timeout for production
3. **Monitor Health**: Set up alerts for degraded status
4. **Cache Appropriately**: Adjust cache duration based on traffic

### Security

1. **No Authentication Yet**: Health endpoints are public (by design)
2. **Rate Limiting**: Consider adding rate limiting in production
3. **CORS Policy**: Configure CORS on agent services if needed
4. **Network Isolation**: Use VPC or private networks for agent services

## Next Steps

### Immediate Actions

1. ✅ Review `/docs/ECOSYSTEM_ARCHITECTURE.md`
2. ✅ Test health check API locally
3. ✅ Verify widget rendering in dashboard
4. ✅ Set production environment variables

### Future Enhancements

1. **Authentication**: Add JWT tokens for service-to-service calls
2. **Rate Limiting**: Implement per-IP rate limiting
3. **Circuit Breaker**: Auto-disable unhealthy services
4. **Advanced Metrics**: Track uptime, error rates, latency
5. **Alerting**: Slack/Discord notifications for service failures

### Optional Integrations

1. **Service Discovery**: Dynamic service registration
2. **Load Balancing**: Multiple instances per service
3. **A/B Testing**: Route to different service versions
4. **Blue-Green Deploys**: Zero-downtime service updates

## Support

### Documentation

- **Architecture**: `/docs/ECOSYSTEM_ARCHITECTURE.md`
- **Runbook**: `/docs/AI_AGENT_RUNBOOK.md`
- **Quick Ref**: `/RUNBOOK_QUICK_REF.md`

### Getting Help

1. Check documentation files above
2. Review browser console for errors
3. Test API endpoint directly with `curl`
4. Open GitHub issue with `integration` label

### Contributing

Found a bug or have an enhancement idea?

1. Open an issue with clear description
2. Include steps to reproduce (for bugs)
3. Propose solution (for enhancements)
4. Tag with appropriate labels

---

**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Last Updated:** 2026-01-04  
**Maintainer:** Quantum Pi Forge Core Team
