/**
 * Claim Type Definitions
 * TypeScript types for claims and verification
 */

export interface Claim {
  claimId: string;
  soulId: string;
  claimHash: string;
  claimant: string;
  timestamp: number;
  verified: boolean;
  type: ClaimType;
  content: ClaimContent;
  verification?: VerificationResult;
}

export type ClaimType =
  | "identity"
  | "achievement"
  | "experience"
  | "skill"
  | "endorsement"
  | "custom";

export interface ClaimContent {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  evidence?: Evidence[];
  metadata?: Record<string, any>;
}

export interface Evidence {
  type: "text" | "image" | "document" | "link" | "witness";
  content: string;
  url?: string;
  verified?: boolean;
}

export interface VerificationResult {
  verified: boolean;
  verifier: string;
  method: VerificationMethod;
  confidence: number;
  timestamp: number;
  evidence?: string;
  notes?: string;
}

export type VerificationMethod =
  | "oracle"
  | "community"
  | "automated"
  | "manual"
  | "blockchain";

export interface ClaimSubmission {
  soulId: string;
  type: ClaimType;
  content: ClaimContent;
  signature?: string;
}

export interface ClaimVerificationRequest {
  claimId: string;
  verifier: string;
  method: VerificationMethod;
  evidence?: string;
}

export interface ClaimSearchFilters {
  soulId?: string;
  type?: ClaimType;
  verified?: boolean;
  claimant?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  tags?: string[];
}

export interface ClaimStats {
  totalClaims: number;
  verifiedClaims: number;
  pendingClaims: number;
  rejectedClaims: number;
  averageVerificationTime: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}
