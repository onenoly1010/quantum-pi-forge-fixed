# Copilot Instructions for Quantum Pi Forge

## Working with GitHub Copilot

This repository is configured for GitHub Copilot Coding Agent. When working with Copilot:

### Suitable Tasks
Copilot excels at **low-to-medium complexity** tasks such as:
- 🐛 Bug fixes and error handling improvements
- 🔧 Refactoring existing code
- ✅ Adding or improving tests
- 📝 Documentation updates
- ♿ Accessibility improvements
- 🧹 Technical debt cleanup
- 🎨 UI component development
- 🔐 Security vulnerability fixes

**Avoid assigning** tasks that require:
- Deep domain expertise in blockchain/smart contracts
- Large-scale architecture changes
- Complex business logic decisions
- Critical security-sensitive operations without review

### Iteration Process
1. **Clear Issues**: Write detailed issues with acceptance criteria
2. **Review PRs**: Treat Copilot PRs like human contributions - review carefully
3. **Provide Feedback**: Use PR comments and mention `@copilot` for iterations
4. **Incremental Changes**: Prefer small, focused changes over large refactors
5. **Test Thoroughly**: Always validate changes with builds and tests

### Security Expectations
- Copilot works in sandboxed environments with restricted permissions
- All changes require human review before merging
- Private keys and sensitive data must never be committed
- Environment variables are validated before use
- Code changes are audited for security vulnerabilities

## Project Overview

The Quantum Pi Forge (OINIO Soul System) is a decentralized application built for the Truth Movement, combining Web3 technology with a spiritual/consciousness framework. It features:

- **Gasless staking** for OINIO tokens via sponsored transactions
- **Polygon blockchain** integration
- **MetaMask wallet** connectivity
- **Legacy onboarding** system for memorial nodes
- **Modern Web3 UI** with real-time balance tracking

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript + JavaScript (mixed codebase)
- **UI Library**: React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3**: Ethers.js v6 for blockchain interactions
- **Deployment**: Vercel

### Smart Contracts
- **Development**: Hardhat
- **Language**: Solidity (versions 0.5.16, 0.6.6, 0.8.20)
- **Networks**: Polygon Mainnet (Chain ID: 137), 0G Aristotle (Chain ID: 16661)
- **Contracts**: Uniswap V2 fork, custom OINIO token contracts

### Key Dependencies
- `ethers` v6.16.0 for blockchain interaction
- `@radix-ui/*` components via shadcn/ui
- `next-themes` for dark mode support
- `hardhat` for smart contract development

## Project Structure

```
quantum-pi-forge-fixed/
├── app/                          # Next.js 14 app directory
│   ├── api/                      # API routes
│   │   └── sponsor-transaction/  # Gasless staking endpoint
│   ├── dashboard/                # Dashboard page
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── src/                          # Legacy JavaScript components
│   ├── components/               # React components
│   └── index.js                  # Entry point
├── components/                   # Shared components (TypeScript)
├── contracts/                    # Solidity smart contracts
│   ├── 0g-uniswap-v2/           # Uniswap V2 fork
│   └── ShadowAnchor.sol         # Custom contracts
├── scripts/                      # Deployment and utility scripts
├── public/                       # Static assets
└── hardhat.config.ts            # Hardhat configuration
```

## Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)

# Building
npm run build        # Build Next.js application
npm run start        # Start production server

