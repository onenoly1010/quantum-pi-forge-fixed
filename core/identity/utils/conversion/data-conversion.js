/**
 * Data Conversion Utilities
 * Functions for converting between different data formats
 * Extracted from oinio-backend
 */

const { ethers } = require('ethers');

/**
 * Convert contract Soul struct to API format
 */
function contractSoulToApi(soul) {
  return {
    soulId: soul.soulId,
    owner: soul.owner,
    piUid: soul.piUid,
    coherence: parseInt(soul.coherence.toString()),
    createdAt: parseInt(soul.createdAt.toString()),
    lastReading: parseInt(soul.lastReading.toString()),
    isActive: soul.isActive
  };
}

/**
 * Convert API soul data to database format
 */
function apiSoulToDatabase(soul) {
  return {
    ...soul,
    coherence: soul.coherence / 100, // Convert to 0-1 scale for storage
    createdAt: new Date(soul.createdAt * 1000).toISOString(),
    lastReading: new Date(soul.lastReading * 1000).toISOString()
  };
}

/**
 * Convert database soul data to API format
 */
function databaseSoulToApi(soul) {
  return {
    ...soul,
    coherence: Math.round(soul.coherence * 100), // Convert to 0-100 scale
    createdAt: Math.floor(new Date(soul.createdAt).getTime() / 1000),
    lastReading: Math.floor(new Date(soul.lastReading).getTime() / 1000)
  };
}

/**
 * Convert personality traits between scales
 */
function convertTraitScale(traits, fromScale = 'decimal', toScale = 'percentage') {
  const converted = {};

  for (const [trait, value] of Object.entries(traits)) {
    let convertedValue = value;

    if (fromScale === 'decimal' && toScale === 'percentage') {
      convertedValue = Math.round(value * 100);
    } else if (fromScale === 'percentage' && toScale === 'decimal') {
      convertedValue = value / 100;
    }

    converted[trait] = convertedValue;
  }

  return converted;
}

/**
 * Convert Pi profile to OINIO format
 */
function piProfileToOinio(piProfile) {
  return {
    displayName: piProfile.displayName || piProfile.username,
    bio: piProfile.bio || '',
    avatar: piProfile.avatar || null,
    socialLinks: {
      // Pi doesn't have direct social links, but we can add placeholders
    },
    metadata: {
      piVerified: piProfile.verified || false,
      accountAge: piProfile.accountAge || 0,
      transactionCount: piProfile.transactionCount || 0
    }
  };
}

/**
 * Convert claim data between formats
 */
function convertClaimFormat(claim, fromFormat = 'contract', toFormat = 'api') {
  if (fromFormat === 'contract' && toFormat === 'api') {
    return {
      claimId: claim.claimId,
      soulId: claim.soulId,
      claimant: claim.claimant,
      timestamp: parseInt(claim.timestamp.toString()),
      verified: claim.verified,
      type: claim.claimType || 'custom',
      content: {
        title: claim.title || 'Untitled Claim',
        description: claim.description || '',
        evidence: claim.evidence || []
      }
    };
  }

  if (fromFormat === 'api' && toFormat === 'contract') {
    return {
      soulId: claim.soulId,
      claimHash: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(claim.content))),
      title: claim.content.title,
      description: claim.content.description,
      claimType: claim.type,
      evidence: claim.content.evidence || []
    };
  }

  return claim;
}

/**
 * Serialize/deserialize soul data for storage
 */
function serializeSoulData(soulData) {
  return JSON.stringify(soulData, (key, value) => {
    // Handle BigInt serialization
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
}

function deserializeSoulData(soulJson) {
  return JSON.parse(soulJson, (key, value) => {
    // Convert numeric strings back to numbers where appropriate
    if (key === 'coherence' || key === 'createdAt' || key === 'lastReading') {
      return parseInt(value);
    }
    return value;
  });
}

module.exports = {
  contractSoulToApi,
  apiSoulToDatabase,
  databaseSoulToApi,
  convertTraitScale,
  piProfileToOinio,
  convertClaimFormat,
  serializeSoulData,
  deserializeSoulData
};