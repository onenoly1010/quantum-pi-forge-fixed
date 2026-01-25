/**
 * Claim Verification Service
 * Verifies soul claims and signatures
 * Extracted from oinio-backend repository
 */

const { ethers } = require('ethers');
const VerificationABI = require('../contracts/VerificationABI.json');

class ClaimVerificationService {
  constructor() {
    this.contractAddress = process.env.VERIFICATION_CONTRACT_ADDRESS;
    this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    this.contract = new ethers.Contract(this.contractAddress, VerificationABI, this.provider);
  }

  /**
   * Submit a claim for verification
   */
  async submitClaim(soulId, claimData, signer) {
    try {
      // Hash the claim data
      const claimHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(claimData)));

      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.submitClaim(soulId, claimHash);

      const receipt = await tx.wait();

      // Extract claim ID from event
      const event = receipt.events.find(e => e.event === 'ClaimSubmitted');
      const claimId = event.args.claimId;

      return { success: true, claimId, txHash: tx.hash };
    } catch (error) {
      console.error('Error submitting claim:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify a claim (oracle function)
   */
  async verifyClaim(claimId, isValid, signer) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.verifyClaim(claimId, isValid);

      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error verifying claim:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify soul signature
   */
  async verifySoulSignature(soulId, signature, message) {
    try {
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));

      const isValid = await this.contract.verifySoulSignature(soulId, signature, messageHash);

      return { valid: isValid };
    } catch (error) {
      console.error('Error verifying soul signature:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get claim details
   */
  async getClaimDetails(claimId) {
    try {
      const claim = await this.contract.getClaim(claimId);

      return {
        found: claim.claimant !== ethers.ZeroAddress,
        claimId,
        soulId: claim.soulId,
        claimant: claim.claimant,
        timestamp: claim.timestamp,
        verified: claim.verified
      };
    } catch (error) {
      console.error('Error getting claim details:', error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Check signature verification status
   */
  async isSignatureVerified(signatureHash) {
    try {
      return await this.contract.isSignatureVerified(signatureHash);
    } catch (error) {
      console.error('Error checking signature verification:', error);
      return false;
    }
  }

  /**
   * Mark signature as verified (oracle function)
   */
  async markSignatureVerified(signatureHash, signer) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.markSignatureVerified(signatureHash);

      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error marking signature verified:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ClaimVerificationService;