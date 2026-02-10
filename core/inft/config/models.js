/**
 * AI Model Configuration
 * Configuration for different AI models used in iNFT intelligence
 */

const modelConfigs = {
  // OpenAI GPT models
  gpt4: {
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
    capabilities: ["personality_generation", "response_generation", "analysis"],
  },

  gpt35turbo: {
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    maxTokens: 1500,
    presencePenalty: 0.2,
    frequencyPenalty: 0.2,
    capabilities: ["personality_generation", "response_generation"],
  },

  // Anthropic Claude models
  claude2: {
    model: "claude-2",
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
    capabilities: [
      "personality_generation",
      "response_generation",
      "analysis",
      "evolution",
    ],
  },

  // Local models (for development/testing)
  local: {
    model: "local-llm",
    temperature: 0.6,
    maxTokens: 1000,
    capabilities: ["personality_generation", "response_generation"],
    endpoint: "http://localhost:8000/generate",
  },
};

/**
 * Get model config by name
 */
function getModelConfig(modelName) {
  return modelConfigs[modelName] || modelConfigs.gpt35turbo; // Default fallback
}

/**
 * Get models capable of specific task
 */
function getModelsForCapability(capability) {
  return Object.entries(modelConfigs)
    .filter(([, config]) => config.capabilities.includes(capability))
    .map(([name]) => name);
}

/**
 * Validate model configuration
 */
function validateModelConfig(config) {
  const required = ["model", "temperature", "maxTokens", "capabilities"];
  const missing = required.filter((field) => !config[field]);

  if (missing.length > 0) {
    throw new Error(`Invalid model config: missing ${missing.join(", ")}`);
  }

  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error("Temperature must be between 0 and 2");
  }

  if (config.maxTokens < 1) {
    throw new Error("maxTokens must be positive");
  }

  return true;
}

module.exports = {
  modelConfigs,
  getModelConfig,
  getModelsForCapability,
  validateModelConfig,
};
