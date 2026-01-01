# 🌌 Quantum Pi Forge Ecosystem Architecture

**Version**: 1.0.0  
**Last Updated**: January 1, 2026  
**Status**: ACTIVE  
**Authority**: Canonical reference for multi-repository integration patterns

---

## 📖 Overview

This document maps the Quantum Pi Forge multi-repository constellation, defines integration patterns, and establishes architectural guidelines for the OINIO Soul System ecosystem. It serves as the authoritative reference for understanding how services interact while maintaining autonomy.

### Purpose
- **Define** the topology of services and repositories
- **Document** integration points and data flows
- **Establish** patterns for opt-in service consumption
- **Guide** future development with Canon of Autonomy principles
- **Enable** AI agents and developers to understand the system holistically

---

## 🏗️ System Constellation & Topology

The Quantum Pi Forge ecosystem follows a **polyrepo architecture** where each service maintains autonomy while offering optional integration points. This design ensures services can be deployed, updated, and scaled independently.

### Core Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    QUANTUM PI FORGE ECOSYSTEM                            │
│                    "Sovereign Service Constellation"                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Main dApp       │  │  Agent       │  │  Public      │
        │  quantum-pi-     │  │  Services    │  │  Sites       │
        │  forge-fixed     │  │              │  │              │
        └──────────────────┘  └──────────────┘  └──────────────┘
                │                     │                 │
                ├─ Frontend          ├─ FastAPI        ├─ Marketing
                ├─ Backend           ├─ Ledger API     └─ Documentation
                ├─ API Routes        └─ Health Check
                └─ Smart Contracts
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
        │  NFT Services    │  │  DEX &       │  │  AI Tools    │
        │                  │  │  Contracts   │  │              │
        └──────────────────┘  └──────────────┘  └──────────────┘
                │                     │                 │
                ├─ NFT Agent          ├─ Uniswap V2     ├─ AI Forge
                └─ NFT Contracts      └─ 0G Contracts   └─ Builders
```

---

## 🌟 Repository Constellation

### 1. Main Application: `quantum-pi-forge-fixed`

**Repository**: `onenoly1010/quantum-pi-forge-fixed`  
**Type**: Next.js 14 dApp (App Router)  
**Status**: ✅ ACTIVE & DEPLOYED  
**Purpose**: Gasless staking platform for OINIO token on Polygon

#### Directory Structure
```
quantum-pi-forge-fixed/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── dashboard/         # Dashboard page
│   │   └── page.tsx
│   └── api/               # Next.js API routes
│       ├── health/        # Health check endpoint
│       ├── sponsor-transaction/  # Gasless staking API
│       ├── chat/          # AI chat endpoint
│       └── ai/            # AI utilities
├── backend/               # Express.js backend service
│   ├── src/
│   └── package.json
├── fastapi/               # FastAPI independent agent API
│   ├── main.py
│   ├── middleware/
│   └── requirements.txt
├── contracts/             # Solidity smart contracts
│   ├── 0g-uniswap-v2/    # Uniswap V2 fork
│   └── ShadowAnchor.sol  # Custom contracts
└── scripts/               # Deployment & utility scripts
```

#### Frontend Layer (`/app/`)
- **Technology**: Next.js 14 with React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3**: Ethers.js v6 for blockchain interactions
- **Pages**:
  - `/` - Landing page with project overview
  - `/dashboard` - Main staking interface with MetaMask integration
  - `/evaluation` - System evaluation interface

#### Backend Services
**Express Backend (`/backend/`)**
- **Port**: Configurable (typically 3001)
- **Purpose**: Traditional REST API for additional services
- **Status**: Available but not primary

**FastAPI Service (`/fastapi/`)**
- **Port**: 8000 (default)
- **Purpose**: Independent Python agent API
- **Features**: Rate limiting, health monitoring
- **Status**: ✅ READY

#### API Routes (`/app/api/`)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/health` | GET | System health check | ✅ Active |
| `/api/sponsor-transaction` | POST | Gasless transaction sponsorship | ✅ Active |
| `/api/chat` | POST | AI chat interface | ✅ Active |
| `/api/ai/*` | POST | AI utility endpoints | ✅ Active |

