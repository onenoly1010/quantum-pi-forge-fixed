import { createOpenAI } from '@ai-sdk/openai';

/**
 * AI Provider Configuration for Quantum Pi Forge
 * 
 * Supports both direct OpenAI and Vercel AI Gateway
 */

// Direct OpenAI provider
export const openaiDirect = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel AI Gateway provider (for caching, rate limiting, analytics)
export const openaiGateway = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1',
});

// Default provider - uses gateway if configured, otherwise direct
export const getAIProvider = () => {
  if (process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_URL) {
    return openaiGateway;
  }
  return openaiDirect;
};

// Available models
export const AI_MODELS = {
  // OpenAI models
  GPT4O: 'gpt-4o',
  GPT4_TURBO: 'gpt-4-turbo',
  GPT35_TURBO: 'gpt-3.5-turbo',
  
  // For embeddings
  EMBEDDING_SMALL: 'text-embedding-3-small',
  EMBEDDING_LARGE: 'text-embedding-3-large',
} as const;

// System prompts for different contexts
export const SYSTEM_PROMPTS = {
  GENERAL: `You are the Quantum Pi Forge AI Assistant, a sovereign guide for the Truth Movement and OINIO Soul System.`,
  
  STAKING: `You are a blockchain expert specializing in OINIO token staking, gasless transactions, and Polygon network operations.`,
  
  ONBOARDING: `You are a welcoming guide helping new users understand the Quantum Pi Forge ecosystem, Pi Network integration, and the Truth Movement values.`,
  
  TECHNICAL: `You are a technical support AI for the Quantum Pi Forge platform, helping with MetaMask connections, transaction issues, and blockchain interactions.`,
} as const;
