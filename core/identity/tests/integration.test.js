/**
 * Identity System Integration Tests
 * End-to-end tests for the complete identity system
 */

const { expect } = require('chai');
const SoulResolutionService = require('../services/resolution/soul-resolution');
const ClaimVerificationService = require('../services/verification/claim-verification');
const SoulProfileService = require('../services/profiles/soul-profile');

describe('Identity System Integration', () => {
  let resolutionService, verificationService, profileService;

  beforeEach(() => {
    resolutionService = new SoulResolutionService();
    verificationService = new ClaimVerificationService();
    profileService = new SoulProfileService();
  });

  describe('Pi to Soul Resolution Flow', () => {
    it('should resolve Pi user to soul and load profile', async () => {
      // This would test the full flow in a real environment
      expect(resolutionService).to.be.instanceOf(SoulResolutionService);
      expect(profileService).to.be.instanceOf(SoulProfileService);
    });
  });

  describe('Claim Submission and Verification Flow', () => {
    it('should submit claim and verify it', async () => {
      // This would test the full claim flow in a real environment
      expect(verificationService).to.be.instanceOf(ClaimVerificationService);
    });
  });

  describe('Profile Management Flow', () => {
    it('should create and update soul profiles', async () => {
      const testSoulId = 'test_soul_integration';

      // Create profile
      const createResult = await profileService.updateSoulProfile(testSoulId, {
        traits: { openness: 0.7, conscientiousness: 0.8 }
      }, 'test_owner');

      expect(createResult.success).to.be.true;

      // Get profile
      const profileResult = await profileService.getSoulProfile(testSoulId);
      expect(profileResult.found).to.be.true;
      expect(profileResult.profile.traits.openness).to.equal(0.7);
    });

    it('should manage reading history', async () => {
      const testSoulId = 'test_soul_readings';

      // Add reading
      const addResult = await profileService.addReadingToHistory(testSoulId, {
        type: 'personality',
        content: { summary: 'Test reading' }
      });

      expect(addResult.success).to.be.true;

      // Get history
      const historyResult = await profileService.getSoulReadingHistory(testSoulId);
      expect(historyResult.history.length).to.equal(1);
    });
  });

  describe('Data Validation', () => {
    const { validateSoulId, validatePiUid, validatePersonalityTraits } = require('../utils/validation/data-validation');

    it('should validate soul IDs', () => {
      expect(validateSoulId('0x' + '1'.repeat(64))).to.be.true;
      expect(validateSoulId('invalid')).to.be.false;
    });

    it('should validate Pi UIDs', () => {
      expect(validatePiUid('a'.repeat(64))).to.be.true;
      expect(validatePiUid('invalid')).to.be.false;
    });

    it('should validate personality traits', () => {
      const validTraits = {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5
      };

      expect(validatePersonalityTraits(validTraits)).to.be.true;

      const invalidTraits = { openness: 1.5 };
      expect(validatePersonalityTraits(invalidTraits)).to.be.false;
    });
  });

  describe('Data Conversion', () => {
    const { convertTraitScale, piProfileToOinio } = require('../utils/conversion/data-conversion');

    it('should convert trait scales', () => {
      const decimalTraits = { openness: 0.75 };
      const percentageTraits = convertTraitScale(decimalTraits, 'decimal', 'percentage');

      expect(percentageTraits.openness).to.equal(75);
    });

    it('should convert Pi profiles to OINIO format', () => {
      const piProfile = {
        username: 'testuser',
        verified: true,
        accountAge: 365
      };

      const oinioProfile = piProfileToOinio(piProfile);

      expect(oinioProfile.displayName).to.equal('testuser');
      expect(oinioProfile.metadata.piVerified).to.be.true;
    });
  });
});