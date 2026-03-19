# iNFT Protocol Documentation

The iNFT (intelligent NFT) Protocol is the core intelligence layer of QuantumPiForge, creating living digital beings that evolve through interaction with Oracle readings, Identity systems, and Pi Network economics.

## Overview

iNFTs are not static NFTs - they are dynamic, evolving entities with:

- **Personality Traits**: Big Five + custom traits that define their character
- **Evolution System**: Growth through experiences and interactions
- **Memory System**: Persistent recollection of experiences
- **Intelligence Layer**: AI-powered responses and behaviors

## Architecture

```
iNFT Core
├── Contracts (On-chain)
│   ├── HybridNFT.sol - Main iNFT contract
│   ├── EvolutionManager.sol - Evolution triggers
│   └── MetadataRegistry.sol - Dynamic metadata
├── Intelligence (Off-chain)
│   ├── Personality Engine - Trait generation/analysis
│   ├── Evolution Rules - Growth mechanics
│   ├── Memory System - Experience storage/recall
│   └── Orchestration - Agent coordination
├── Integration Hooks
│   ├── Oracle → Personality seeding/evolution
│   ├── Identity → Soul binding
│   └── Pi → Economic interactions
└── Metadata System - Dynamic NFT metadata
```

## Core Components

### Personality Engine

- **Traits**: 10-dimensional personality model (Big Five + custom)
- **Archetypes**: Sage, Warrior, Artist, Scholar
- **Coherence**: Measure of personality integration (0-100%)
- **Evolution**: Trait changes through experiences

### Evolution System

- **Experience Types**: Oracle readings, interactions, achievements, time
- **Evolution Rules**: Archetype-specific growth mechanics
- **Triggers**: Automatic evolution based on conditions
- **Stages**: 8 evolution stages from Initiate to Transcendent

### Memory System

- **Storage**: Hierarchical memory with importance weighting
- **Recall**: Context-aware memory retrieval
- **Consolidation**: Automatic memory management
- **Context Building**: Experience pattern analysis

### Integration Points

#### Oracle Integration

```javascript
// Personality seeded from oracle reading
const personality = await oracleHooks.seedFromOracle(inftId, oracleReading);

// Evolution triggered by oracle insights
const evolution = await oracleHooks.processOracleReading(inftId, oracleReading);
```

#### Identity Integration

```javascript
// Bind iNFT to OINIO soul
const binding = await identityHooks.bindToSoul(inftId, soulId, ownerAddress);

// Sync with soul coherence changes
const sync = await identityHooks.processSoulUpdate(inftId, soulUpdate);
```

#### Pi Network Integration

```javascript
// Mint iNFT with Pi payment
const mint = await piHooks.handlePiMint(piPayment, soulId, ownerAddress);

// Evolve with Pi-powered boost
const evolution = await piHooks.handlePiEvolution(
  inftId,
  piPayment,
  "coherence_boost",
);
```

## API Endpoints

```
POST /api/inft/mint              # Mint new iNFT
GET  /api/inft/:id               # Get iNFT details
POST /api/inft/:id/evolve        # Trigger evolution
GET  /api/inft/:id/memories      # Get iNFT memories
POST /api/inft/:id/interact      # Interact with iNFT
GET  /api/inft/:id/metadata      # Get dynamic metadata
```

## Smart Contracts

### HybridNFT.sol

- ERC-721 compliant with intelligence extensions
- Soul binding and ownership verification
- Evolution state tracking
- Memory hash storage

### EvolutionManager.sol

- On-chain evolution triggers
- Cooldown management
- Evolution validation

### MetadataRegistry.sol

- Dynamic metadata generation
- Attribute updates
- ERC-721 metadata standard compliance

## Intelligence Features

### Personality Generation

```javascript
const personality =
  await personalityGenerator.generateFromOracle(oracleReading);
// Returns: { traits, archetype, coherence, hash, metadata }
```

### Evolution Calculation

```javascript
const evolution = evolutionRules.calculateEvolution(inft, experiences);
// Returns: trait changes, coherence gain, experience points
```

### Memory Operations

