# Agent Status Widget Integration Guide

## Overview

The `AgentStatusWidget` component provides real-time health monitoring for AI agent services in the Quantum Pi Forge ecosystem. It displays the operational status of connected agent services directly in the dashboard UI.

## Features

- ✅ **Real-time Health Monitoring**: Polls agent service `/health` endpoints every 30 seconds
- ✅ **Multi-Agent Support**: Designed to monitor multiple agent services simultaneously
- ✅ **Graceful Degradation**: Handles service unavailability with clear error states
- ✅ **Error Boundary**: Prevents widget failures from breaking the dashboard
- ✅ **Responsive Design**: Matches the glassmorphism aesthetic of the main dashboard
- ✅ **Manual Refresh**: Users can manually trigger health checks
- ✅ **Response Time Display**: Shows service response latency for online services

## Installation

The widget is already integrated into the dashboard at `/app/dashboard/components/AgentStatusWidget.tsx`.

## Configuration

### Environment Variables

Configure agent service URLs using environment variables with the `NEXT_PUBLIC_` prefix:

```bash
# FastAPI Quantum Conduit (primary agent service)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

# Additional agent services (optional)
NEXT_PUBLIC_FLASK_URL=http://localhost:5000
NEXT_PUBLIC_GRADIO_URL=http://localhost:7860
```

**Important**: 
- Variables must start with `NEXT_PUBLIC_` to be accessible in client components
- Each service must expose a `/health` endpoint that returns JSON or a 200 OK response
- URLs should not include trailing slashes

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your agent service URLs:
   ```bash
   # .env.local
   NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
   ```

3. Restart the Next.js dev server:
   ```bash
   npm run dev
   ```

### Production Deployment (Vercel)

1. Navigate to your Vercel project settings
2. Go to **Settings** → **Environment Variables**
3. Add each agent service URL:
   - Variable: `NEXT_PUBLIC_FASTAPI_URL`
   - Value: `https://your-fastapi-service.com`
   - Environment: Production, Preview, Development (as needed)
4. Redeploy the application

## Agent Service Requirements

Each agent service must expose a `/health` endpoint:

### Expected Response Format

```json
{
  "status": "healthy",
  "message": "Service is operational"
}
```

**Accepted status values**:
- `"healthy"` or `"ok"` → Widget shows "Online" (green)
- Any other value → Widget shows "Degraded" (amber)
- HTTP error or timeout → Widget shows "Offline" (red)

### Example FastAPI Health Endpoint

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "FastAPI Quantum Conduit operational",
        "version": "1.0.0"
    }
```

### Example Flask Health Endpoint

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Flask Glyph Weaver operational"
    })
```

## Adding Additional Agent Services

To add support for more agent services, follow these steps:

### 1. Add Environment Variable

Update `.env.example`:

```bash
# New agent service
NEXT_PUBLIC_MY_AGENT_URL=http://localhost:9000
```

### 2. Update AgentStatusWidget

Edit `app/dashboard/components/AgentStatusWidget.tsx`:

```typescript
// Around line 267 in the agentServices useMemo
const agentServices: AgentService[] = React.useMemo(() => {
  const services: AgentService[] = [];
  
  // FastAPI Quantum Conduit
  const fastapiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
  if (fastapiUrl) {
    services.push({
      name: 'fastapi',
      url: fastapiUrl,
      displayName: 'Quantum Conduit',
      description: 'FastAPI agent service',
    });
  }

  // Add your new agent service here
  const myAgentUrl = process.env.NEXT_PUBLIC_MY_AGENT_URL;
  if (myAgentUrl) {
    services.push({
      name: 'my-agent',
      url: myAgentUrl,
      displayName: 'My Custom Agent',
      description: 'Custom agent service description',
    });
  }

  return services;
}, []);
```

### 3. Configure and Test

1. Set the environment variable in `.env.local`
2. Restart the dev server
3. Navigate to `/dashboard`
4. Verify the new agent appears in the widget

## Widget Behavior

### Status States

