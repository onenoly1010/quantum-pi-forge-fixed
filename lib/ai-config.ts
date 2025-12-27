import { createOpenAI } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';

/**
 * AI Provider Configuration for Quantum Pi Forge
 * 
 * Supports OpenAI, xAI (Grok), and Vercel AI Gateway
 */

// Direct OpenAI provider
export const openaiDirect = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Direct xAI provider (Grok)
export const xaiDirect = xai;

// Vercel AI Gateway provider (for caching, rate limiting, analytics)
// Supports multiple model providers: openai/, xai/, anthropic/, etc.
export const aiGateway = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1',
});

// xAI (Grok) via AI Gateway
export const xaiGateway = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.XAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1',
});

// Get AI provider - supports direct or gateway
export const getAIProvider = (provider: 'openai' | 'xai' = 'openai', useGateway = true) => {
  if (useGateway && process.env.AI_GATEWAY_API_KEY) {
    return aiGateway;
  }
  
  if (provider === 'xai') {
    return xaiDirect;
  }
  
  return openaiDirect;
};

// Get xAI model for direct SDK usage
export const getXAIModel = (modelId: string = 'grok-2-1212') => {
  return xai(modelId);
};

// Available models
export const AI_MODELS = {
  // OpenAI models (direct)
  GPT4O: 'gpt-4o',
  GPT4_TURBO: 'gpt-4-turbo',
  GPT35_TURBO: 'gpt-3.5-turbo',
  
  // xAI Grok models (direct)
  GROK_2: 'grok-2-1212',
  GROK_2_VISION: 'grok-2-vision-1212',
  GROK_3: 'grok-3',
  GROK_3_MINI: 'grok-3-mini',
  
  // Gateway models (with provider prefix)
  GATEWAY: {
    GPT4O: 'openai/gpt-4o',
    GROK_4: 'xai/grok-4',
    GROK_3: 'xai/grok-3',
    CLAUDE_4_SONNET: 'anthropic/claude-sonnet-4-20250514',
    CLAUDE_35_SONNET: 'anthropic/claude-3-5-sonnet-20241022',
  },
  
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
