/**
 * Soul Type Definitions
 * TypeScript type definitions for OINIO identity system
 * Extracted and adapted from oinio-backend and oinio-contracts
 */

export interface Soul {
  soulId: string;
  owner: string;
  piUid: string;
  coherence: number;
  createdAt: number;
  lastReading: number;
  isActive: boolean;
}

export interface SoulProfile extends Soul {
  traits: PersonalityTraits;
  metadata: SoulMetadata;
  achievements: Achievement[];
  preferences: UserPreferences;
  readingHistory?: Reading[];
}

export interface PersonalityTraits {
  openness: number;        // 0-1 scale
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  creativity: number;
  empathy: number;
  intelligence: number;
}

export interface SoulMetadata {
  displayName?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  socialLinks?: SocialLinks;
  customFields?: Record<string, any>;
}

export interface SocialLinks {
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserPreferences {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showTraits: boolean;
  showReadings: boolean;
  allowContact: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  readingReminders: boolean;
  achievementAlerts: boolean;
}

export interface Reading {
  readingId: string;
  timestamp: number;
  oracleId: string;
  type: ReadingType;
  content: ReadingContent;
  accuracy: number;
  coherence: number;
}

export type ReadingType =
  | 'personality'
  | 'compatibility'
  | 'future'
  | 'past'
  | 'present'
  | 'custom';

export interface ReadingContent {
  summary: string;
  details: string;
  insights: string[];
  recommendations: string[];
  traits?: Partial<PersonalityTraits>;
}

export interface Claim {
  claimId: string;
  soulId: string;
  claimHash: string;
  claimant: string;
  timestamp: number;
  verified: boolean;
  type: ClaimType;
  content: ClaimContent;
}

export type ClaimType =
  | 'identity'
  | 'achievement'
  | 'experience'
  | 'skill'
  | 'custom';

export interface ClaimContent {
  title: string;
  description: string;
  evidence?: string[];
  verificationMethod?: string;
}

export interface PiIdentity {
  username: string;
  uid: string;
  profile?: PiProfile;
  linkedSouls: string[];
  trustScore: number;
  verified: boolean;
}

export interface PiProfile {
  displayName?: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  accountAge: number;
  transactionCount: number;
}

export interface IdentityResolution {
  piUid: string;
  soulId?: string;
  resolved: boolean;
  method: 'existing' | 'created' | 'failed';
  timestamp: number;
  error?: string;
}

export interface VerificationResult {
  valid: boolean;
  confidence: number;
  method: string;
  timestamp: number;
  details?: any;
}