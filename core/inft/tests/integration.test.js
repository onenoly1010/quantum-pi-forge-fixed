/**
 * iNFT Integration Tests
 * Tests for cross-component integration
 */

const { expect } = require('chai');
const AgentOrchestrator = require('../intelligence/orchestration/coordinator');
const OracleHooks = require('../integration/oracle-hooks');
const IdentityHooks = require('../integration/identity-hooks');
const PiHooks = require('../integration/pi-hooks');

describe('iNFT Integration', () => {
  let orchestrator, oracleHooks, identityHooks, piHooks;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
    oracleHooks = new OracleHooks(orchestrator);
    identityHooks = new IdentityHooks(orchestrator);
    piHooks = new PiHooks(orchestrator);
  });

  describe('Oracle Integration', () => {
    it('should seed personality from oracle reading', async () => {
      const inftId = 'test_inft';
      const oracleReading = {
        summary: 'A soul of great wisdom and insight',
        traits: { intelligence: 0.9, intuition: 0.8 },
        intensity: 0.8,
        positivity: 0.7
      };

      const result = await oracleHooks.seedFromOracle(inftId, oracleReading);

      expect(result.success).to.be.true;
      expect(result).to.have.property('personality');
      expect(result).to.have.property('analysis');
      expect(result.triggers).to.include('oracle_reading');
    });

    it('should process oracle reading for evolution', async () => {
      const inftId = 'test_inft';
      const oracleReading = {
        summary: 'Evolution through understanding',
        intensity: 0.7,
        positivity: 0.8
      };

      const result = await oracleHooks.processOracleReading(inftId, oracleReading);

      expect(result.success).to.be.true;
      expect(result).to.have.property('evolution');
      expect(result.memoryStored).to.be.true;
    });

    it('should get oracle evolution recommendations', async () => {
      const inftId = 'test_inft';

      const result = await oracleHooks.getOracleEvolutionRecommendations(inftId);

      expect(result.success).to.be.true;
      expect(result).to.have.property('recommendations');
      expect(Array.isArray(result.recommendations)).to.be.true;
    });
  });

  describe('Identity Integration', () => {
    it('should bind iNFT to soul', async () => {
      const inftId = 'test_inft';
      const soulId = 'test_soul';
      const ownerAddress = '0x123...';

      const result = await identityHooks.bindToSoul(inftId, soulId, ownerAddress);

      expect(result.success).to.be.true;
      expect(result.soulId).to.equal(soulId);
      expect(result.ownerAddress).to.equal(ownerAddress);
    });

    it('should process soul updates', async () => {
      const inftId = 'test_inft';
      const soulUpdate = {
        soulId: 'test_soul',
        traitChanges: { intelligence: 0.1 },
        coherenceChange: 5
      };

      const result = await identityHooks.processSoulUpdate(inftId, soulUpdate);

      expect(result.success).to.be.true;
      expect(result.traitsUpdated).to.be.true;
    });

    it('should get identity evolution recommendations', async () => {
      const inftId = 'test_inft';
      const soulData = {
        coherence: 0.8,
        traits: { intelligence: 0.7 }
      };

      const result = await identityHooks.getSoulEvolutionRecommendations(inftId, soulData);

      expect(result.success).to.be.true;
      expect(result).to.have.property('recommendations');
    });
  });

  describe('Pi Network Integration', () => {
    it('should handle Pi payment for minting', async () => {
      const piPayment = {
        txId: 'pi_tx_123',
        amount: 0.05,
        fromAddress: 'pi_user_123',
        toAddress: 'contract_address',
        piProfile: {
          username: 'testuser',
          verified: true,
          accountAge: 365,
          transactionCount: 50
        }
      };

      const result = await piHooks.handlePiMint(piPayment, 'soul_123', 'owner_address');

      expect(result.success).to.be.true;
      expect(result).to.have.property('inftId');
      expect(result).to.have.property('personality');
      expect(result.piPaymentVerified).to.be.true;
    });

    it('should handle Pi payment for evolution', async () => {
      const inftId = 'test_inft';
      const piPayment = {
        txId: 'pi_evolution_tx',
        amount: 0.03,
        fromAddress: 'pi_user_123',
        toAddress: 'contract_address',
        piProfile: {
          username: 'testuser',
          verified: true
        }
      };

      const result = await piHooks.handlePiEvolution(inftId, piPayment, 'coherence_boost');

      expect(result.success).to.be.true;
      expect(result).to.have.property('evolution');
      expect(result.piPaymentVerified).to.be.true;
    });

    it('should process Pi identity for personalization', async () => {
      const inftId = 'test_inft';
      const piProfile = {
        username: 'wisdom_seeker',
        verified: true,
        accountAge: 730, // 2 years
        transactionCount: 200
      };

      const result = await piHooks.processPiIdentity(inftId, piProfile);

      expect(result.success).to.be.true;
      expect(result).to.have.property('personalityUpdate');
      expect(result).to.have.property('traitsIntegrated');
    });

    it('should get Pi-powered evolution recommendations', async () => {
      const inftId = 'test_inft';
      const piProfile = {
        verified: true,
        accountAge: 365,
        transactionCount: 100
      };

      const result = await piHooks.getPiEvolutionRecommendations(inftId, piProfile);

      expect(result.success).to.be.true;
      expect(result).to.have.property('recommendations');
      // Should have recommendations for verified user with high transaction count
      expect(result.recommendations.length).to.be.greaterThan(0);
    });
  });

  describe('Full Orchestration Flow', () => {
    it('should coordinate complete iNFT creation', async () => {
      const creationData = {
        inftId: 'test_inft_full',
        soulId: 'test_soul_full',
        ownerAddress: 'test_owner',
        personality: {
          archetype: 'sage',
          coherence: 0.7
        },
        oracleReading: {
          summary: 'A soul ready for creation',
          intensity: 0.8,
          positivity: 0.9
        }
      };

      const result = await orchestrator.coordinateINFTCreation(creationData);

      expect(result.success).to.be.true;
      expect(result.inftId).to.equal('test_inft_full');
      expect(result).to.have.property('personality');
      expect(result).to.have.property('analysis');
      expect(result).to.have.property('triggers');
    });

    it('should coordinate iNFT evolution', async () => {
      const inftId = 'test_inft_evolution';
      const evolutionData = {
        type: 'oracle_reading',
        intensity: 0.7,
        positivity: 0.8,
        oracleData: {
          summary: 'Evolution through insight'
        }
      };

      const result = await orchestrator.coordinateINFTEvolution(inftId, evolutionData);

      expect(result.success).to.be.true;
      expect(result.inftId).to.equal(inftId);
      expect(result).to.have.property('evolution');
      expect(result).to.have.property('validation');
    });

    it('should handle interaction responses', async () => {
      const inftId = 'test_inft_interaction';
      const interactionData = {
        type: 'oracle_reading',
        oracleReading: {
          summary: 'Interactive oracle reading',
          intensity: 0.6,
          positivity: 0.7
        }
      };

      const result = await orchestrator.coordinateInteractionResponse(inftId, interactionData);

      expect(result.success).to.be.true;
      expect(result.inftId).to.equal(inftId);
      expect(result).to.have.property('interactionAnalysis');
      expect(result).to.have.property('personalityResponse');
    });
  });

  describe('Cross-System Validation', () => {
    it('should validate oracle reading data', () => {
      const validReading = {
        summary: 'Valid reading',
        intensity: 0.8,
        positivity: 0.7
      };

      const validation = oracleHooks.validateOracleReading(validReading);
      expect(validation.valid).to.be.true;

      const invalidReading = {
        intensity: 1.5, // Invalid intensity
        positivity: 0.7
      };

      const invalidValidation = oracleHooks.validateOracleReading(invalidReading);
      expect(invalidValidation.valid).to.be.false;
    });

    it('should validate soul data', () => {
      const validSoulData = {
        soulId: 'valid_soul',
        owner: '0x1234567890123456789012345678901234567890',
        coherence: 0.8
      };

      const validation = identityHooks.validateSoulData(validSoulData);
      expect(validation.valid).to.be.true;

      const invalidSoulData = {
        // Missing required fields
        coherence: 1.5 // Invalid coherence
      };

      const invalidValidation = identityHooks.validateSoulData(invalidSoulData);
      expect(invalidValidation.valid).to.be.false;
    });

    it('should validate Pi payment data', () => {
      const validPayment = {
        txId: 'valid_tx',
        amount: 0.05,
        fromAddress: 'pi_user',
        toAddress: 'contract',
        piProfile: { username: 'test' }
      };

      const validation = piHooks.validatePiPaymentData(validPayment);
      expect(validation.valid).to.be.true;

      const invalidPayment = {
        amount: -0.01, // Invalid amount
        // Missing other required fields
      };

      const invalidValidation = piHooks.validatePiPaymentData(invalidPayment);
      expect(invalidValidation.valid).to.be.false;
    });
  });
});