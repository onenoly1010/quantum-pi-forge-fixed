// OINIO Identity System - Unified Exports

// Contracts
const SoulRegistry = require("./contracts/SoulRegistry.json");
const OGToken = require("./contracts/OGToken.json");
const Verification = require("./contracts/Verification.json");

// Services
const SoulResolutionService = require("./services/resolution/soul-resolution");
const ClaimVerificationService = require("./services/verification/claim-verification");
const SoulProfileService = require("./services/profiles/soul-profile");
const IdentityDatabase = require("./services/database/models");

// Types (for Node.js compatibility)
const SoulTypes = {
  Soul: {
    soulId: "string",
    owner: "string",
    piUid: "string",
    coherence: "number",
    createdAt: "number",
    lastReading: "number",
    isActive: "boolean",
  },
  Claim: {
    claimId: "string",
    soulId: "string",
    claimant: "string",
    timestamp: "number",
    verified: "boolean",
  },
};

// Utils
const cryptoUtils = require("./utils/signatures/crypto");
const dataValidation = require("./utils/validation/data-validation");
const dataConversion = require("./utils/conversion/data-conversion");

// Config
const networks = require("./config/networks");
const addresses = require("./config/addresses");
const {
  identityConfig,
  validateIdentityConfig,
} = require("./config/environment");

module.exports = {
  // Smart Contracts
  contracts: {
    SoulRegistry,
    OGToken,
    Verification,
  },

  // Backend Services
  services: {
    resolution: SoulResolutionService,
    verification: ClaimVerificationService,
    profiles: SoulProfileService,
    database: IdentityDatabase,
  },

  // Type Definitions
  types: SoulTypes,

  // Utilities
  utils: {
    crypto: cryptoUtils,
    validation: dataValidation,
    conversion: dataConversion,
  },

  // Configuration
  config: {
    networks,
    addresses,
    environment: identityConfig,
    validateConfig: validateIdentityConfig,
  },
};
