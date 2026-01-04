# 🌐 Quantum Pi Forge Ecosystem Architecture

**Version:** 1.0.0  
**Last Updated:** 2026-01-04  
**Status:** ✅ Active

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Boundaries](#component-boundaries)
4. [Integration Patterns](#integration-patterns)
5. [API Contracts](#api-contracts)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Observability](#monitoring--observability)
8. [Security & Authentication](#security--authentication)
9. [Deployment Architecture](#deployment-architecture)
10. [Graceful Degradation](#graceful-degradation)
11. [Future Enhancements](#future-enhancements)

---

## Overview

The Quantum Pi Forge (OINIO Soul System) is a **polyrepo constellation** consisting of multiple autonomous services that work together to create a comprehensive decentralized application ecosystem. Each component maintains clear boundaries while enabling seamless interoperability through well-defined API contracts.

### Core Philosophy: Canon of Autonomy

- **Clear Boundaries**: Each service has explicit responsibilities and interfaces
- **No Hidden Coupling**: All dependencies are explicit and documented
- **Autonomy First**: Services can operate independently
- **Opt-In Integration**: All integrations are optional and progressive
- **Observable**: All interactions are logged and monitorable
- **Graceful Degradation**: Services degrade gracefully when dependencies are unavailable

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER EXPERIENCE LAYER                         │
│                                                                       │
│  ┌──────────────────────┐         ┌─────────────────────────┐      │
│  │   Next.js Dashboard  │◄────────│   MetaMask Wallet       │      │
│  │   (Vercel Deploy)    │         │   (Browser Extension)   │      │
│  │                      │         └─────────────────────────┘      │
│  │  - Staking UI        │                                           │
│  │  - Leaderboard       │         ┌─────────────────────────┐      │
│  │  - Agent Status      │◄────────│   Pi Network Browser    │      │
│  │  - Legacy Onboarding │         │   (Mobile App)          │      │
│  └──────────────────────┘         └─────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INTERNAL API LAYER                              │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │  /api/sponsor-       │    │  /api/agent-health   │              │
│  │  transaction         │    │  (Health Aggregator) │              │
│  │  (Gasless Staking)   │    └──────────────────────┘              │
│  └──────────────────────┘                                            │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │  /api/leaderboard    │    │  /api/health         │              │
│  │  (User Rankings)     │    │  (App Health)        │              │
│  └──────────────────────┘    └──────────────────────┘              │
└───────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENT SERVICE LAYER                               │
│                    (External Microservices)                          │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │  FastAPI Service     │    │  Flask Service       │              │
│  │  Quantum Conduit     │    │  Glyph Weaver        │              │
│  │  Port: 8000          │    │  Port: 5000          │              │
│  │                      │    │                      │              │
│  │  - /health           │    │  - /health           │              │
│  │  - /fastapi/*        │    │  - /flask/*          │              │
│  └──────────────────────┘    └──────────────────────┘              │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │  Gradio Service      │    │  Future Services     │              │
│  │  Truth Mirror        │    │  (Extensible)        │              │
│  │  Port: 7860          │    │                      │              │
│  │                      │    │  - NFT Minting       │              │
│  │  - / (root)          │    │  - Oracle Services   │              │
│  │  - /gradio/*         │    │  - Analytics         │              │
│  └──────────────────────┘    └──────────────────────┘              │
└───────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN LAYER                                 │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │  Polygon Mainnet     │    │  0G Aristotle        │              │
│  │  Chain ID: 137       │    │  Chain ID: 16661     │              │
│  │                      │    │                      │              │
│  │  - Gasless Txs       │    │  - OINIO Token       │              │
│  │  - OINIO Token       │    │  - DEX Contracts     │              │
│  └──────────────────────┘    └──────────────────────┘              │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### Primary dApp: `quantum-pi-forge-fixed`

**Repository:** `onenoly1010/quantum-pi-forge-fixed`  
**Technology:** Next.js 14 (App Router), TypeScript, React 18  
**Deployment:** Vercel  
**Purpose:** User-facing dashboard and Web3 interface

**Responsibilities:**
- Wallet connection and management (MetaMask)
- Gasless staking UI
- Leaderboard display
- Legacy onboarding flow
- Agent service status monitoring (NEW)
- Client-side Web3 interactions

**Boundaries:**
- Does NOT implement business logic for agent services
- Does NOT directly manage agent service deployments
- Does NOT store sensitive agent service credentials
- CAN gracefully operate without agent services
- SHOULD monitor and display agent service health

**Dependencies:**
- Ethereum JSON-RPC providers (Polygon, 0G)
- MetaMask browser extension
- Optional: Agent services (FastAPI, Flask, Gradio)

---

### Agent Service: `quantum-resonance-clean` (FastAPI)

**Repository:** `onenoly1010/quantum-resonance-clean` (example)  
**Technology:** FastAPI (Python), async/await  
**Port:** 8000  
**Purpose:** Quantum resonance calculations and agent coordination

**Responsibilities:**
- Provide quantum frequency calculations (1010 Hz)
- Coordinate multi-agent workflows
- Expose RESTful API endpoints
- Health monitoring via `/health` endpoint

**Boundaries:**
- Operates independently of main dApp
- No direct blockchain interactions (unless explicitly designed)
- Does NOT have access to main dApp secrets
- CAN be deployed separately and scaled independently

**API Contract:**
```typescript
GET /health
Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2026-01-04T16:52:57Z",
  "version": "1.0.0"
}

GET /fastapi/*
Application-specific endpoints
```

---

### Agent Service: Flask Glyph Weaver

**Technology:** Flask (Python)  
**Port:** 5000  
**Purpose:** Legacy glyph processing and symbolic computation

**Responsibilities:**
- Process sacred geometry calculations
- Generate glyph visualizations
- Provide synchronous request/response APIs

**Boundaries:**
- Independent deployment lifecycle
- Optional integration with main dApp
- Own database/storage if needed

**API Contract:**
```typescript
GET /health
Response: 200 OK
{
  "status": "healthy",
  "service": "flask-glyph-weaver"
}

POST /flask/*
Application-specific endpoints
```

---

### Agent Service: Gradio Truth Mirror

**Technology:** Gradio (Python)  
**Port:** 7860  
**Purpose:** Interactive AI/ML interfaces

**Responsibilities:**
- Provide Gradio web interfaces
- ML model hosting
- Interactive demos

**Boundaries:**
- Typically accessed via iframe or direct link
- Does NOT follow REST conventions (Gradio-specific)
- Health check on root path `/`

**API Contract:**
```typescript
GET /
Response: 200 OK (HTML interface)

GET /gradio/*
Gradio-specific routes
```

---

## Integration Patterns

### Pattern 1: Health Check Aggregation

The main dApp periodically polls agent services to determine availability.

**Flow:**
1. Dashboard component mounts
2. `AgentStatusWidget` initiates health checks
3. Call internal API: `GET /api/agent-health`
4. API route fans out to all configured agent services
5. Aggregate results and return status
6. Widget displays visual indicators

**Benefits:**
- Central visibility into agent ecosystem
- No direct client-to-agent calls (security)
- Timeout handling at API layer
- Cached results for performance

**Implementation:**
```typescript
// Client Component
const { data, isLoading, error } = useAgentHealth();

// API Route
export async function GET() {
  const services = await checkAllServices();
  return Response.json(services);
}
```

---

### Pattern 2: Optional Progressive Enhancement

Agent services enhance functionality but are NOT required for core features.

**Example: Staking**
- **Without Agents:** User can still stake via gasless transactions
- **With Agents:** Additional quantum frequency validation and resonance calculations

**Implementation:**
```typescript
async function stakeWithOptionalAgents(amount: number) {
  // Core staking (always works)
  const txHash = await sponsorTransaction(amount);
  
  // Optional enhancement (graceful failure)
  try {
    const resonance = await fetch(`${FASTAPI_URL}/calculate-resonance`, {
      method: 'POST',
      body: JSON.stringify({ amount, txHash })
    });
    // Enhance UX with resonance data
  } catch (error) {
    // Silent failure, core functionality unaffected
    console.warn('Agent service unavailable:', error);
  }
  
  return txHash;
}
```

---

### Pattern 3: Service Registration & Discovery

Future enhancement: Dynamic service registration.

**Concept:**
```typescript
interface AgentService {
  name: string;
  url: string;
  healthEndpoint: string;
  capabilities: string[];
  priority: number;
}

// Registry stored in environment or database
const serviceRegistry: AgentService[] = [
  {
    name: "FastAPI Quantum Conduit",
    url: process.env.FASTAPI_URL || "http://localhost:8000",
    healthEndpoint: "/health",
    capabilities: ["quantum-calc", "resonance"],
    priority: 1
  },
  // ... more services
];
```

---

## API Contracts

### Internal API: `/api/agent-health`

**Method:** `GET`  
**Purpose:** Aggregate health status of all agent services  
**Authentication:** None (public)  
**Rate Limit:** 1 request per 10 seconds per IP (recommended)

**Response Schema:**
```typescript
interface AgentHealthResponse {
  timestamp: string; // ISO 8601
  overallStatus: "healthy" | "degraded" | "unavailable";
  services: {
    fastapi: ServiceHealth;
    flask: ServiceHealth;
    gradio: ServiceHealth;
  };
}

interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  url: string;
  responseTime?: number; // milliseconds
  lastChecked: string; // ISO 8601
  error?: string;
}
```

**Example Response:**
```json
{
  "timestamp": "2026-01-04T16:52:57Z",
  "overallStatus": "healthy",
  "services": {
    "fastapi": {
      "name": "FastAPI Quantum Conduit",
      "status": "healthy",
      "url": "http://localhost:8000",
      "responseTime": 45,
      "lastChecked": "2026-01-04T16:52:57Z"
    },
    "flask": {
      "name": "Flask Glyph Weaver",
      "status": "unhealthy",
      "url": "http://localhost:5000",
      "lastChecked": "2026-01-04T16:52:50Z",
      "error": "Connection timeout"
    },
    "gradio": {
      "name": "Gradio Truth Mirror",
      "status": "healthy",
      "url": "http://localhost:7860",
      "responseTime": 120,
      "lastChecked": "2026-01-04T16:52:57Z"
    }
  }
}
```

---

### Agent Service Standard: Health Endpoint

All agent services MUST implement a health check endpoint.

**Standard:**
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-04T16:52:57Z",
  "version": "1.0.0",
  "service": "service-name"
}
```

**Status Codes:**
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy (still responds)
- No response / timeout: Service is down

---

## Environment Configuration

### Main dApp Environment Variables

**Required for Core Functionality:**
```bash
# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
ZERO_G_RPC_URL=https://evmrpc.0g.ai
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7

# Sponsor Wallet (for gasless transactions)
SPONSOR_PRIVATE_KEY=<private-key>
```

**Optional for Agent Services:**
```bash
# Agent Service URLs (defaults to localhost for development)
FASTAPI_URL=http://localhost:8000
FLASK_URL=http://localhost:5000
GRADIO_URL=http://localhost:7860

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=5
AGENT_HEALTH_CACHE_TTL=30

# Feature Flags
ENABLE_AGENT_SERVICES=true
ENABLE_AGENT_STATUS_WIDGET=true
```

**Production Example (Vercel):**
```bash
# Agent Service URLs (production deployments)
FASTAPI_URL=https://fastapi-quantum-conduit.onrender.com
FLASK_URL=https://flask-glyph-weaver.railway.app
GRADIO_URL=https://gradio-truth-mirror.huggingface.space

# Optimized for production
HEALTH_CHECK_TIMEOUT=10
AGENT_HEALTH_CACHE_TTL=60
```

---

### Agent Service Environment Variables

Each agent service maintains its own configuration.

**Example: FastAPI Service**
```bash
# Service Configuration
SERVICE_NAME=fastapi-quantum-conduit
SERVICE_VERSION=1.0.0
PORT=8000

# Optional: Main dApp Integration
MAIN_DAPP_URL=https://quantum-pi-forge-fixed.vercel.app
CORS_ORIGINS=https://quantum-pi-forge-fixed.vercel.app,http://localhost:3000

# Optional: Blockchain (if needed)
POLYGON_RPC_URL=https://polygon-rpc.com
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
```

---

## Monitoring & Observability

### Health Check Strategy

**Frequency:**
- Dashboard: Every 30 seconds (configurable)
- Workflow: Every 6 hours (ai-agent-handoff-runbook.yml)
- On-Demand: Via manual API calls

**Timeout Policy:**
- Default: 5 seconds
- Production: 10 seconds
- Slow services: 15 seconds (configurable per service)

**Failure Handling:**
```typescript
const RETRY_POLICY = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  backoffMultiplier: 2,
  maxDelay: 10000 // ms
};
```

---

### Logging Standards

All agent services should log:
```json
{
  "timestamp": "2026-01-04T16:52:57Z",
  "level": "info",
  "service": "fastapi-quantum-conduit",
  "event": "health_check_received",
  "metadata": {
    "source_ip": "192.168.1.1",
    "user_agent": "Next.js-API/1.0"
  }
}
```

---

### Metrics Collection

**Recommended Metrics:**
- Request count per endpoint
- Response time (p50, p95, p99)
- Error rate
- Service uptime
- Health check success rate

**Tools:**
- Application: Built-in logging
- Infrastructure: Vercel Analytics, Railway Metrics
- APM: (Future) Datadog, New Relic, Sentry

---

## Security & Authentication

### Current State: No Authentication

**Rationale:**
- Services are internal/trusted
- Public health endpoints pose no security risk
- Simplified development and deployment

**Risk Assessment:**
- ✅ Health endpoints: Public is acceptable
- ⚠️ Agent services: Should be network-isolated or rate-limited
- 🔴 Sensitive operations: Must implement authentication

---

### Future: JWT-Based Authentication

**When to Implement:**
- Agent services handle sensitive data
- Public internet exposure
- Rate limiting requirements
- Multi-tenant scenarios

**Proposed Pattern:**
```typescript
// API Route
const token = await generateJWT({ service: 'main-dapp' });

// Agent Service Request
const response = await fetch(`${FASTAPI_URL}/protected`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**JWT Claims:**
```json
{
  "iss": "quantum-pi-forge-fixed",
  "sub": "main-dapp",
  "aud": "fastapi-quantum-conduit",
  "exp": 1704383577,
  "scope": "read:health write:data"
}
```

---

### Rate Limiting

**Recommended Limits:**
```typescript
const RATE_LIMITS = {
  healthCheck: {
    windowMs: 10000, // 10 seconds
    maxRequests: 1
  },
  agentServices: {
    windowMs: 60000, // 1 minute
    maxRequests: 100
  }
};
```

---

## Deployment Architecture

### Main dApp Deployment (Vercel)

**Platform:** Vercel  
**Build Command:** `npm run build`  
**Output:** Static files + Serverless API routes  
**Domain:** `quantum-pi-forge-fixed.vercel.app`

**Environment:**
- Production: Automatic deploys from `main` branch
- Preview: Automatic deploys from feature branches
- Development: Local (`npm run dev`)

---

### Agent Service Deployments

**Options:**

1. **Render** (recommended for FastAPI/Flask)
   - Docker-based deployment
   - Automatic health checks
   - Free tier available

2. **Railway** (alternative)
   - Git-based deployment
   - Built-in monitoring
   - Pay-as-you-go pricing

3. **Hugging Face Spaces** (for Gradio)
   - Native Gradio support
   - Free GPU access
   - Public by default

4. **Self-Hosted** (advanced)
   - Full control
   - VPS or Kubernetes
   - Requires DevOps expertise

---

### Network Architecture

**Development:**
```
localhost:3000 (Next.js) → localhost:8000 (FastAPI)
                        → localhost:5000 (Flask)
                        → localhost:7860 (Gradio)
```

**Production:**
```
quantum-pi-forge-fixed.vercel.app
    ↓
    → fastapi-quantum-conduit.onrender.com
    → flask-glyph-weaver.railway.app
    → gradio-truth-mirror.huggingface.space
```

---

## Graceful Degradation

### Core Principle

**The main dApp MUST function without agent services.**

### Degradation Strategies

#### 1. Feature Disabling
```typescript
if (!agentServicesAvailable) {
  // Hide advanced features
  showBasicStakingOnly();
  hideResonanceCalculations();
}
```

#### 2. Cached Data
```typescript
const cachedData = localStorage.getItem('lastKnownAgentStatus');
if (!freshData && cachedData) {
  return JSON.parse(cachedData);
}
```

#### 3. Static Fallbacks
```typescript
const DEFAULT_RESONANCE = 1010; // Hz
if (!agentService) {
  return { resonance: DEFAULT_RESONANCE, source: 'default' };
}
```

#### 4. User Notification
```typescript
if (agentStatus === 'unavailable') {
  showToast({
    title: "Limited Functionality",
    description: "Some advanced features are temporarily unavailable.",
    variant: "warning"
  });
}
```

---

### UI Degradation Examples

**Full Functionality (All Services Available):**
```
┌─────────────────────────────────────┐
│  Dashboard                          │
├─────────────────────────────────────┤
│  Balance: 1000 OINIO                │
│  Resonance: 1010 Hz ✅              │
│  Quantum Score: 95.2 ✅             │
│  Agent Services: All Online ✅      │
└─────────────────────────────────────┘
```

**Degraded Mode (Services Unavailable):**
```
┌─────────────────────────────────────┐
│  Dashboard                          │
├─────────────────────────────────────┤
│  Balance: 1000 OINIO                │
│  Resonance: -- (Service Offline)    │
│  Quantum Score: -- (Service Offline)│
│  Agent Services: Offline ⚠️         │
└─────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2: Advanced Integration

- [ ] **Service Mesh**: Implement Istio or Linkerd for service-to-service communication
- [ ] **Event Bus**: Add NATS or RabbitMQ for pub/sub patterns
- [ ] **GraphQL Gateway**: Unified GraphQL API across all services
- [ ] **Circuit Breaker**: Implement Hystrix-style circuit breakers
- [ ] **Distributed Tracing**: OpenTelemetry integration

### Phase 3: Agent Orchestration

- [ ] **Workflow Engine**: Temporal or Airflow for complex agent workflows
- [ ] **Agent Registry**: Dynamic service discovery and registration
- [ ] **Load Balancing**: Multi-instance agent deployments
- [ ] **A/B Testing**: Route traffic to different agent versions
- [ ] **Blue-Green Deployments**: Zero-downtime agent upgrades

### Phase 4: Advanced Observability

- [ ] **Centralized Logging**: ELK Stack or Loki
- [ ] **Metrics Dashboard**: Grafana dashboards
- [ ] **Alerting**: PagerDuty or Opsgenie integration
- [ ] **Performance Monitoring**: Real User Monitoring (RUM)
- [ ] **Cost Tracking**: Cloud cost allocation per service

---

## Appendices

### A. Service URLs Reference

| Service | Development | Production |
|---------|-------------|------------|
| Main dApp | http://localhost:3000 | https://quantum-pi-forge-fixed.vercel.app |
| FastAPI | http://localhost:8000 | https://fastapi-quantum-conduit.onrender.com |
| Flask | http://localhost:5000 | https://flask-glyph-weaver.railway.app |
| Gradio | http://localhost:7860 | https://gradio-truth-mirror.huggingface.space |

### B. API Endpoint Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/health` | GET | Main app health | No |
| `/api/agent-health` | GET | Agent service health | No |
| `/api/sponsor-transaction` | POST | Gasless staking | No |
| `/api/leaderboard` | GET | User rankings | No |

### C. Environment Variable Checklist

**Main dApp (Required):**
- [ ] `POLYGON_RPC_URL`
- [ ] `OINIO_TOKEN_ADDRESS`
- [ ] `SPONSOR_PRIVATE_KEY`

**Main dApp (Optional):**
- [ ] `FASTAPI_URL`
- [ ] `FLASK_URL`
- [ ] `GRADIO_URL`
- [ ] `HEALTH_CHECK_TIMEOUT`
- [ ] `ENABLE_AGENT_SERVICES`

### D. Troubleshooting Guide

**Problem:** Agent services always show as unavailable

**Solutions:**
1. Check service URLs in environment variables
2. Verify services are running (`docker ps` or platform dashboard)
3. Test health endpoints directly with `curl`
4. Check CORS configuration on agent services
5. Increase `HEALTH_CHECK_TIMEOUT`

---

**Problem:** CORS errors when calling agent services

**Solutions:**
1. Add main dApp URL to agent service CORS whitelist
2. Use API route as proxy (recommended)
3. For development, use `CORS_ORIGINS=*` (not for production)

---

**Problem:** Slow health checks

**Solutions:**
1. Implement caching with TTL
2. Use async/parallel health checks
3. Increase timeout values
4. Consider using background workers

---

## Conclusion

This architecture enables the Quantum Pi Forge ecosystem to grow organically while maintaining:

✅ **Autonomy**: Each service is independent  
✅ **Observability**: Full visibility into system health  
✅ **Resilience**: Graceful degradation when services fail  
✅ **Extensibility**: Easy to add new agent services  
✅ **Security**: Clear boundaries and authentication patterns  

The implementation follows the **Canon of Autonomy**, ensuring that every integration is opt-in, loosely coupled, and observable. The main dApp provides core functionality independently while enabling rich enhancements through the agent service ecosystem.

---

**Document Maintained By:** Quantum Pi Forge Core Team  
**Review Cycle:** Quarterly or on major architecture changes  
**Feedback:** Open an issue with label `architecture`