| State | Visual | Meaning |
|-------|--------|---------|
| **Loading** | Amber badge with spinner | Initial health check in progress |
| **Online** | Green badge with checkmark | Service is healthy and responding |
| **Offline** | Red badge with X | Service is unreachable or not responding |
| **Degraded** | Amber badge with warning | Service responded but reported non-healthy status |
| **Error** | Red badge with error icon | Error occurred during health check |

### Polling Behavior

- **Interval**: 30 seconds between health checks
- **Timeout**: 5 seconds per request
- **Retries**: Up to 3 retries with exponential backoff on failures
- **Concurrent**: All services checked simultaneously

### No Services Configured

When no agent service URLs are configured, the widget displays:
- Info icon
- "No agent services configured" message
- Helpful hint about setting `NEXT_PUBLIC_FASTAPI_URL`

### Manual Refresh

Users can click the refresh icon (↻) in the widget header to immediately trigger a health check for all services.

## UI Integration

The widget is integrated into the dashboard between the staking section and info cards:

```tsx
// src/components/Dashboard.tsx
import AgentStatusWidget from '../../app/dashboard/components/AgentStatusWidget';

// Inside the Dashboard component render:
<main className="max-w-7xl mx-auto px-6 pb-20">
  {/* Staking section */}
  
  {/* Agent Status Widget */}
  <div className="mt-6">
    <AgentStatusWidget />
  </div>

  {/* Info Cards */}
</main>
```

## Styling

The widget uses:
- **Glassmorphism design**: Matches the dashboard's visual style
- **shadcn/ui components**: `Card`, `Badge` for consistency
- **Tailwind CSS**: All styling via utility classes
- **Dark theme**: Optimized for the dark dashboard background

## Troubleshooting

### Widget Shows "No agent services configured"

**Cause**: No `NEXT_PUBLIC_*_URL` environment variables are set.

**Solution**: 
1. Add at least one agent service URL to `.env.local`
2. Restart the Next.js dev server
3. Refresh the browser

### Widget Shows "Service unavailable"

**Possible causes**:
- Agent service is not running
- Agent service URL is incorrect
- CORS issues (production only)
- Firewall blocking the request

**Solutions**:
1. Verify the agent service is running: `curl http://localhost:8000/health`
2. Check the environment variable value
3. Verify the service accepts requests from your domain
4. Check browser console for CORS errors

### Widget Stuck on "Checking"

**Cause**: Service is not responding within the 5-second timeout.

**Solutions**:
1. Check if the service is running
2. Verify network connectivity
3. Check service logs for errors
4. Increase timeout in `AgentStatusWidget.tsx` if needed (line 17)

### Build Errors

If you encounter import errors:

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

## Performance Considerations

- **Client-side polling**: Health checks run in the browser
- **Minimal data transfer**: Small JSON payloads (~100 bytes)
- **Non-blocking**: Uses async/await with Promise.all
- **Error resilience**: Failed checks don't crash the widget
- **Memory efficient**: Cleanup on component unmount

## Security Notes

- **Public URLs only**: Use `NEXT_PUBLIC_` prefix for client-accessible URLs
- **No authentication**: Health endpoints should be publicly accessible
- **CORS required**: Production services must allow requests from your domain
- **Rate limiting**: Consider rate limiting health endpoints if exposed publicly

## Future Enhancements

Potential improvements for future versions:

- [ ] Historical uptime tracking
- [ ] Alert notifications for service degradation
- [ ] Custom polling intervals per service
- [ ] WebSocket support for real-time updates
- [ ] Service dependency visualization
- [ ] Detailed metrics (CPU, memory, etc.)
- [ ] Customizable health check paths

## References

- **Main Issue**: #[issue-number] - Build AgentStatusWidget PoC
- **AI Agent Runbook**: `/docs/AI_AGENT_RUNBOOK.md`
- **Runbook Quick Reference**: `/RUNBOOK_QUICK_REF.md`
- **Component Location**: `/app/dashboard/components/AgentStatusWidget.tsx`
- **Environment Config**: `/.env.example`

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check agent service logs
4. Open a GitHub issue with:
   - Widget behavior observed
   - Expected behavior
   - Environment details
   - Console errors (if any)
