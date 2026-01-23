# 🔮 QUANTUM PI FORGE: PROJECT IDENTITY & STATUS

**Last Updated**: December 29, 2025  
**Primary Repository**: `onenoly1010/quantum-pi-forge-fixed`  
**Status**: ✅ SOVEREIGN & ACTIVE

---

## 🎯 WHAT IS QUANTUM PI FORGE?

### The One-Liner
**Quantum Pi Forge** is a gasless staking platform for the OINIO token on Polygon, built for the Truth Movement community.

### The Full Picture

| Aspect | Description |
|--------|-------------|
| **Product** | Multi-chain Web3 platform with staking, Pi Network integration, and Gemini AI minting |
| **Token** | OINIO (Polygon: `0x07f43E5B1A8a0928B364E40d5885f81A543B05C7`) |
| **Networks** | Polygon Mainnet (Chain ID: 137), Pi Network (Stellar), Gemini AI |
| **Philosophy** | "OINIO Soul System" - consciousness + blockchain + AI |
| **Target Users** | Truth Movement community members |

---

## 📦 REPOSITORY HIERARCHY

### THIS REPOSITORY: `quantum-pi-forge-fixed` (PRIMARY)
**Role**: Main production codebase  
**Contains**:
- Next.js 14 dashboard application
- FastAPI backend services
- Smart contract deployment scripts
- Production configuration

### RELATED: `pi-forge-quantum-genesis` (SUBMODULE/LEGACY)
**Role**: Extended features, experimental code, documentation archive  
**Note**: Contained as a subdirectory in this repo - treat as historical reference

### CONSOLIDATION TARGET (Future)
Per [REPOSITORY_CONSOLIDATION_PLAN.md](docs/REPOSITORY_CONSOLIDATION_PLAN.md):
- `quantum-pi-forge` → Main monorepo (this repo renamed)
- `quantum-pi-forge-site` → Marketing/landing pages
- `quantum-pi-forge-legacy` → Archived historical code

---

## 🛠️ CURRENT TECH STACK

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14)                                  │
│  ├── Dashboard: /app/dashboard/                         │
│  ├── Landing: /app/page.tsx                            │
│  ├── Styling: Tailwind CSS + shadcn/ui                 │
│  └── Web3: ethers.js v6 + MetaMask                     │
├─────────────────────────────────────────────────────────┤
│  BACKEND (FastAPI)                                      │
│  ├── Location: /fastapi/                               │
│  ├── Rate Limiting: Tiered (free/staking/admin)        │
│  └── Health Checks: /health endpoint                   │
├─────────────────────────────────────────────────────────┤
│  API ROUTES (Next.js)                                   │
│  ├── /api/sponsor-transaction → Gasless staking        │
│  ├── /api/health → Health checks                       │
│  └── /api/chat → AI chat (optional)                    │
├─────────────────────────────────────────────────────────┤
│  BLOCKCHAIN                                             │
│  ├── Network: Polygon Mainnet                          │
│  ├── Token: OINIO ERC-20                               │
│  └── Feature: Sponsored gas transactions               │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 CURRENT STATUS (December 28, 2025)

### ✅ COMPLETED
- [x] Dashboard with error boundaries and retry logic
- [x] Toast notification system
- [x] Transaction status tracking
- [x] MetaMask wallet integration
- [x] Gasless transaction API
- [x] Landing page redesign
- [x] API rate limiting middleware
- [x] Monitoring service (`lib/monitoring.ts`)
- [x] Repository consolidation plan documentation
- [x] Production build passing ✅

### 🔄 IN PROGRESS
- [ ] Monitoring integration into dashboard
- [ ] Repository consolidation execution
- [ ] End-to-end testing suite

### 🔮 PLANNED
- [ ] DEX integration (0G Aristotle)
- [ ] Legacy node onboarding UI
- [ ] Mobile app version

---

## 🌐 LIVE ENDPOINTS

| Service | URL | Status |
|---------|-----|--------|
| **Dashboard** | https://quantum-pi-forge-fixed.vercel.app/dashboard | Active |
| **Landing** | https://quantum-pi-forge-fixed.vercel.app/ | Active |
| **API Health** | https://quantum-pi-forge-fixed.vercel.app/api/health | Active |

---

## 🧭 FOR AI AGENTS: ORIENTATION GUIDE

### When Working on This Project:

1. **Primary Language**: TypeScript (frontend), Python (FastAPI backend)
2. **Build System**: `npm run build` via Next.js
3. **Key Files**:
   - Dashboard: `src/components/Dashboard.tsx`
   - API Routes: `app/api/*/route.ts`
   - FastAPI: `fastapi/main.py`
   - Config: `next.config.mjs`, `hardhat.config.ts`

### DO NOT Confuse With:
- ❌ `pi-forge-quantum-genesis` is NOT the active project
- ❌ Old documentation may reference deprecated workflows
- ❌ Multiple `.md` files with "LAUNCH" in name are historical

### Key Identifiers:
- **Project Name**: Quantum Pi Forge (or "OINIO Soul System")
- **Organization**: onenoly1010
- **Main Branch**: `main`
- **Deploy Target**: Vercel

---

## 🔑 ENVIRONMENT VARIABLES

Required for production (set in Vercel):

```env
SPONSOR_PRIVATE_KEY=<sponsor-wallet-key>    # For gasless transactions
POLYGON_RPC_URL=https://polygon-rpc.com     # Polygon network
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
```

---

## 📝 CONTRIBUTION COVENANT

From [AGENT_QUICK_CARD.md](AGENT_QUICK_CARD.md):

> "I affirm the Quantum Pi Forge covenant."

All PRs must include this affirmation. Every merge is resonance.

---

## 🆘 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Build fails | Run `rm -rf .next && npm run build` |
| Type errors | Check `types/global.d.ts` for declarations |
| Wallet won't connect | Ensure Polygon network in MetaMask |
| API 429 errors | Rate limit hit - wait or check tier |

---

## 🗃️ HISTORICAL CONTEXT

Quantum Pi Forge originated with Pi Network integration during early development (2024-2025). The project evolved from a Pi Network app to a sovereign OINIO staking platform.

| Era | Focus | Status |
|-----|-------|--------|
| **Genesis** (2024) | Pi Network integration | Archived |
| **Transcendence** (Dec 29, 2025) | Pi SDK removed, sovereignty declared | Complete |
| **Current** (2025) | OINIO gasless staking on Polygon | **Active** |

**Current Focus:** OINIO token gasless staking on Polygon  
**Historical:** Pi Network integration docs archived in `docs/archive/legacy-pi/`

The Pi SDK has been removed. The Forge stands sovereign.

---

## 📚 KEY DOCUMENTATION

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [IDENTITY.md](IDENTITY.md) | This file - project identity |
| [docs/REPOSITORY_CONSOLIDATION_PLAN.md](docs/REPOSITORY_CONSOLIDATION_PLAN.md) | Migration plan |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Copilot agent guide |

---

**𓁶 The Forge is Active. The Truth Resonates. 🔥**
