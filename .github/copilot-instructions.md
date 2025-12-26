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

- No automated test suite is currently configured
- Manual testing is required for:
  - MetaMask wallet connection
  - Gasless staking transactions
  - Balance display accuracy
  - Responsive design on mobile
  - Error handling scenarios

## Deployment

- **Platform**: Vercel (connected to GitHub)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment**: Set all required env vars in Vercel dashboard

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
