/**
 * Cryptographic Signature Utilities
 * Helper functions for signature creation and verification
 * Extracted from oinio-backend
 */

const { ethers } = require("ethers");

/**
 * Sign a message with Ethereum private key
 */
function signMessage(message, privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(message);
}

/**
 * Verify an Ethereum signature
 */
function verifySignature(message, signature, expectedAddress) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Create soul signature for claims
 */
function createSoulSignature(soulId, claimData, privateKey) {
  const message = `OINIO Soul Claim\nSoul ID: ${soulId}\nClaim: ${JSON.stringify(claimData)}\nTimestamp: ${Date.now()}`;
  return signMessage(message, privateKey);
}

/**
 * Verify soul signature for claims
 */
function verifySoulSignature(soulId, claimData, signature, soulOwnerAddress) {
  const message = `OINIO Soul Claim\nSoul ID: ${soulId}\nClaim: ${JSON.stringify(claimData)}\nTimestamp: ${claimData.timestamp || Date.now()}`;
  return verifySignature(message, signature, soulOwnerAddress);
}

/**
 * Hash claim data for storage
 */
function hashClaimData(claimData) {
  const dataString = JSON.stringify(claimData, Object.keys(claimData).sort());
  return ethers.keccak256(ethers.toUtf8Bytes(dataString));
}

/**
 * Generate deterministic soul ID from Pi UID
 */
function generateSoulId(piUid, ownerAddress, nonce = 0) {
  const input = `${piUid}:${ownerAddress}:${nonce}`;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

module.exports = {
  signMessage,
  verifySignature,
  createSoulSignature,
  verifySoulSignature,
  hashClaimData,
  generateSoulId,
};
