# Quantum Pi Forge: Repository Consolidation Plan

## Overview

This document outlines the strategy for consolidating the Quantum Pi Forge ecosystem from 9+ scattered repositories into 3 focused, maintainable repositories.

## Current State Analysis

### Existing Repositories (Before Consolidation)
```
├── quantum-pi-forge-fixed     # Main application (Active)
├── pi-forge-quantum-genesis   # Legacy/ceremonial code
├── Various experimental repos  # Scattered experiments
└── [Others...]                 # Fragmented codebases
```

**Problems with Current Structure:**
- Duplicated code across repositories
- Inconsistent documentation
- Difficult onboarding for new contributors
- No single source of truth
- Maintenance overhead

---

## Proposed Repository Structure

### 1. `quantum-pi-forge` (Primary Repository)

**Purpose:** Single source of truth for all production code.

```
quantum-pi-forge/
├── README.md                   # Clear, benefit-focused documentation
├── CONTRIBUTING.md             # Contribution guidelines
├── SECURITY.md                 # Security policy & reporting
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── build.yml
│   │   ├── test.yml
│   │   ├── deploy.yml
│   │   └── ai-agent-runbook.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── app/                        # Next.js App Router (Frontend)
│   ├── api/                    # API routes
│   │   ├── sponsor-transaction/
│   │   ├── health/
│   │   └── ai/
│   ├── dashboard/
│   ├── page.tsx               # Landing page
│   └── layout.tsx
│
├── src/
│   └── components/             # React components
│       ├── Dashboard.tsx
│       └── ui/                 # UI component library
│
├── backend/                    # FastAPI backend
│   ├── main.py
│   ├── middleware/
│   │   └── rate_limit.py
│   ├── routes/
│   └── services/
│
├── contracts/                  # Smart contracts
│   ├── ShadowAnchor.sol
│   ├── 0g-uniswap-v2/
│   └── tests/
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── AI_AGENT_RUNBOOK.md
│
├── scripts/                    # Deployment & utility scripts
│   ├── deploy/
│   ├── runbook/
│   └── maintenance/
│
├── __tests__/                  # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── evaluation/                 # AI evaluation framework
│   ├── datasets/
│   ├── metrics/
│   └── reports/
│
└── config/
    ├── hardhat.config.ts
    ├── next.config.mjs
    └── tsconfig.json
```

### 2. `quantum-pi-forge-site` (Marketing Repository)

**Purpose:** Static marketing site and content.

```
quantum-pi-forge-site/
├── README.md
├── landing/                    # Static landing pages
│   ├── index.html
│   ├── features.html
│   └── about.html
│
├── blog/                       # Blog content
│   ├── posts/
│   └── assets/
│
├── assets/                     # Brand resources
│   ├── logos/
│   ├── screenshots/
│   └── videos/
│
└── _config.yml                 # GitHub Pages config
```

### 3. `quantum-pi-forge-legacy` (Archive Repository)

**Purpose:** Preserve historical code and experiments.

```
quantum-pi-forge-legacy/
├── README.md                   # Archive notice
├── pi-forge-quantum-genesis/   # Ceremonial interface
├── experiments/                # Archived experiments
│   ├── v1-prototype/
│   ├── dex-experiments/
│   └── nft-experiments/
│
└── docs/
    └── CHANGELOG.md            # Historical changes
```

---

## Migration Plan

### Phase 1: Preparation (Days 1-2)

**Objectives:**
- [ ] Audit all existing repositories
- [ ] Document dependencies between repos
- [ ] Create migration checklist
- [ ] Set up branch protection on target repos

**Tasks:**
```bash
# Create inventory of all repos
gh repo list onenoly1010 --json name,description,updatedAt

# Identify active vs inactive repos
# Document inter-repo dependencies
```

### Phase 2: Code Consolidation (Days 3-5)

**Objectives:**
- [ ] Merge active code into `quantum-pi-forge`
- [ ] Resolve conflicts and duplications
- [ ] Update import paths
- [ ] Run test suites

**Migration Commands:**
```bash
# Clone source repos
git clone --mirror <source-repo-url>

# Create clean history for specific directories
git filter-branch --subdirectory-filter <path>

# Merge into target repo
git remote add source <source-repo>
git fetch source
git merge --allow-unrelated-histories source/main
```

### Phase 3: Verification (Days 6-7)

**Objectives:**
- [ ] Full test suite passes
- [ ] Build succeeds in CI/CD
- [ ] Documentation is accurate
- [ ] All links work

