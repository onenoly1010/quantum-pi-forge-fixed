# OINIO Identity System

The OINIO Identity System provides the core infrastructure for soul registration, verification, and profile management in the QuantumPiForge ecosystem.

## Overview

The identity system consists of three main components:

1. **Smart Contracts** - On-chain soul registry and verification
2. **Backend Services** - API services for identity resolution and management
3. **Type System** - TypeScript definitions for type safety

## Architecture

```
Pi User → [Pi Auth] → Identity Resolution → Soul Registry
                                      ↓
                            [Verification] ← Claim Submission
                                      ↓
                            [Profile Management] ← Trait Updates
```

## Environment Variables

### Required
```bash
# Contract Addresses
SOUL_REGISTRY_ADDRESS=0x...
OG_TOKEN_ADDRESS=0x...
VERIFICATION_ADDRESS=0x...

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com

# Database
DATABASE_URL=mongodb://localhost:27017/oinio-identity

# Security
JWT_SECRET=your-jwt-secret
```

### Optional
```bash
# Service Configuration
DB_MAX_CONNECTIONS=10
RESOLUTION_CACHE_TIMEOUT=300000
ENABLE_OG_REWARDS=true

# External APIs
PI_API_BASE_URL=https://api.pi.network
```

## Smart Contracts

### SoulRegistry.sol
- Core soul minting and ownership
- Pi UID to Soul ID mapping
- Coherence tracking and updates

### OGToken.sol
- OG status verification and rewards
- Reading incentives for OG users

### Verification.sol
- Claim submission and verification
- Soul signature validation

## Backend Services

### Resolution Service
- Pi UID → Soul ID resolution
- Multi-soul ownership support

### Verification Service
- Claim submission and blockchain verification
- Signature validation and proof generation

### Profile Service
- Soul metadata and trait management
- Reading history and achievements

## API Endpoints

```
GET  /api/identity/soul/:soulId          # Get soul details
GET  /api/identity/pi/:piUid            # Resolve Pi UID to soul
POST /api/identity/claim                # Submit verification claim
GET  /api/identity/profile/:soulId      # Get soul profile
PUT  /api/identity/profile/:soulId      # Update soul profile
```

## Integration Points

### Pi Network Integration
- Accepts Pi UIDs from `/integrations/pi/`
- Maps Pi profiles to OINIO soul data
- Verifies Pi wallet ownership

### Oracle Engine Integration
- Provides soul signatures for verification
- Receives trait updates from readings
- Supplies claim verification data

### Future iNFT Protocol
- Soul data feeds iNFT personality traits
- Verification claims support iNFT metadata
- OG status enables premium iNFT features

## Testing

Run the test suite:
```bash
# Contract tests
npm run test:contracts

# Service tests
npm run test:services

# Integration tests
npm run test:integration
```

## Deployment

1. Deploy contracts to Polygon network
2. Update contract addresses in environment
3. Run database migrations
4. Start backend services
5. Configure reverse proxy for API endpoints