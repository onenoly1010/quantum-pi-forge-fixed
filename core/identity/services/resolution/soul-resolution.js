/**
 * Soul Resolution Service
 * Resolves Pi Network UIDs to OINIO Soul IDs
 * Extracted from oinio-backend repository
 */

const { ethers } = require("ethers");
const SoulRegistryABI = require("../contracts/SoulRegistryABI.json");

class SoulResolutionService {
  constructor() {
    this.contractAddress = process.env.SOUL_REGISTRY_ADDRESS;
    this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    this.contract = new ethers.Contract(
      this.contractAddress,
      SoulRegistryABI,
      this.provider,
    );
  }

  /**
   * Resolve Pi UID to OINIO Soul ID
   */
  async resolveSoulByPiUid(piUid) {
    try {
      const soul = await this.contract.getSoulByPiUid(piUid);

      if (!soul.isActive) {
        return { found: false, error: "Soul not found or inactive" };
      }

      return {
        found: true,
        soulId: soul.soulId,
        owner: soul.owner,
        coherence: soul.coherence,
        createdAt: soul.createdAt,
        lastReading: soul.lastReading,
      };
    } catch (error) {
      console.error("Error resolving soul by Pi UID:", error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Resolve address to soul IDs
   */
  async resolveSoulsByAddress(address) {
    try {
      const soulIds = await this.contract.getSoulsByOwner(address);

      const souls = [];
      for (const soulId of soulIds) {
        const soul = await this.contract.getSoul(soulId);
        if (soul.isActive) {
          souls.push({
            soulId: soul.soulId,
            piUid: soul.piUid,
            coherence: soul.coherence,
            createdAt: soul.createdAt,
            lastReading: soul.lastReading,
          });
        }
      }

      return { found: true, souls };
    } catch (error) {
      console.error("Error resolving souls by address:", error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Check if soul exists
   */
  async soulExists(soulId) {
    try {
      return await this.contract.soulExists(soulId);
    } catch (error) {
      console.error("Error checking soul existence:", error);
      return false;
    }
  }

  /**
   * Get soul details
   */
  async getSoulDetails(soulId) {
    try {
      const soul = await this.contract.getSoul(soulId);

      if (!soul.isActive) {
        return { found: false, error: "Soul not found or inactive" };
      }

      return {
        found: true,
        soulId: soul.soulId,
        owner: soul.owner,
        piUid: soul.piUid,
        coherence: soul.coherence,
        createdAt: soul.createdAt,
        lastReading: soul.lastReading,
      };
    } catch (error) {
      console.error("Error getting soul details:", error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Create new soul for Pi user (called by oracle)
   */
  async createSoulForPiUser(piUid, ownerAddress, signer) {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.mintSoul(piUid, ownerAddress);

      const receipt = await tx.wait();

      // Extract soul ID from event
      const event = receipt.events.find((e) => e.event === "SoulMinted");
      const soulId = event.args.soulId;

      return { success: true, soulId, txHash: tx.hash };
    } catch (error) {
      console.error("Error creating soul for Pi user:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SoulResolutionService;
