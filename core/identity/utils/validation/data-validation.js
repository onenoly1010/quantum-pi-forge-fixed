/**
 * Data Validation Utilities
 * Validation functions for identity data
 * Extracted from oinio-backend
 */

/**
 * Validate soul ID format
 */
function validateSoulId(soulId) {
  if (!soulId || typeof soulId !== 'string') return false;

  // Soul IDs are 66-character hex strings (0x + 64 hex chars)
  const soulIdRegex = /^0x[a-fA-F0-9]{64}$/;
  return soulIdRegex.test(soulId);
}

/**
 * Validate Pi UID format
 */
function validatePiUid(piUid) {
  if (!piUid || typeof piUid !== 'string') return false;

  // Pi UIDs are typically hex strings, 64+ characters
  const piUidRegex = /^[a-fA-F0-9]{64,}$/;
  return piUidRegex.test(piUid);
}

/**
 * Validate Ethereum address
 */
function validateEthereumAddress(address) {
  if (!address || typeof address !== 'string') return false;

  // Check basic format
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) return false;

  // Checksum validation (EIP-55)
  try {
    return ethers.utils.getAddress(address) === address;
  } catch {
    return false;
  }
}

/**
 * Validate personality traits
 */
function validatePersonalityTraits(traits) {
  if (!traits || typeof traits !== 'object') return false;

  const requiredTraits = [
    'openness', 'conscientiousness', 'extraversion',
    'agreeableness', 'neuroticism'
  ];

  for (const trait of requiredTraits) {
    if (!(trait in traits)) return false;

    const value = traits[trait];
    if (typeof value !== 'number' || value < 0 || value > 1) {
      return false;
    }
  }

  return true;
}

/**
 * Validate claim data
 */
function validateClaimData(claimData) {
  if (!claimData || typeof claimData !== 'object') return false;

  // Required fields
  if (!claimData.title || !claimData.description) return false;
  if (!claimData.type || !['identity', 'achievement', 'experience', 'skill', 'custom'].includes(claimData.type)) return false;

  // Title and description length
  if (claimData.title.length < 3 || claimData.title.length > 100) return false;
  if (claimData.description.length < 10 || claimData.description.length > 1000) return false;

  return true;
}

/**
 * Validate reading data
 */
function validateReadingData(readingData) {
  if (!readingData || typeof readingData !== 'object') return false;

  // Required fields
  if (!readingData.type || !readingData.content) return false;

  // Validate reading type
  const validTypes = ['personality', 'compatibility', 'future', 'past', 'present', 'custom'];
  if (!validTypes.includes(readingData.type)) return false;

  // Validate content
  if (!readingData.content.summary || !readingData.content.details) return false;

  return true;
}

/**
 * Sanitize user input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 10000); // Max length
}

module.exports = {
  validateSoulId,
  validatePiUid,
  validateEthereumAddress,
  validatePersonalityTraits,
  validateClaimData,
  validateReadingData,
  sanitizeInput
};