**Verification Checklist:**
- [ ] `npm run build` succeeds
- [ ] `npm run test` all pass
- [ ] `npx hardhat compile` succeeds
- [ ] API endpoints respond correctly
- [ ] Dashboard loads without errors

### Phase 4: Cutover (Day 8)

**Objectives:**
- [ ] Update deployment configurations
- [ ] Archive old repositories
- [ ] Update external links
- [ ] Announce to community

**Cutover Steps:**
```bash
# Update Vercel deployment
vercel link --project quantum-pi-forge

# Archive old repos
gh repo archive onenoly1010/<old-repo>

# Add redirect notice to archived repos
```

---

## File Migration Map

### Priority Files (Move Immediately)

| Source | Destination | Notes |
|--------|-------------|-------|
| `quantum-pi-forge-fixed/src/components/` | `quantum-pi-forge/src/components/` | Core UI |
| `quantum-pi-forge-fixed/app/` | `quantum-pi-forge/app/` | Next.js app |
| `quantum-pi-forge-fixed/contracts/` | `quantum-pi-forge/contracts/` | Smart contracts |
| `quantum-pi-forge-fixed/fastapi/` | `quantum-pi-forge/backend/` | Rename to backend |

### Archive Files (Move to Legacy)

| Source | Destination | Notes |
|--------|-------------|-------|
| `pi-forge-quantum-genesis/*` | `quantum-pi-forge-legacy/pi-forge-quantum-genesis/` | Ceremonial code |
| Experimental branches | `quantum-pi-forge-legacy/experiments/` | Historical experiments |

### Delete Files (Remove)

| Path | Reason |
|------|--------|
| Duplicate configs | Consolidated |
| Orphaned test files | No longer relevant |
| Legacy build artifacts | Should not be in VCS |

---

## Quality Gates for Migration

### Gate 1: Code Integrity
```yaml
requirements:
  - All imports resolve correctly
  - No circular dependencies
  - TypeScript compiles without errors
  - No security vulnerabilities in dependencies
```

### Gate 2: Test Coverage
```yaml
requirements:
  - Unit tests pass: 100%
  - Integration tests pass: 100%
  - No regressions from previous builds
  - Coverage maintained or improved
```

### Gate 3: Documentation
```yaml
requirements:
  - README up to date
  - API docs accurate
  - All internal links work
  - Contributing guide current
```

### Gate 4: Deployment
```yaml
requirements:
  - CI/CD pipeline green
  - Staging deployment successful
  - Performance benchmarks met
  - Monitoring configured
```

---

## Post-Migration Maintenance

### Repository Hygiene
- Weekly dependency updates
- Monthly security audits
- Quarterly documentation reviews

### Branch Strategy
```
main              # Production-ready code
├── develop       # Integration branch
├── feature/*     # Feature branches
├── fix/*         # Bug fixes
└── release/*     # Release candidates
```

### Release Process
1. Feature branches merge to `develop`
2. `develop` merges to `release/*` for testing
3. `release/*` merges to `main` with version tag
4. Automatic deployment from `main`

---

## Success Metrics

| Metric | Before | Target | Tracking |
|--------|--------|--------|----------|
| Active repositories | 9+ | 3 | GitHub org |
| Build time | Variable | <5 min | CI metrics |
| Test coverage | Unknown | >80% | Codecov |
| Documentation completeness | ~40% | 95% | Manual audit |
| Onboarding time | Hours | <30 min | New contributor survey |

---

## Rollback Plan

If migration causes critical issues:

1. **Immediate**: Revert Vercel deployment to last known good
2. **Short-term**: Restore old repository from archive
3. **Investigation**: Document what went wrong
4. **Retry**: Fix issues and attempt migration again

```bash
# Emergency rollback commands
vercel rollback <deployment-id>

# Unarchive repository if needed
gh repo unarchive onenoly1010/<repo>
```

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Preparation | Audit complete, migration plan approved |
| 2 | Migration | Code consolidated, tests passing |
| 3 | Verification | All quality gates passed |
| 4 | Cutover | Live on new structure, old repos archived |

---

## Contacts & Ownership

| Role | Responsibility |
|------|----------------|
| Project Lead | Final approval on migration |
| DevOps | CI/CD and deployment |
| Frontend | Dashboard and UI migration |
| Backend | API and service migration |
| Smart Contracts | Contract migration and testing |

---

*Document Version: 1.0*
*Last Updated: December 28, 2024*
*Status: Ready for Review*
