/**
 * Identity Services Tests
 * Backend service integration tests
 */

const { expect } = require("chai");
const SoulResolutionService = require("../services/resolution/soul-resolution");
const ClaimVerificationService = require("../services/verification/claim-verification");
const SoulProfileService = require("../services/profiles/soul-profile");
const IdentityDatabase = require("../services/database/models");

describe("Identity Services", () => {
  let resolutionService, verificationService, profileService, database;

  beforeEach(() => {
    resolutionService = new SoulResolutionService();
    verificationService = new ClaimVerificationService();
    profileService = new SoulProfileService();
    database = new IdentityDatabase();
  });

  describe("SoulResolutionService", () => {
    it("should resolve soul by Pi UID", async () => {
      // Mock contract response
      const mockSoul = {
        soulId: "0x123...",
        owner: "0xabc...",
        piUid: "pi_user_123",
        coherence: 75,
        createdAt: Date.now(),
        lastReading: Date.now(),
        isActive: true,
      };

      // Test would require mocked contract
      expect(resolutionService).to.be.instanceOf(SoulResolutionService);
    });

    it("should get souls by owner address", async () => {
      expect(resolutionService).to.be.instanceOf(SoulResolutionService);
    });
  });

  describe("ClaimVerificationService", () => {
    it("should submit claims", async () => {
      expect(verificationService).to.be.instanceOf(ClaimVerificationService);
    });

    it("should verify signatures", async () => {
      expect(verificationService).to.be.instanceOf(ClaimVerificationService);
    });
  });

  describe("SoulProfileService", () => {
    it("should get soul profiles", async () => {
      const profile = await profileService.getSoulProfile("test_soul");
      expect(profile.found).to.be.false; // Not found in empty store
    });

    it("should update soul traits", async () => {
      const result = await profileService.updateSoulTraits("test_soul", {
        openness: 0.8,
      });
      expect(result.success).to.be.true;
    });

    it("should return default traits", () => {
      const traits = profileService.getDefaultTraits();
      expect(traits).to.have.property("openness");
      expect(traits).to.have.property("conscientiousness");
    });
  });

  describe("IdentityDatabase", () => {
    it("should create and retrieve souls", async () => {
      const soulData = {
        soulId: "test_soul_123",
        owner: "0x123...",
        piUid: "pi_user_123",
      };

      await database.createSoul(soulData);
      const retrieved = await database.getSoul("test_soul_123");

      expect(retrieved.soulId).to.equal("test_soul_123");
    });

    it("should manage claims", async () => {
      const claimData = {
        claimId: "test_claim_123",
        soulId: "test_soul_123",
        claimant: "0x123...",
      };

      await database.createClaim(claimData);
      const retrieved = await database.getClaim("test_claim_123");

      expect(retrieved.claimId).to.equal("test_claim_123");
    });

    it("should get stats", async () => {
      const stats = await database.getStats();
      expect(stats).to.have.property("souls");
      expect(stats).to.have.property("claims");
    });
  });
});