# Smart Contracts (via Hardhat)
npx hardhat compile  # Compile Solidity contracts
npx hardhat test     # Run contract tests
```

### Linting

**Note**: No linting tools (ESLint, Prettier) are currently configured in this project. 
- Code quality is maintained through manual code review
- TypeScript's strict mode provides compile-time checks
- Consider adding ESLint if implementing new linting rules

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for new files in `app/` and `components/` directories
- Follow existing patterns for React components (functional components with hooks)
- Use the `@/` path alias for imports (maps to project root)
- Prefer `const` over `let`, avoid `var`

### React Components
- Use client components (`'use client'`) when needed for interactivity
- Leverage shadcn/ui components for UI consistency
- Follow the glassmorphism design pattern established in the dashboard
- Use Tailwind CSS classes for styling

### Smart Contracts
- Multiple Solidity versions are supported (0.5.16, 0.6.6, 0.8.20)
- Enable optimizer for production contracts
- Follow established patterns in existing contracts
- Test thoroughly before deployment

### Styling
- Use Tailwind CSS utility classes
- Follow the established color scheme (HSL variables in globals.css)
- Maintain responsive design (mobile-first approach)
- Use consistent spacing and glassmorphism effects

## Environment Variables

Required environment variables (set in Vercel or `.env.local`):

```env
SPONSOR_PRIVATE_KEY=<sponsor-wallet-private-key>
POLYGON_RPC_URL=https://polygon-rpc.com
OINIO_TOKEN_ADDRESS=0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
DEPLOYER_PRIVATE_KEY=<for-hardhat-deployments>
ZERO_G_RPC_URL=https://rpc.0g.ai
```

**Security Note**: Never commit private keys to the repository.

## Key Features to Maintain

### 1. Gasless Transactions
- Sponsor wallet pays gas fees for users
- API endpoint validates amounts (0.01 - 10000 OINIO)
- Balance checks before sponsoring transactions

### 2. MetaMask Integration
- Wallet connection with proper error handling
- Network detection (Polygon Mainnet)
- Real-time balance updates

### 3. Security
- Input validation on both client and server
- Ethereum address validation
- No sensitive data in error messages
- Environment variable validation

## Common Patterns

### API Routes (Next.js 14)
```typescript
// app/api/[endpoint]/route.ts
export async function POST(request: Request) {
  // Parse request
  const body = await request.json();
  
  // Validate input
  // Process transaction
  // Return response
  
  return Response.json({ success: true, ... });
}
```

### Component Structure
```typescript
'use client';
import { useState, useEffect } from 'react';

export default function Component() {
  // State management
  // Effects for data fetching
  // Event handlers
  // Render with Tailwind + shadcn/ui
}
```

### Ethers.js Interactions
```typescript
import { ethers } from 'ethers';

