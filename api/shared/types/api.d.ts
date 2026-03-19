/**
 * TypeScript Type Definitions for QuantumPiForge Unified API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status: number;
    details?: any;
  };
  timestamp: string;
}

export interface User {
  id: string;
  authMethod: "pi" | "soul";
  permissions: UserPermissions;
  piUser?: PiUser;
  soul?: Soul;
  sessionId?: string;
}

export interface UserPermissions {
  canReadOwnData: boolean;
  canMintINFT: boolean;
  canEvolveINFT: boolean;
  canAccessOracle: boolean;
  isAdmin: boolean;
}

export interface PiUser {
  uid: string;
  username: string;
  accessToken?: string;
  email?: string;
}

export interface Soul {
  id: string;
  level: number;
  coherence: number;
  traits: PersonalityTraits;
  metadata: SoulMetadata;
  createdAt: string;
  lastActivity: string;
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

export interface SoulMetadata {
  archetype?: string;
  description?: string;
  preferences?: Record<string, any>;
  achievements?: string[];
}

export interface OracleReading {
  id: string;
  soulId: string;
  type: "personality" | "evolution" | "general";
  traits: PersonalityTraits;
  coherence: number;
  signature: string;
  context?: Record<string, any>;
  generatedAt: string;
}

export interface INFT {
  id: string;
  tokenId: string;
  soulId: string;
  personality: Personality;
  evolutionLevel: number;
  coherence: number;
  traits: PersonalityTraits;
  memory: INFTMemory;
  metadata: INFTMetadata;
  mintedAt: string;
  lastInteraction: string;
  evolutionHistory: EvolutionEvent[];
}

export interface Personality {
  archetype: string;
  traits: PersonalityTraits;
  coherence: number;
  description: string;
  strengths: string[];
  growthAreas: string[];
}

export interface INFTMemory {
  totalInteractions: number;
  recentInteractions: Interaction[];
  patterns: MemoryPattern[];
  coherence: number;
}

export interface Interaction {
  id: string;
  type: string;
  data: Record<string, any>;
  recordedAt: string;
}

export interface MemoryPattern {
  pattern: string;
  frequency: number;
  lastSeen: string;
  impact: number;
}

export interface INFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: INFTAttribute[];
  external_url?: string;
}

export interface INFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface EvolutionEvent {
  level: number;
  evolvedAt: string;
  trigger: string;
  traits: PersonalityTraits;
  coherence: number;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  createdAt: string;
  expiresAt?: string;
  verifiedAt?: string;
  txHash?: string;
  metadata?: Record<string, any>;
}

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export interface MintRequest {
  oracleReadingId: string;
  paymentTxHash: string;
  metadata?: Partial<INFTMetadata>;
}

export interface MintResult {
  inft: INFT;
  transaction: {
    hash: string;
    blockNumber: number;
    gasUsed: string;
  };
}

export interface EvolutionRequest {
  interactionData: {
    type: "oracle" | "user" | "time" | "achievement";
    data: Record<string, any>;
  };
}

export interface EvolutionResult {
  inftId: string;
  previousLevel: number;
  newLevel: number;
  evolvedTraits: PersonalityTraits;
  coherenceChange: number;
  trigger: string;
  evolvedAt: string;
  inft: Partial<INFT>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  components: Record<string, ComponentHealth>;
  system?: SystemInfo;
}

export interface ComponentHealth {
  status: "healthy" | "unhealthy";
  error?: string;
  [key: string]: any;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  loadAverage: number[];
  nodeVersion: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
  timestamp: string;
}

// Request/Response types for specific endpoints
export interface AuthLoginRequest {
  piToken?: string;
  soulSignature?: string;
}

export interface AuthLoginResponse {
  session: {
    id: string;
    expiresAt: string;
  };
  user: {
    authMethod: string;
    permissions: UserPermissions;
    piUser?: Partial<PiUser>;
    soul?: Partial<Soul>;
  };
}

export interface OracleReadingRequest {
  soulId: string;
  readingType?: "personality" | "evolution" | "general";
  context?: Record<string, any>;
}

export interface OracleReadingResponse {
  reading: {
    id: string;
    soulId: string;
    type: string;
    traits: PersonalityTraits;
    coherence: number;
    signature: string;
    context?: Record<string, any>;
    generatedAt: string;
  };
}

export interface MintINFTRequest {
  oracleReadingId: string;
  paymentTxHash: string;
  metadata?: Partial<INFTMetadata>;
}

export interface MintINFTResponse {
  inft: Partial<INFT>;
  transaction: {
    hash: string;
    blockNumber: number;
    gasUsed: string;
  };
}

// Service interfaces
export interface IAuthService {
  authenticateWithPi(piToken: string, soulSignature?: string): Promise<User>;
  authenticateWithSoul(soulSignature: string): Promise<User>;
  createSession(authData: any): Promise<any>;
  validateSession(sessionId: string): Promise<User>;
  getUserPermissions(user: User): UserPermissions;
}

export interface IOracleService {
  generateReading(
    soulId: string,
    type: string,
    context?: any,
  ): Promise<OracleReading>;
  getReading(readingId: string): Promise<OracleReading>;
  verifyReading(readingId: string, signature: string): Promise<boolean>;
}

export interface IMintingService {
  mintINFT(request: MintRequest): Promise<MintResult>;
}

export interface IEvolutionService {
  evolveINFT(
    inftId: string,
    evolutionData: EvolutionRequest,
  ): Promise<EvolutionResult>;
  getINFT(inftId: string): Promise<INFT>;
}

export interface IPaymentService {
  createPayment(request: any): Promise<Payment>;
  verifyPayment(
    paymentId: string,
    txHash: string,
    userId: string,
  ): Promise<any>;
  getPayment(paymentId: string): Promise<Payment>;
}
