# Copilot Instructions for Quantum Pi Forge

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
