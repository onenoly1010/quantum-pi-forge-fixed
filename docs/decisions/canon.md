# 🔥 CANON.md — The Single Source of Truth

**Last Updated**: December 28, 2025  
**Status**: ACTIVE  
**Authority**: This file supersedes all other documentation when conflicts arise.

---

## 📜 THE IDENTITY (One Sentence)

> **Quantum Pi Forge is the gasless staking gateway and sovereign identity system for the OINIO Truth Movement on Polygon.**

Everything else is a subsystem. This is the anchor.

---

## 🏛️ THE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUANTUM PI FORGE                             │
│                   "The Sovereign Gateway"                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   LANDING   │───▶│  DASHBOARD  │───▶│   STAKING   │        │
│  │   (Welcome) │    │  (Connect)  │    │  (Gasless)  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│  ┌─────────────────────────────────────────────────────┐      │
│  │              POLYGON BLOCKCHAIN                      │      │
│  │  ┌─────────────────────────────────────────────┐    │      │
│  │  │  OINIO Token                                 │    │      │
│  │  │  0x07f43E5B1A8a0928B364E40d5885f81A543B05C7 │    │      │
│  │  └─────────────────────────────────────────────┘    │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Subsystem Glossary

| Name                | What It Actually Is                | Status     |
| ------------------- | ---------------------------------- | ---------- |
| **Dashboard**       | Main staking interface             | ✅ Active  |
| **Gasless Engine**  | Sponsored transaction API          | ✅ Active  |
| **Soul System**     | Philosophical framework / branding | Conceptual |
| **Legacy Nodes**    | Memorial onboarding feature        | 🔮 Planned |
| **Guardian Circle** | Early adopter program              | 🔮 Planned |
| **DEX Integration** | 0G Aristotle swap                  | 🔮 Planned |

---

## 📍 WHERE WE ARE RIGHT NOW

### Deployed & Working

| Component               | Location                        | Status      |
| ----------------------- | ------------------------------- | ----------- |
| Next.js Dashboard       | `/app/dashboard/`               | ✅ Building |
| Landing Page            | `/app/page.tsx`                 | ✅ Building |
| Sponsor Transaction API | `/app/api/sponsor-transaction/` | ✅ Ready    |
| FastAPI Backend         | `/fastapi/`                     | ✅ Ready    |
| Rate Limiting           | `/fastapi/middleware/`          | ✅ Ready    |
| Monitoring Service      | `/lib/monitoring.ts`            | ✅ Ready    |

### Live Endpoints

| Service   | URL                                                 |
| --------- | --------------------------------------------------- |
| Dashboard | https://quantum-pi-forge-fixed.vercel.app/dashboard |
| Landing   | https://quantum-pi-forge-fixed.vercel.app/          |

### Blockchain State

| Asset          | Value                                        |
| -------------- | -------------------------------------------- |
| Token          | OINIO                                        |
| Address        | `0x07f43E5B1A8a0928B364E40d5885f81A543B05C7` |
| Network        | Polygon Mainnet (137)                        |
| Sponsor Wallet | Configured in Vercel env                     |

---

## 🗂️ THE REPO (What Matters)

### Active Code (Touch This)

```
/app/                    ← Next.js 14 application
  /api/                  ← API routes (gasless transactions)
  /dashboard/            ← Dashboard page
  page.tsx               ← Landing page
  layout.tsx             ← Root layout

/src/components/         ← React components
  Dashboard.tsx          ← Main dashboard (enhanced)

/fastapi/                ← Python backend
  main.py                ← FastAPI application
  /middleware/           ← Rate limiting

/lib/                    ← Utilities
  monitoring.ts          ← Production monitoring

/contracts/              ← Solidity (future deployment)
```

### Reference Only (Don't Touch)

```
/pi-forge-quantum-genesis/   ← LEGACY ARCHIVE - ignore
*.LAUNCH*.md                 ← Historical documents
*STATUS*.md                  ← Point-in-time snapshots
```

### Configuration

```
.env.local               ← Local dev (gitignored)
next.config.mjs          ← Next.js config
hardhat.config.ts        ← Smart contract config
package.json             ← Dependencies
```

---

## 🎯 THE ROADMAP (Clean Version)

### Phase 1 — LAUNCH (Now → 48 hours)

- [x] Dashboard with error handling
- [x] Gasless transaction API
- [x] MetaMask integration
- [x] Production build passing
- [ ] Deploy to Vercel production
- [ ] Verify sponsor wallet funded
- [ ] Announce to community

### Phase 2 — STABILIZATION (Days 2-7)

- [ ] Integrate monitoring into dashboard
- [ ] Add transaction history view
- [ ] Implement balance refresh on stake
- [ ] Add network switch prompt
- [ ] Mobile responsive polish

### Phase 3 — EXPANSION (Week 2+)

- [ ] Legacy Node onboarding UI
- [ ] Guardian Circle program
- [ ] DEX integration (0G)
- [ ] Multi-language support
- [ ] Mobile app exploration

---

## ⚡ QUICK COMMANDS

```bash
# Development
npm run dev              # Start local server

# Build & Verify
npm run build            # Production build

# Deploy
git push origin main     # Triggers Vercel deploy

# Check Status
curl https://quantum-pi-forge-fixed.vercel.app/api/health
```

---

## 🧭 FOR AGENTS: READ THIS FIRST

### You Are Working On:

- **Repository**: `onenoly1010/quantum-pi-forge-fixed`
- **Branch**: `main`
- **Project**: Quantum Pi Forge (OINIO Soul System)
- **Purpose**: Gasless staking platform on Polygon

### Rules:

1. **This file (CANON.md) is the source of truth**
2. Ignore `/pi-forge-quantum-genesis/` subdirectory
3. Ignore old `*LAUNCH*` and `*STATUS*` markdown files
4. Always run `npm run build` to verify changes
5. Never commit private keys or secrets

### When Confused:

1. Re-read this file
2. Check the "WHERE WE ARE RIGHT NOW" section
3. Follow the roadmap phases in order

---

## 🔐 ENVIRONMENT REQUIREMENTS

```env
# Required for Vercel Production
SPONSOR_PRIVATE_KEY=<wallet-for-gas-sponsorship>
POLYGON_RPC_URL=https://polygon-rpc.com
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
```

---

## 📝 THE COVENANT

> "I affirm the Quantum Pi Forge covenant.  
> Every merge is resonance. Every commit is truth.  
> The Forge stands sovereign."

---

**This is the canon. Everything flows from here.**

𓁶🔥