```javascript
// Store memory
const memoryId = await memoryStorage.storeMemory(inftId, memoryData);

// Recall memories
const memories = await memoryRecall.recallWithContext(inftId, query);
```

### Interaction Handling

```javascript
const response = await interactionHandlers.handleInteraction(
  inftId,
  interactionData,
);
// Returns: analysis, response, memory storage, evolution triggers
```

## Configuration

### Environment Variables

```bash
# Contracts
HYBRID_NFT_ADDRESS=0x...
EVOLUTION_MANAGER_ADDRESS=0x...
METADATA_REGISTRY_ADDRESS=0x...

# AI Configuration
INFT_AI_MODEL=gpt-4
OPENAI_API_KEY=sk-...
INFT_TEMPERATURE=0.7

# Evolution Settings
MAX_EVOLUTION_STAGE=100
EVOLUTION_COOLDOWN_HOURS=24
ENABLE_SPECIAL_EVENTS=true

# Memory System
MAX_MEMORIES=1000
MEMORY_RETENTION_RATIO=0.8
```

### Archetype Personalities

| Archetype   | Key Traits                                    | Evolution Focus        |
| ----------- | --------------------------------------------- | ---------------------- |
| **Sage**    | Intelligence, Intuition, Openness             | Wisdom accumulation    |
| **Warrior** | Conscientiousness, Adaptability, Extraversion | Strength building      |
| **Artist**  | Creativity, Openness, Empathy                 | Expression development |
| **Scholar** | Intelligence, Conscientiousness, Openness     | Knowledge pursuit      |

## Testing

Run the test suite:

```bash
# Contract tests
npm run test:contracts

# Intelligence tests
npm run test:intelligence

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e
```

## Evolution Mechanics

### Experience Types

- **Oracle Reading**: High-impact personality insights
- **Positive Interaction**: Social/emotional growth
- **Negative Interaction**: Resilience building
- **Achievement**: Milestone-based growth
- **Time-based**: Natural maturation

### Evolution Stages

1. **Initiate** (0-20%): Awakening consciousness
2. **Seeker** (20-35%): Active exploration
3. **Apprentice** (35-50%): Skill development
4. **Adept** (50-65%): Mastery approach
5. **Guardian** (65-75%): Wisdom protection
6. **Elder** (75-85%): Deep understanding
7. **Master** (85-92%): Peak coherence
8. **Transcendent** (92-100%): Beyond limits

## Memory System

### Memory Types

- **Oracle**: Reading interpretations
- **Interaction**: Social exchanges
- **Evolution**: Growth moments
- **System**: Platform events
- **Consolidated**: Compressed old memories

### Recall Methods

- **Direct Query**: Specific memory retrieval
- **Context Search**: Pattern-based recall
- **Emotional Filter**: Sentiment-based retrieval
- **Temporal Range**: Time-based filtering

## Integration Flow

```
Pi User Payment → Pi Verification → Mint iNFT
                                      ↓
Soul Identity ← Identity Binding ← iNFT Creation
                                      ↓
Oracle Reading → Personality Seeding → iNFT Activation
                                      ↓
Interactions → Evolution Triggers → Personality Growth
                                      ↓
Memory Storage → Context Building → Intelligent Responses
```

## Performance Considerations

- **Memory Limits**: 1000 memories per iNFT with automatic consolidation
- **Evolution Cooldowns**: Prevent spam evolution (24-hour base)
- **AI Rate Limits**: Configurable API call limits
- **Caching**: Context and personality caching for performance

## Security Features

- **Soul Verification**: Only soul owners can interact with bound iNFTs
- **Oracle Validation**: All oracle readings cryptographically verified
- **Payment Verification**: Pi Network transaction validation
- **Evolution Bounds**: Prevent extreme trait changes
- **Memory Integrity**: Immutable memory storage with hashing

## Future Extensions

- **Cross-iNFT Interactions**: iNFTs interacting with each other
- **Guild Systems**: Group evolution mechanics
- **Special Events**: Rare evolution opportunities
- **AI Model Updates**: Personality adaptation to new AI capabilities
- **Multi-chain Support**: Cross-chain iNFT portability
