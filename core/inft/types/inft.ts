/**
 * iNFT TypeScript Type Definitions
 * Type definitions for the iNFT protocol
 * Extracted and adapted from mr-nft-agent and oinio-contracts
 */

export interface iNFT {
  tokenId: string;
  soulId: string;
  personalityHash: string;
  coherence: number;
  evolutionStage: number;
  lastEvolution: number;
  creationTime: number;
  isActive: boolean;
  owner: string;
}

export interface Personality {
  traits: PersonalityTraits;
  archetype: Archetype;
  coherence: number;
  timestamp: number;
  version: string;
  evolutionCount?: number;
}

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  creativity: number;
  empathy: number;
  intelligence: number;
  intuition: number;
  adaptability: number;
}

export type Archetype = "sage" | "warrior" | "artist" | "scholar";

export interface EvolutionEvent {
  type: EvolutionType;
  changes: EvolutionChanges;
  triggers: string[];
  coherence: number;
  stage: number;
  metadata: Record<string, any>;
}

export type EvolutionType =
  | "oracle_reading"
  | "interaction"
  | "time_based"
  | "coherence_improvement"
  | "achievement_unlocked"
  | "soul_coherence_sync"
  | "pi_powered_evolution";

export interface EvolutionChanges {
  traitChanges: Partial<PersonalityTraits>;
  coherenceGain: number;
  experiencePoints: number;
}

export interface Memory {
  id: string;
  inftId: string;
  type: MemoryType;
  content: string;
  importance: number;
  emotional: number;
  tags: string[];
  context: Record<string, any>;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  consolidated: boolean;
}

export type MemoryType =
  | "oracle_reading"
  | "interaction"
  | "evolution"
  | "system_event"
  | "contract_interaction"
  | "social_interaction"
  | "personality_init"
  | "soul_binding"
  | "pi_minting";

export interface EvolutionTrigger {
  id: string;
  inftId: string;
  type: TriggerType;
  condition: TriggerCondition;
  action: TriggerAction;
  createdAt: number;
  activatedAt?: number;
  executedAt?: number;
  status: TriggerStatus;
  metadata: Record<string, any>;
}

export type TriggerType =
  | "time_based"
  | "coherence_based"
  | "interaction_based"
  | "oracle_based"
  | "identity_based"
  | "pi_based";

export interface TriggerCondition {
  timestamp?: number;
  delay?: number;
  coherenceThreshold?: number;
  interactionCount?: number;
  oracleReadings?: number;
  soulCoherenceThreshold?: number;
  piMilestone?: boolean;
}

export interface TriggerAction {
  type:
    | "evolve_personality"
    | "update_coherence"
    | "unlock_achievement"
    | "trigger_memory";
  experienceType?: string;
  intensity?: number;
  positivity?: number;
  coherenceGain?: number;
  achievementId?: string;
  memoryContent?: string;
}

export type TriggerStatus =
  | "pending"
  | "active"
  | "executed"
  | "failed"
  | "expired";

export interface iNFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url: string;
  attributes: MetadataAttribute[];
  properties: iNFTProperties;
}

export interface MetadataAttribute {
  trait_type: string;
  value: string | number;
  max_value?: number;
  display_type?: "number" | "boost_percentage" | "boost_number";
}

export interface iNFTProperties {
  inftId: string;
  soulId: string;
  archetype: Archetype;
  coherence: number;
  evolutionStage: number;
  creationTime: number;
  lastUpdated: number;
}

export interface InteractionData {
  type: InteractionType;
  interactor?: string;
  message?: string;
  oracleReading?: OracleReading;
  eventType?: string;
  eventData?: any;
  contractEvent?: ContractEvent;
  otherINFT?: string;
  interactionType?: string;
  userId?: string;
}

export type InteractionType =
  | "oracle_reading"
  | "user_message"
  | "system_event"
  | "contract_interaction"
  | "social_interaction";

export interface OracleReading {
  summary: string;
  traits?: Partial<PersonalityTraits>;
  intensity: number;
  positivity: number;
  timestamp: number;
}

export interface ContractEvent {
  event: string;
  from?: string;
  to?: string;
  tokenId?: string;
  data?: any;
}

export interface EvolutionRecommendation {
  type: string;
  reason: string;
  priority: "high" | "medium" | "low";
  expectedGain: number;
  cost?: number;
}

export interface iNFTContext {
  inftId: string;
  builtAt: number;
  personality: Personality;
  memories: MemoryContext;
  evolution: EvolutionContext;
  relationships: RelationshipContext;
  insights: string[];
}

export interface MemoryContext {
  totalMemories: number;
  recentMemories: Memory[];
  importantMemories: Memory[];
  memoryTypes: Record<string, number>;
  emotionalProfile: {
    average: number;
    range: { min: number; max: number };
    dominant: string;
  };
  temporalDistribution: Record<string, number>;
}

export interface EvolutionContext {
  currentStage: number;
  totalEvolutions: number;
  recentEvolutions: EvolutionEvent[];
  evolutionPatterns: any[];
  coherenceHistory: Array<{ timestamp: number; coherence: number }>;
  traitDevelopment: Record<string, Array<{ timestamp: number; value: number }>>;
}

export interface RelationshipContext {
  connectedINFTs: string[];
  ownerRelationship: any;
  communityConnections: any[];
  interactionPatterns: any;
}

export interface MintData {
  soulId: string;
  personalityHash: string;
  oracleReading?: OracleReading;
  piPayment?: PiPayment;
}

export interface PiPayment {
  txId: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
  piProfile: PiProfile;
}

export interface PiProfile {
  username: string;
  verified: boolean;
  accountAge: number;
  transactionCount: number;
}

export interface iNFTStats {
  totalMinted: number;
  byArchetype: Record<Archetype, number>;
  averageCoherence: number;
  averageEvolutionStage: number;
  topTraits: Array<{ trait: string; average: number }>;
}

export interface OrchestrationResult {
  taskId: string;
  success: boolean;
  inftId?: string;
  error?: string;
  [key: string]: any;
}