// Use JsonRpcProvider for RPC connections
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Use BrowserProvider for MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
```

## Testing Considerations

- No automated test suite is currently configured for the frontend
- Hardhat test directory structure exists (`./test`) but no tests are implemented yet
- Manual testing is required for:
  - MetaMask wallet connection
  - Gasless staking transactions
  - Balance display accuracy
  - Responsive design on mobile
  - Error handling scenarios
- When adding tests, follow these guidelines:
  - Frontend tests: Consider adding Jest + React Testing Library
  - Smart contract tests: Use Hardhat test framework with Ethers.js
  - Test files should match the pattern: `*.test.ts` or `*.spec.ts`

## Deployment

- **Platform**: Vercel (connected to GitHub)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment**: Set all required env vars in Vercel dashboard

### CI/CD Workflows

The project uses GitHub Actions for automated deployments:

1. **Next.js Build Workflow** (`.github/workflows/nextjs.yml`)
   - Triggers on push to `main` branch
   - Builds Next.js application
   - Uploads artifact for GitHub Pages
   - Notifies Vercel of deployment status

2. **Pages Deployment** (`.github/workflows/pages.yml`)
   - Deploys documentation from `./docs` directory
   - Requires GitHub Pages to be enabled

3. **AI Agent Autonomous Runbook** (`.github/workflows/ai-agent-handoff-runbook.yml`)
   - Automated monitoring and operations workflow
   - Triggers: schedule (every 6 hours), push to main, workflow completion, manual dispatch
   - Maintains a live status issue: "🤖 AI Agent Autonomous Runbook Status"
   - Provides AI agents with operational context and deployment status

### AI Agent Autonomous Runbook

The AI Agent Autonomous Runbook is an automated workflow that provides continuous monitoring, deployment tracking, and operational control for the Quantum Pi Forge system.

#### Workflow Overview

**Location**: `.github/workflows/ai-agent-handoff-runbook.yml`

**Triggers**:
- **Schedule**: Every 6 hours (cron: `0 */6 * * *`)
- **Push**: To `main` branch on paths: `app/**`, `src/**`, `.github/workflows/**`
- **Workflow Completion**: After "Deploy Next.js site to Pages" or "Agent Dispatch" workflows complete
- **Manual Dispatch**: Via GitHub Actions UI with custom actions

**Permissions Required**:
- `contents: write` - For repository operations
- `issues: write` - For status issue updates
- `actions: read` - For workflow monitoring
- `checks: read` - For check status

#### Jobs and Workflow Steps

1. **🛡️ Safety Gate** - Runs safety checks before proceeding
   - Validates repository state
   - Outputs: `status` (success/failure)

2. **🔧 CI Pipeline** - Builds and validates the application
   - Sets up Node.js 20
   - Installs dependencies with `npm ci --legacy-peer-deps`
   - Runs `npm run build`
   - Outputs: `status` (success/failure)

3. **🚀 Deployment** - Deploys application (conditional)
   - Runs only on push to main or manual `update-component` action
   - Executes component-specific updates via `scripts/runbook/update-component.sh`
   - Outputs: `status`, `deployment_url`

4. **📊 Monitoring** - Health checks for all services
   - Checks FastAPI Quantum Conduit (Port 8000)
   - Checks Flask Glyph Weaver (Port 5000)
   - Checks Gradio Truth Mirror (Port 7860)
   - Generates monitoring report artifact
   - Outputs: `status`, `fastapi_status`, `flask_status`, `gradio_status`

5. **🔄 Rollback** - Reverts to previous version (conditional)
   - Triggers on deployment failure or manual rollback action
   - Uses `scripts/runbook/rollback.sh` with version parameter
   - Validates version format for security
   - Outputs: `status` (completed/not_needed)

6. **🚨 Emergency Stop** - Immediate service halt (manual trigger only)
   - Triggers only via manual dispatch with `action=emergency-stop`
   - Stops all services on ports 8000, 5000, 7860
   - Terminates related Node.js/Next.js processes
   - Uses `scripts/runbook/emergency-stop.sh`

7. **📝 Update Status Issue** - Maintains live status tracking
   - Always runs after all jobs complete
   - Finds or creates issue: "🤖 AI Agent Autonomous Runbook Status"
   - Updates issue with latest job statuses and system health
   - Provides AI agent instructions for monitoring and operations

#### Manual Workflow Dispatch Actions

The workflow supports manual triggering via GitHub Actions UI with these actions:

```bash
# Update status (default action)
gh workflow run "ai-agent-handoff-runbook.yml" -f action=update-status

# Rollback to specific version
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=rollback \
  -f rollback_version="v1.2.3"

# Update specific component
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=update-component \
  -f target_component=fastapi

# Emergency stop all services
gh workflow run "ai-agent-handoff-runbook.yml" -f action=emergency-stop
```

**Available Components for Update**:
- `fastapi` - FastAPI Quantum Conduit
- `flask` - Flask Glyph Weaver
- `gradio` - Gradio Truth Mirror
- `all` - All components

#### Runbook Scripts

All operational scripts are located in `scripts/runbook/`:

##### health-check.sh

Health monitoring for all services.

**Usage**:
```bash
# Check all services
./scripts/runbook/health-check.sh all

# Check specific service
./scripts/runbook/health-check.sh fastapi
./scripts/runbook/health-check.sh flask
./scripts/runbook/health-check.sh gradio
```

**Environment Variables**:
- `FASTAPI_URL` - FastAPI service URL (default: http://localhost:8000)
- `FLASK_URL` - Flask service URL (default: http://localhost:5000)
- `GRADIO_URL` - Gradio service URL (default: http://localhost:7860)
- `HEALTH_CHECK_TIMEOUT` - Timeout in seconds (default: 5)

**Exit Codes**:
- `0` - All checked services are healthy
- `1` - One or more services are unavailable

##### update-component.sh

Updates specific system components.

**Usage**:
```bash
# Update all components
./scripts/runbook/update-component.sh all

# Update specific component
./scripts/runbook/update-component.sh fastapi
./scripts/runbook/update-component.sh flask
./scripts/runbook/update-component.sh gradio
```

**What it does**:
- Pulls latest component configuration
- Restarts the specified service(s)
- Validates service health after update

##### rollback.sh

Reverts to a previous deployment version.

**Usage**:
```bash
# Rollback to semantic version
./scripts/runbook/rollback.sh v1.2.3

# Rollback to commit hash
./scripts/runbook/rollback.sh abc1234

# Rollback to tag
./scripts/runbook/rollback.sh release-2024-01
```

**What it does**:
- Validates rollback version format (alphanumeric, dots, hyphens, underscores only)
- Creates a rollback branch
- Checks out the specified version
- Does NOT automatically push changes (manual verification required)

**Requirements**:
- Clean working directory
- Valid version identifier
- No path traversal characters allowed (security measure)

##### emergency-stop.sh

Immediately halts all services.

**Usage**:
```bash
./scripts/runbook/emergency-stop.sh
```

**What it does**:
- Stops processes on ports 8000 (FastAPI), 5000 (Flask), 7860 (Gradio)
- Uses SIGTERM first, then SIGKILL if needed
- Stops Next.js dev server if running for this project
- Provides detailed stop report

**When to use**:
- Critical security incident
- Service malfunction causing system instability
- Emergency maintenance required
- Deployment rollback needed immediately

**⚠️ Warning**: This stops all services immediately. Use only when necessary.

#### Status Issue

The runbook maintains a live GitHub issue titled "🤖 AI Agent Autonomous Runbook Status" with:

**Metadata**:
- Labels: `ai-agent`, `automated`, `runbook`
- Auto-updated every 6 hours or on deployment
- Contains latest workflow run ID and timestamp

**Sections**:
1. **Operational Status** - Overall system health (✅ OPERATIONAL, ⚠️ DEGRADED, 🔴 CRITICAL)
2. **Job Status Summary** - Table of all workflow jobs and their results
3. **System Health** - Individual service health status
4. **AI Agent Instructions** - Commands for monitoring, rollback, and updates
5. **Configuration** - Workflow behavior and auto-update schedule
6. **Emergency Procedures** - Critical action commands
7. **Monitoring Alerts** - Webhook notification setup instructions

**For AI Agents**: This issue provides all necessary context for operational decisions, deployment status, and available actions.

#### Monitoring Reports

Each workflow run generates monitoring artifacts:

**Download Monitoring Report**:
```bash
# Get report from specific run
gh run download <run_id> -n monitoring-report

# View latest run
gh run view --repo onenoly1010/quantum-pi-forge-fixed
```

**Report Contents**:
- `health-check.json` - Service health status with timestamp
- Format: JSON with service statuses (healthy/unavailable)
- Retention: 30 days

#### Best Practices for Runbook Usage

**For AI Agents**:
1. Always check the status issue before making deployment decisions
2. Use monitoring reports to verify service health
3. Prefer `update-component` over manual deployments
4. Document all emergency stop actions in issue comments
5. Verify rollback success before closing incidents

**For Developers**:
1. Test runbook scripts locally before deploying workflow changes
2. Keep script paths relative to repository root
3. Ensure all scripts have proper error handling
4. Update status issue manually if workflow fails
5. Never commit sensitive data to runbook scripts

**Security Considerations**:
- Rollback version validation prevents path traversal attacks
- Emergency stop targets only project-specific processes
- All script inputs are validated
- Workflow permissions are minimal (least privilege)
- Webhook URLs for notifications should be stored as secrets

#### Troubleshooting Runbook Issues

**Workflow doesn't trigger**:
- Check workflow is enabled in Actions settings
- Verify trigger conditions are met (branch, paths)
- Ensure required permissions are granted

**Health checks fail**:
- Services may not be running (expected on GitHub Actions runners)
- Check service URLs in environment variables
- Verify firewall/network access to services

**Rollback fails**:
- Ensure rollback_version is provided and valid
- Check that version/tag/commit exists in repository
- Verify working directory is clean

**Status issue not updating**:
- Check `issues: write` permission is granted
- Verify issue labels are correct
- Check GitHub API rate limits

**Emergency stop doesn't work**:
- Services may not be running
- Check port numbers match actual services
- Verify process identification patterns

#### Integration with Other Workflows

The AI Agent Runbook integrates with:
- **Next.js Build Workflow** - Triggered on completion
- **Agent Dispatch** - Triggered on completion
- **Vercel Deployments** - Referenced in deployment URL

This provides comprehensive coverage of the entire deployment pipeline.

### Deployment Checklist

Before deploying to production:
1. Test build locally: `npm run build`
2. Verify all environment variables are set in Vercel
3. Ensure sponsor wallet has sufficient MATIC and OINIO tokens
4. Test API endpoints on staging if available
5. Verify MetaMask integration works on target network

## Important Notes

- The project has a mixed codebase (TypeScript in `app/`, JavaScript in `src/`)
- Uses Next.js 14 App Router (not Pages Router)
- Smart contracts target multiple EVM chains
- Sponsor wallet must be funded with both MATIC (gas) and OINIO tokens
- The application is production-ready and deployed on Vercel

## Philosophy & Context

This project is built around the "Truth Movement" and "OINIO Soul System" concepts. Code and documentation may reference:
- Frequency harmonics (1010 Hz)
- Sovereign economy principles  
- Legacy/memorial node concepts
- Spiritual/consciousness frameworks

These are integral to the project's identity and should be respected in any changes.

## Dependency Management

### Adding New Dependencies

1. **Always check for security vulnerabilities** before adding packages
2. Use exact versions for production dependencies when possible
3. Test thoroughly after adding new packages
4. Update this documentation if the new dependency changes development workflow

```bash
# Add production dependency
npm install <package-name>

# Add dev dependency
npm install -D <package-name>

# Update all dependencies (use with caution)
npm update
```

### Key Dependency Notes

- `ethers@6.16.0` - Must remain on v6 for compatibility with current code
- `next@^14.0.0` - Using App Router (not Pages Router)
- `@radix-ui/*` - UI component library, part of shadcn/ui system
- Do not upgrade major versions without thorough testing

## Git Workflow

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Copilot branches: `copilot/task-description`

### Commit Messages

Follow conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add gasless staking API endpoint`

### What Not to Commit

See `.gitignore` for excluded files:
- `node_modules/` - Dependencies (install via npm)
- `.next/`, `out/`, `dist/`, `build/` - Build artifacts
- `.env.launch`, `.env.local`, `.env.*.local` - Environment variables (SENSITIVE)
- `logs/`, `*.log` - Log files
- IDE and OS-specific files

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom**: `npm run build` fails
**Solutions**:
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify environment variables are set

**Known Issue**: OpenTelemetry tracing dependencies may be missing in some branches. 
If you see errors about `@opentelemetry/*` packages, they can be safely ignored if tracing is not required, 
or install them with: `npm install @opentelemetry/sdk-trace-web @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources @opentelemetry/semantic-conventions @opentelemetry/instrumentation @opentelemetry/instrumentation-document-load @opentelemetry/instrumentation-fetch @opentelemetry/instrumentation-user-interaction @opentelemetry/instrumentation-xml-http-request @opentelemetry/context-zone`

#### 2. MetaMask Connection Issues

**Symptom**: Wallet won't connect or shows wrong network
**Solutions**:
- Ensure MetaMask is installed and unlocked
- Verify Polygon Mainnet is added to MetaMask (Chain ID: 137)
- Check that user is on the correct network
- Clear browser cache and cookies
- Check browser console for Web3 errors

#### 3. Gasless Transaction Failures

**Symptom**: Staking transactions fail with "insufficient funds" or timeout
**Solutions**:
- Verify sponsor wallet has MATIC for gas fees
- Verify sponsor wallet has OINIO tokens to transfer
- Check POLYGON_RPC_URL is accessible
- Verify OINIO_TOKEN_ADDRESS is correct
- Check amount is within limits (0.01 - 10000 OINIO)
- Inspect API logs in Vercel dashboard

#### 4. Smart Contract Compilation Issues

**Symptom**: `npx hardhat compile` fails
**Solutions**:
- Check Solidity version compatibility (0.5.16, 0.6.6, 0.8.20)
- Clear Hardhat cache: `rm -rf cache artifacts`
- Verify contract imports are correct
- Check `hardhat.config.ts` is properly configured

#### 5. Environment Variable Issues

**Symptom**: "Missing environment variable" errors
**Solutions**:
- For local development: Create `.env.local` file (never commit!)
- For Vercel: Set variables in Vercel dashboard (Settings → Environment Variables)
- Verify variable names match exactly (case-sensitive)
- Required variables:
  - `SPONSOR_PRIVATE_KEY` (Vercel only)
  - `POLYGON_RPC_URL` (Vercel only)
  - `OINIO_TOKEN_ADDRESS` (Vercel only)

#### 6. Type Errors in Mixed Codebase

**Symptom**: TypeScript errors when importing JavaScript modules
**Solutions**:
- Check that `allowJs: true` is set in `tsconfig.json`
- Add `.d.ts` type declaration files if needed
- Use `// @ts-ignore` sparingly for legacy code
- Consider migrating JavaScript files to TypeScript gradually

### Getting Help

If you encounter issues not covered here:
1. Check browser console for client-side errors
2. Check Vercel deployment logs for server-side errors
3. Verify all environment variables are correctly set
4. Review recent git commits for breaking changes
5. Check that dependencies are properly installed

## Best Practices Summary

✅ **DO**:
- Use TypeScript for new files in `app/` and `components/`
- Follow existing code patterns and conventions
- Test locally before pushing (`npm run build`)
- Use shadcn/ui components for consistency
- Validate user input on both client and server
- Keep private keys in environment variables only
- Document significant changes

❌ **DON'T**:
- Don't commit `.env.local` or private keys
- Don't remove or modify working code unnecessarily
- Don't change major dependency versions without testing
- Don't bypass security validations
- Don't hardcode sensitive values
- Don't mix styling approaches (stick to Tailwind)

## Creating Effective Issues for Copilot

When creating issues to assign to `@copilot`, follow these guidelines for best results:

### Issue Structure

**Title**: Clear, concise description of the task
```
✨ Add loading state to staking button
🐛 Fix MetaMask connection timeout
📝 Update API documentation for sponsor-transaction endpoint
```

**Description Should Include**:
1. **Problem Statement**: What needs to be done and why
2. **Acceptance Criteria**: Clear checklist of requirements
3. **Context**: Relevant files, components, or systems involved
4. **Constraints**: Any specific requirements or limitations
5. **Testing**: How to verify the changes work

### Example Issue Template

```markdown
## Problem
The staking button doesn't show a loading state, causing user confusion during transaction processing.

## Acceptance Criteria
- [ ] Button shows loading spinner when transaction is in progress
- [ ] Button is disabled during loading to prevent double-submission
- [ ] Loading text changes to "Processing..."
- [ ] Error states are handled appropriately
- [ ] Success state shows confirmation message

## Files to Modify
- `app/dashboard/page.tsx` - Add loading state logic
- `components/ui/button.tsx` - May need loading variant

## Testing
1. Connect MetaMask wallet
2. Enter staking amount
3. Click "Stake with Gasless Transaction"
4. Verify loading state appears immediately
5. Verify button re-enables after completion
```

### Labels to Use
- `copilot` - For tasks suitable for Copilot
- `bug` - For bug fixes
- `enhancement` - For new features
- `documentation` - For docs updates
- `good first issue` - For simple, well-defined tasks

### Tips for Better Results
- **Be Specific**: Instead of "improve UI", say "add loading spinner to submit button"
- **One Task per Issue**: Break large tasks into smaller, focused issues
- **Include Examples**: Reference similar patterns in the codebase
- **Set Boundaries**: Specify what should NOT be changed
- **Link Resources**: Include relevant documentation or screenshots

## Code Review Guidelines

When reviewing Copilot PRs:

### What to Check
1. **Correctness**: Does the code solve the stated problem?
2. **Style Consistency**: Does it match existing code patterns?
3. **Security**: Are there any security implications?
4. **Tests**: Are changes adequately tested?
5. **Documentation**: Is documentation updated if needed?
6. **Dependencies**: Are new dependencies necessary and secure?

### Providing Feedback
- Use inline comments for specific issues
- Mention `@copilot` in comments for clarification
- Request changes clearly with actionable feedback
- Approve when ready, but review as carefully as human PRs

### Iteration Cycle
1. Copilot creates initial PR
2. You review and leave comments
3. Copilot addresses feedback in new commits
4. Repeat until satisfied
5. Merge when all criteria are met

## Additional Resources

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [GitHub Copilot Coding Agent 101](https://github.blog/ai-and-ml/github-copilot/github-copilot-coding-agent-101-getting-started-with-agentic-workflows-on-github/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