#### Smart Contracts (`/contracts/`)
- **Solidity Versions**: 0.5.16, 0.6.6, 0.8.20
- **Networks**: Polygon Mainnet (137), 0G Aristotle (16661)
- **Key Contracts**:
  - OINIO Token: `0x07f43E5B1A8a0928B364E40d5885f81A543B05C7`
  - Uniswap V2 Router (0G network)
  - Uniswap V2 Factory (0G network)

#### Environment Configuration

**Required Environment Variables**:
```env
# Blockchain / Web3
POLYGON_RPC_URL=https://polygon-rpc.com
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
SPONSOR_PRIVATE_KEY=<sponsor-wallet-private-key>
DEPLOYER_PRIVATE_KEY=<for-hardhat-deployments>
ZERO_G_RPC_URL=https://rpc.0g.ai

# AI / OpenAI
OPENAI_API_KEY=<openai-api-key>
AI_GATEWAY_API_KEY=<optional-vercel-ai-gateway>
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Deployment
- **Platform**: Vercel
- **URL**: https://quantum-pi-forge-fixed.vercel.app
- **Build Command**: `npm run build`
- **CI/CD**: GitHub Actions + Vercel auto-deploy

---

### 2. Core Agent Services: `quantum-resonance-clean`

**Repository**: `quantum-resonance-clean` (external)  
**Type**: FastAPI Python Application  
**Status**: ⚠️ REFERENCED (external deployment)  
**Purpose**: Core agent orchestration and ledger management

#### Service Architecture
```
quantum-resonance-clean/
├── main.py                # FastAPI application entry
├── ledger-api/           # Separate ledger service
│   └── (port 8001)
└── agents/               # AI agent modules
```

#### Main Service (Port 8000)
- **Framework**: FastAPI (Python)
- **Documentation**: http://localhost:8000/docs (Swagger UI)
- **Health Endpoint**: http://localhost:8000/health

**Key Endpoints**:
```
GET  /health              # Service health status
GET  /docs                # Interactive API documentation
POST /agents/*            # Agent execution endpoints
GET  /meta                # Service metadata
```

#### Ledger API Service (Port 8001)

**Purpose**: Transaction and treasury management

**Key Endpoints**:
```
GET  /api/v1/transactions              # Transaction history
POST /api/v1/transactions              # Create transaction
GET  /api/v1/treasury/accounts         # Treasury account list
GET  /api/v1/treasury/balance/{id}     # Account balance
GET  /api/v1/allocation-rules          # Allocation rules
POST /api/v1/allocation-rules          # Create allocation rule
```

#### Environment Requirements
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication
JWT_SECRET_KEY=<jwt-secret>

# Supabase Integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=<supabase-anon-key>
```

#### Integration Pattern
- **Connection**: REST API over HTTP
- **Format**: JSON request/response
- **Authentication**: Optional JWT tokens
- **CORS**: Must allow `NEXT_PUBLIC_APP_URL` origin

---

### 3. Additional Service Modules

#### NFT Agent: `pi-mr-nft-agent`
**Repository**: `pi-mr-nft-agent` (external)  
**Type**: Python NFT Management Service  
**Status**: 🔮 PLANNED  
**Purpose**: NFT minting and management for memorial nodes

**Features**:
- NFT metadata generation
- Model royalty distribution
- Memorial node onboarding
- IPFS integration for metadata storage

#### NFT Contracts: `pi-mr-nft-contracts`
**Repository**: `pi-mr-nft-contracts` (external)  
**Type**: Solidity Smart Contracts  
**Status**: 🔮 PLANNED  
**Purpose**: EVM-compatible NFT contracts

**Key Contracts**:
- `ModelRoyaltyNFT.sol` - NFT with royalty tracking
- `MemorialNode.sol` - Memorial node registration
- Supporting libraries and interfaces

#### Public Site: `quantum-pi-forge-site`
**Repository**: `quantum-pi-forge-site` (external)  
**Type**: Static HTML/CSS/JS Website  
**Status**: ✅ DEPLOYED  
**URL**: https://onenoly1010.github.io/quantum-pi-forge-site/  
**Purpose**: Public-facing marketing and documentation

#### AI Tools: `Ai-forge-`
**Repository**: `Ai-forge-` prefix repositories (external)  
**Type**: JavaScript AI Application Builder  
**Status**: 🔮 EXPERIMENTAL  
**Purpose**: AI-powered development tools

---

## 🔗 Integration Roles & Patterns

The Quantum Pi Forge ecosystem follows the **Canon of Autonomy** - a set of principles ensuring services remain independent while offering optional integration.

### Canon of Autonomy Principles

#### 1. Clear Boundaries Between Services
- Each service has well-defined responsibilities
- No shared database connections (use APIs instead)
- Services communicate only through documented APIs

#### 2. No Hidden Coupling
- All dependencies declared explicitly in environment variables
- Integration points documented in this file
- No implicit service discovery

#### 3. Opt-in Integration
- Main dApp functions without agent services
- Agent services are **progressive enhancements**
- Graceful degradation when services unavailable

#### 4. Loose Coupling
- Changes to one service don't break others
- Versioned APIs with backward compatibility
- Circuit breakers for failing services

#### 5. Observable and Traceable
- All API calls logged and traceable
- Health endpoints on every service
- Monitoring instrumentation (OpenTelemetry)

#### 6. Progressive Enhancement
- Core functionality works without optional services
- UI adapts based on service availability
- Clear user feedback when features unavailable

### Integration Architecture Patterns

#### Pattern 1: Opt-in Service Consumption

```typescript
// Example: Agent service integration with fallback
async function fetchAgentStatus() {
  const agentUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
  
  // Service is optional - return safe default if not configured
  if (!agentUrl) {
    return { available: false, reason: 'not-configured' };
  }
  
  try {
    const response = await fetch(`${agentUrl}/health`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      return { available: false, reason: 'unhealthy' };
    }
    
    return { available: true, data: await response.json() };
  } catch (error) {
    console.warn('Agent service unavailable:', error.message);
    return { available: false, reason: 'connection-failed' };
  }
}
```

#### Pattern 2: Progressive Enhancement UI

```typescript
// Example: Component that adapts based on service availability
export function AgentStatusWidget() {
  const [status, setStatus] = useState({ available: false });
  
  useEffect(() => {
    fetchAgentStatus().then(setStatus);
  }, []);
  
  if (!status.available) {
    return (
      <Card className="opacity-50">
        <CardContent>
          <p>Agent Services: <Badge variant="outline">Offline</Badge></p>
          <p className="text-xs text-muted-foreground">
            Core functionality available without agents
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <p>Agent Services: <Badge variant="success">Online</Badge></p>
        {/* Enhanced features available here */}
      </CardContent>
    </Card>
  );
}
```

#### Pattern 3: Environment Configuration & Health

All integrations defined through environment variables:

```env
# Agent Services Integration
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_LEDGER_API_URL=http://localhost:8001
HEALTH_CHECK_TIMEOUT=5000
ENABLE_AGENT_SERVICES=false
```

Health checks performed periodically:
- On component mount
- Every 30 seconds during operation
- Before attempting agent-dependent operations

#### Pattern 4: Status Widgets & Monitoring

UI components that visualize service health:
- **Green**: Service online and responsive
- **Yellow**: Service degraded (slow response)
- **Red**: Service offline or error
- **Gray**: Service not configured (optional)

#### Pattern 5: Monitoring & Tracing

All API and service calls instrumented with OpenTelemetry:
- Request/response logging
- Performance metrics
- Error tracking
- Distributed tracing across services

**Reference**: `/app/tracing.ts` for implementation

---

## 🚀 Proposed Initial Integrations

### Phase 1: Foundation (Current State)

**Objective**: Establish core functionality without dependencies

**Status**: ✅ COMPLETE

- [x] Next.js dashboard with MetaMask integration
- [x] Gasless transaction API (`/api/sponsor-transaction`)
- [x] Health check endpoint (`/api/health`)
- [x] FastAPI backend service (independent)
- [x] Basic monitoring and error handling

### Phase 2: Agent Integration (Proof of Concept)

**Objective**: Demonstrate opt-in agent service consumption

#### A. Agent Status Widget

**Component**: `/app/dashboard/components/AgentStatusWidget.tsx` (to be created)

**Purpose**: Display real-time status of agent services

**Implementation**:
```typescript
// Pseudo-code structure
export function AgentStatusWidget() {
  // 1. Read agent URL from environment
  const agentUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
  
  // 2. Fetch health status with error boundary
  const { data, error, isLoading } = useAgentHealth(agentUrl);
  
  // 3. Display status with appropriate styling
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Services</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceStatusBadge status={data?.status} />
        <ServiceMetrics metrics={data?.metrics} />
      </CardContent>
    </Card>
  );
}
```

**Configuration**:
- Reads `NEXT_PUBLIC_FASTAPI_URL` from environment
- Falls back gracefully if not configured
- Shows "Not Configured" state rather than error

**Error Handling**:
- Network timeouts (5 second max)
- HTTP errors (4xx, 5xx)
- Invalid JSON responses
- DNS resolution failures

**Goal**: Simple integration demonstrating:
- Agent infrastructure is modular
- Services are observable
- Integration is optional

### Phase 3: Ledger API Integration

**Objective**: Connect dashboard to ledger service for transaction tracking

**Status**: 🔮 PLANNED

#### B. Transaction History Widget

**Component**: `/app/dashboard/components/TransactionHistory.tsx` (future)

**Purpose**: Display user's transaction history from ledger API

**Endpoints Used**:
```
GET /api/v1/transactions?user_id={wallet_address}
```

**Implementation Plan**:
1. Add `NEXT_PUBLIC_LEDGER_API_URL` to environment
2. Create React hook for fetching transactions
3. Build UI component with pagination
4. Add error boundary for service failures
5. Cache results to reduce API calls

#### C. Treasury Balance Widget

**Component**: `/app/dashboard/components/TreasuryBalance.tsx` (future)

**Purpose**: Show user's ledger balance and treasury allocation

**Endpoints Used**:
```
GET /api/v1/treasury/balance/{account_id}
GET /api/v1/allocation-rules
```

**Use Case**: 
- Display user's OINIO balance tracked in ledger
- Show allocation rules for rewards
- Visualize treasury distribution

### Phase 4: NFT Contract Integration

**Objective**: Enable NFT minting from dashboard

**Status**: 🔮 PLANNED

#### D. Memorial Node Minting

**Integration Points**:
1. Import contract ABIs from `pi-mr-nft-contracts`
2. Add Ethers.js contract instances
3. Create minting UI in dashboard
4. Handle NFT metadata generation

**Contract Import**:
```typescript
import ModelRoyaltyNFT from '@/contracts/ModelRoyaltyNFT.json';

