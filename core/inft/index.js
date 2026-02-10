// iNFT Protocol - Unified Exports

// Smart Contracts (source files - compile with Hardhat)
const HybridNFT = "./contracts/HybridNFT.sol";
const EvolutionManager = "./contracts/EvolutionManager.sol";
const MetadataRegistry = "./contracts/MetadataRegistry.sol";

// Intelligence Systems
const PersonalityGenerator = require("./intelligence/personality/generator");
const PersonalityAnalyzer = require("./intelligence/personality/analyzer");
const EvolutionRules = require("./intelligence/evolution/rules");
const EvolutionTriggers = require("./intelligence/evolution/triggers");
const EvolutionHistory = require("./intelligence/evolution/history");
const MemoryStorage = require("./intelligence/memory/storage");
const MemoryRecall = require("./intelligence/memory/recall");
const MemoryContext = require("./intelligence/memory/context");
const AgentOrchestrator = require("./intelligence/orchestration/coordinator");
const InteractionHandlers = require("./intelligence/orchestration/handlers");
const ResponseGenerator = require("./intelligence/orchestration/responses");

// Integration Hooks
const OracleHooks = require("./integration/oracle-hooks");
const IdentityHooks = require("./integration/identity-hooks");
const PiHooks = require("./integration/pi-hooks");

// Metadata System
const MetadataGenerator = require("./metadata/generator");

// Types
const iNFTTypes = require("./types/inft");

// Configuration
const { modelConfigs, getModelConfig } = require("./config/models");
const { evolutionParams, getArchetypeParams } = require("./config/evolution");
const { inftConfig, validateINFTConfig } = require("./config/environment");

module.exports = {
  // Smart Contracts
  contracts: {
    HybridNFT,
    EvolutionManager,
    MetadataRegistry,
  },

  // Intelligence Systems
  intelligence: {
    personality: {
      generator: PersonalityGenerator,
      analyzer: PersonalityAnalyzer,
    },
    evolution: {
      rules: EvolutionRules,
      triggers: EvolutionTriggers,
      history: EvolutionHistory,
    },
    memory: {
      storage: MemoryStorage,
      recall: MemoryRecall,
      context: MemoryContext,
    },
    orchestration: {
      coordinator: AgentOrchestrator,
      handlers: InteractionHandlers,
      responses: ResponseGenerator,
    },
  },

  // Integration Hooks
  integration: {
    oracle: OracleHooks,
    identity: IdentityHooks,
    pi: PiHooks,
  },

  // Metadata System
  metadata: {
    generator: MetadataGenerator,
  },

  // Type Definitions
  types: iNFTTypes,

  // Configuration
  config: {
    models: { configs: modelConfigs, getModelConfig },
    evolution: { params: evolutionParams, getArchetypeParams },
    environment: inftConfig,
    validateConfig: validateINFTConfig,
  },

  // Utility Functions
  utils: {
    createINFT: async (creationData) => {
      const orchestrator = new AgentOrchestrator();
      return await orchestrator.coordinateINFTCreation(creationData);
    },

    evolveINFT: async (inftId, evolutionData) => {
      const orchestrator = new AgentOrchestrator();
      return await orchestrator.coordinateINFTEvolution(inftId, evolutionData);
    },

    interactWithINFT: async (inftId, interactionData) => {
      const orchestrator = new AgentOrchestrator();
      return await orchestrator.coordinateInteractionResponse(
        inftId,
        interactionData,
      );
    },
  },
};