const contract = new ethers.Contract(
  contractAddress,
  ModelRoyaltyNFT.abi,
  signer
);
```

**Use Cases**:
- Mint memorial node NFTs
- Track model royalty distributions
- Display user's NFT collection

---

## 📜 API Contract Proposals

### Standard Response Format

All agent services should return consistent JSON structures:

#### Success Response
```json
{
  "status": "ok",
  "message": "Operation completed successfully",
  "timestamp": "2026-01-01T00:00:00Z",
  "data": {
    // Response payload
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Human-readable error description",
  "timestamp": "2026-01-01T00:00:00Z",
  "details": {
    "code": "ERROR_CODE",
    "field": "specific_field",
    "hint": "Suggestion for resolution"
  }
}
```

### Standard Agent Endpoints

All agent services should implement:

#### Health Check
```
GET /health

Response 200:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-01T00:00:00Z",
  "uptime": 3600
}
```

#### Service Metadata
```
GET /meta

Response 200:
{
  "service": "quantum-resonance-clean",
  "version": "1.0.0",
  "capabilities": ["ledger", "agents", "analytics"],
  "endpoints": [
    {"path": "/api/v1/transactions", "method": "GET"},
    // ...
  ]
}
```

#### Agent Status
```
GET /agents/status

Response 200:
{
  "agents": [
    {
      "id": "agent-1",
      "name": "Transaction Processor",
      "status": "active",
      "tasks_completed": 1234,
      "last_activity": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Authentication & Authorization

**Current State**: No authentication required (development)

**Proposed for Production**:

#### Option 1: API Key Authentication
```
Authorization: Bearer <api-key>
```

#### Option 2: JWT Token Authentication
```
Authorization: Bearer <jwt-token>
```

**Implementation Checklist**:
- [ ] Define API key generation mechanism
- [ ] Implement JWT token signing/verification
- [ ] Add middleware to FastAPI services
- [ ] Document authentication in this file
- [ ] Add authentication to Next.js API routes

### CORS Configuration

Agent services must allow requests from main dApp:

```python
# FastAPI CORS configuration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
        "https://quantum-pi-forge-fixed.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### Rate Limiting

All public-facing agent endpoints should implement rate limiting:

**Recommended Limits**:
- **Health checks**: 60 requests/minute
- **Data queries**: 30 requests/minute
- **Mutations**: 10 requests/minute

**Implementation**: See `/fastapi/middleware/rate_limit.py`

---

## 🔄 Polyrepo Deployment & Updates

### Autonomy Principle

Each repository/service:
- **Deploys independently** - No coordinated releases required
- **Versions independently** - Semantic versioning per service
- **Scales independently** - Different resource requirements
- **Fails independently** - Circuit breakers prevent cascade failures

### Deployment Strategy

#### Main dApp (`quantum-pi-forge-fixed`)
- **Platform**: Vercel
- **Trigger**: Push to `main` branch
- **Build Time**: ~2-3 minutes
- **Rollback**: Vercel UI or `vercel rollback`

#### Agent Services (`quantum-resonance-clean`)
- **Platform**: TBD (Vercel, Railway, Render, or self-hosted)
- **Trigger**: Manual or CI/CD
- **Dependencies**: PostgreSQL database
- **Health Monitoring**: Required before accepting traffic

#### NFT Contracts (`pi-mr-nft-contracts`)
- **Platform**: Ethereum/Polygon/0G blockchains
- **Deployment**: Hardhat scripts
- **Verification**: Etherscan/block explorer
- **Immutability**: Cannot be updated after deployment

### Operational Runbooks

#### Health Check Automation

**Script Location**: `/scripts/runbook/health-check.sh`

**Usage**:
```bash
# Check all services
./scripts/runbook/health-check.sh all

# Check specific service
./scripts/runbook/health-check.sh fastapi
```

**Monitored Services**:
- FastAPI (port 8000)
- Flask (port 5000) - if applicable
- Gradio (port 7860) - if applicable

#### Component Updates

**Script Location**: `/scripts/runbook/update-component.sh`

**Usage**:
```bash
# Update all components
./scripts/runbook/update-component.sh all

# Update specific service
./scripts/runbook/update-component.sh fastapi
```

#### Emergency Procedures

**Script Location**: `/scripts/runbook/emergency-stop.sh`

**Usage**:
```bash
./scripts/runbook/emergency-stop.sh
```

**When to Use**:
- Critical security incident
- Service malfunction causing system instability
- Emergency maintenance required

### Monitoring & Observability

#### GitHub Actions Workflows

**AI Agent Autonomous Runbook** (`.github/workflows/ai-agent-handoff-runbook.yml`):
- Runs every 6 hours (automated)
- Triggers on push to `main`
- Monitors service health
- Updates status issue automatically

**Workflow Jobs**:
1. 🛡️ Safety Gate - Pre-flight checks
2. 🔧 CI Pipeline - Build and test
3. 🚀 Deployment - Deploy to production
4. 📊 Monitoring - Health checks
5. 🔄 Rollback - Revert if needed
6. 📝 Status Update - Update tracking issue

#### Status Tracking

**Live Status Issue**: "🤖 AI Agent Autonomous Runbook Status"

**Contains**:
- ✅ Operational status (OPERATIONAL / DEGRADED / CRITICAL)
- 📊 Job status summary
- 🏥 System health metrics
- 📝 AI agent instructions
- 🚨 Emergency procedures

**Access**: Check repository issues with label `ai-agent`

#### Monitoring Reports

**Artifacts Generated**:
- `health-check.json` - Service health status
- Retention: 30 days
- Format: JSON with timestamps

**Download**:
```bash
gh run download <run_id> -n monitoring-report
```

### Dashboard Integration

**Future Enhancement**: Add monitoring widgets to dashboard

**Proposed Widgets**:
- Service health status (green/yellow/red)
- Response time metrics
- Error rate over time
- Deployment history

**Reference**: See `RUNBOOK_QUICK_REF.md` and `docs/AI_AGENT_RUNBOOK.md`

---

## 📚 Appendix: Quick Reference & URLs

### Canonical Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **CANON.md** | Single source of truth | `/CANON.md` |
| **MASTER_URLS.md** | All service URLs | `/MASTER_URLS.md` |
| **RUNBOOK_QUICK_REF.md** | Operations procedures | `/RUNBOOK_QUICK_REF.md` |
| **AI_AGENT_RUNBOOK.md** | AI agent operations | `/docs/AI_AGENT_RUNBOOK.md` |
| **FOR_HUMANS.md** | User-facing guide | `/docs/FOR_HUMANS.md` |
| **ECOSYSTEM_ARCHITECTURE.md** | This document | `/docs/ECOSYSTEM_ARCHITECTURE.md` |

### Service Endpoints

#### Production URLs

| Service | URL | Status |
|---------|-----|--------|
| Main Dashboard | https://quantum-pi-forge-fixed.vercel.app/dashboard | ✅ LIVE |
| Landing Page | https://onenoly1010.github.io/quantum-pi-forge-site/ | ✅ LIVE |
| Health API | https://quantum-pi-forge-fixed.vercel.app/api/health | ✅ LIVE |

#### Development URLs (Local)

| Service | URL | Port |
|---------|-----|------|
| Next.js Dev Server | http://localhost:3000 | 3000 |
| FastAPI Agent Service | http://localhost:8000 | 8000 |
| Ledger API | http://localhost:8001 | 8001 |
| Express Backend | http://localhost:3001 | 3001 |

### Blockchain Networks

| Network | Chain ID | RPC URL | Token Address |
|---------|----------|---------|---------------|
| Polygon Mainnet | 137 | https://polygon-rpc.com | `0x07f43E5B1A8a0928B364E40d5885f81A543B05C7` |
| 0G Aristotle | 16661 | https://evmrpc.0g.ai | `0x07f43E5B1A8a0928B364E40d5885f81A543B05C7` |

### Key Commands

#### Development
```bash
# Start Next.js dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

#### Smart Contracts
```bash
# Compile contracts
npx hardhat compile

# Deploy to network
npx hardhat run scripts/deploy.ts --network polygon

# Verify contract
npx hardhat verify --network polygon <contract-address>
```

#### Health Checks
```bash
# Check main dApp
curl https://quantum-pi-forge-fixed.vercel.app/api/health

# Check agent service (local)
curl http://localhost:8000/health

# Check ledger API (local)
curl http://localhost:8001/api/v1/transactions
```

### Environment Variables Reference

See `/docs/ECOSYSTEM_ARCHITECTURE.md` (this file) and `.env.example` for complete environment variable documentation.

**Critical Variables**:
- `SPONSOR_PRIVATE_KEY` - Wallet for gasless transactions
- `POLYGON_RPC_URL` - Blockchain RPC endpoint
- `OINIO_TOKEN_ADDRESS` - OINIO token contract
- `NEXT_PUBLIC_APP_URL` - Frontend URL for CORS

### Repository Links

| Repository | URL | Status |
|------------|-----|--------|
| quantum-pi-forge-fixed | https://github.com/onenoly1010/quantum-pi-forge-fixed | ✅ ACTIVE |
| quantum-resonance-clean | External | ⚠️ REFERENCED |
| pi-mr-nft-agent | External | 🔮 PLANNED |
| pi-mr-nft-contracts | External | 🔮 PLANNED |
| quantum-pi-forge-site | External | ✅ DEPLOYED |

### Support & Resources

**Documentation**:
- **Copilot Instructions**: `/.github/copilot-instructions.md`
- **GitHub Actions**: `/.github/workflows/`
- **Scripts**: `/scripts/`

**Community**:
- **GitHub Issues**: https://github.com/onenoly1010/quantum-pi-forge-fixed/issues
- **GitHub Discussions**: https://github.com/onenoly1010/quantum-pi-forge-fixed/discussions

**Deployment Platforms**:
- **Vercel**: https://vercel.com/onenoly1010/quantum-pi-forge-fixed
- **GitHub Actions**: https://github.com/onenoly1010/quantum-pi-forge-fixed/actions

---

## 🔐 Security Considerations

### Secrets Management

**Never Commit**:
- Private keys (`SPONSOR_PRIVATE_KEY`, `DEPLOYER_PRIVATE_KEY`)
- API keys (`OPENAI_API_KEY`)
- Database credentials (`DATABASE_URL`)
- JWT secrets (`JWT_SECRET_KEY`)

**Use Environment Variables**:
- Vercel: Dashboard → Settings → Environment Variables
- Local: `.env.local` (gitignored)

### CORS Security

Agent services should:
- Whitelist specific origins (not `*` in production)
- Validate `Origin` header
- Use HTTPS in production

### Rate Limiting

Implement on all public endpoints to prevent:
- DDoS attacks
- Resource exhaustion
- API abuse

### Input Validation

All API endpoints must:
- Validate input types
- Sanitize user input
- Check authorization
- Log suspicious activity

---

## 🎯 Future Enhancements

### Proposed Integrations

**Q1 2026**:
- [ ] Agent Status Widget on dashboard
- [ ] Ledger API transaction history
- [ ] Enhanced monitoring dashboard
- [ ] Authentication for agent services

**Q2 2026**:
- [ ] NFT minting interface
- [ ] Memorial node onboarding
- [ ] Multi-chain support
- [ ] Mobile app exploration

**Q3 2026**:
- [ ] Advanced analytics dashboard
- [ ] Community governance features
- [ ] Enhanced AI agent capabilities
- [ ] Performance optimizations

### Architecture Evolution

**Service Mesh** (future consideration):
- Centralized service discovery
- Automatic load balancing
- Advanced tracing and monitoring

**GraphQL Gateway** (future consideration):
- Unified API layer
- Reduces client complexity
- Better caching strategies

**Message Queue** (future consideration):
- Asynchronous task processing
- Better scalability
- Event-driven architecture

---

## 📝 Changelog

### Version 1.0.0 (2026-01-01)
- Initial ecosystem architecture documentation
- Defined service constellation topology
- Established integration patterns
- Documented Canon of Autonomy principles
- Added API contract proposals
- Documented deployment strategies

---

## 🤝 Contributing

When adding new services or integrations:

1. **Update this document** with service details
2. **Follow Canon of Autonomy** principles
3. **Implement health endpoints** on all services
4. **Add environment variables** to `.env.example`
5. **Document API contracts** in this file
6. **Add monitoring** and observability
7. **Test graceful degradation** when service unavailable

---

**Status**: ✅ ACTIVE  
**Maintained by**: Quantum Pi Forge Team  
**Last Review**: 2026-01-01

🔥 This is the canonical reference for ecosystem architecture. All integrations flow from here. 𓁶
