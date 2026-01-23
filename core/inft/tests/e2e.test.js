/**
 * iNFT End-to-End Tests
 * Complete workflow tests from creation to evolution
 */

const { expect } = require('chai');
const AgentOrchestrator = require('../intelligence/orchestration/coordinator');
const OracleHooks = require('../integration/oracle-hooks');
const IdentityHooks = require('../integration/identity-hooks');
const PiHooks = require('../integration/pi-hooks');
const MetadataGenerator = require('../metadata/generator');

describe('iNFT End-to-End Workflows', () => {
  let orchestrator, oracleHooks, identityHooks, piHooks, metadataGenerator;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
    oracleHooks = new OracleHooks(orchestrator);
    identityHooks = new IdentityHooks(orchestrator);
    piHooks = new PiHooks(orchestrator);
    metadataGenerator = new MetadataGenerator();
  });

  describe('Complete iNFT Creation Flow', () => {
    it('should create iNFT from Pi payment with oracle seeding', async () => {
      // Step 1: Pi payment for minting
      const piPayment = {
        txId: 'pi_mint_tx_001',
        amount: 0.05,
        fromAddress: 'pi_user_sage',
        toAddress: 'inft_contract',
        piProfile: {
          username: 'wisdom_seeker',
          verified: true,
          accountAge: 365,
          transactionCount: 75
        }
      };

      const soulId = 'soul_sage_001';
      const ownerAddress = '0x1234567890123456789012345678901234567890';

      const mintResult = await piHooks.handlePiMint(piPayment, soulId, ownerAddress);
      expect(mintResult.success).to.be.true;
      expect(mintResult.piPaymentVerified).to.be.true;

      const inftId = mintResult.inftId;

      // Step 2: Bind to soul
      const bindResult = await identityHooks.bindToSoul(inftId, soulId, ownerAddress);
      expect(bindResult.success).to.be.true;
      expect(bindResult.traitsIntegrated).to.be.true;

      // Step 3: Oracle seeding
      const oracleReading = {
        summary: 'A soul of ancient wisdom seeking enlightenment through creation',
        traits: {
          intelligence: 0.85,
          intuition: 0.8,
          openness: 0.9,
          conscientiousness: 0.75
        },
        intensity: 0.9,
        positivity: 0.85
      };

      const seedResult = await oracleHooks.seedFromOracle(inftId, oracleReading);
      expect(seedResult.success).to.be.true;
      expect(seedResult.personality.archetype).to.equal('sage');

      // Step 4: Generate metadata
      const inftData = {
        inftId,
        soulId,
        coherence: seedResult.personality.coherence,
        creationTime: Date.now(),
        evolutionStage: 0
      };

      const metadata = metadataGenerator.generateMetadata(
        inftData,
        seedResult.personality,
        0
      );

      expect(metadata).to.have.property('name');
      expect(metadata).to.have.property('description');
      expect(metadata.attributes.length).to.be.greaterThan(0);
      expect(metadata.properties.archetype).to.equal('sage');
    });

    it('should evolve iNFT through multiple interactions', async () => {
      const inftId = 'test_evolution_flow';
      let coherence = 0.5;
      let evolutionStage = 0;

      // Initial setup
      const initialPersonality = orchestrator.personalityGenerator.generateRandom();
      coherence = initialPersonality.coherence;

      // Evolution 1: Oracle reading
      const oracleEvolution = await orchestrator.coordinateINFTEvolution(inftId, {
        type: 'oracle_reading',
        intensity: 0.8,
        positivity: 0.9,
        oracleData: { summary: 'Growth through insight' }
      });

      expect(oracleEvolution.success).to.be.true;
      coherence += oracleEvolution.evolution.coherenceGain / 100;
      evolutionStage += 1;

      // Evolution 2: Positive interaction
      const interactionEvolution = await orchestrator.coordinateINFTEvolution(inftId, {
        type: 'interaction_positive',
        intensity: 0.6,
        positivity: 0.8
      });

      expect(interactionEvolution.success).to.be.true;
      coherence += interactionEvolution.evolution.coherenceGain / 100;

      // Evolution 3: Achievement
      const achievementEvolution = await orchestrator.coordinateINFTEvolution(inftId, {
        type: 'achievement_unlocked',
        intensity: 1.0,
        positivity: 0.95
      });

      expect(achievementEvolution.success).to.be.true;
      coherence += achievementEvolution.evolution.coherenceGain / 100;
      evolutionStage += 1;

      // Verify progression
      expect(coherence).to.be.greaterThan(0.5); // Started at 0.5
      expect(evolutionStage).to.equal(2);

      // Check memory accumulation
      const memoryStats = orchestrator.memoryStorage.getMemoryStats(inftId);
      expect(memoryStats.totalMemories).to.be.at.least(3); // One per evolution
    });

    it('should handle complex multi-system interactions', async () => {
      const inftId = 'test_complex_flow';
      const soulId = 'complex_soul_001';

      // Step 1: Pi-powered creation with identity binding
      const piPayment = {
        txId: 'complex_pi_tx',
        amount: 0.08,
        fromAddress: 'complex_user',
        toAddress: 'inft_contract',
        piProfile: {
          username: 'complex_entity',
          verified: true,
          accountAge: 730,
          transactionCount: 150
        }
      };

      const creationResult = await piHooks.handlePiMint(piPayment, soulId, 'owner_address');
      expect(creationResult.success).to.be.true;

      // Step 2: Identity synchronization
      const soulUpdate = {
        soulId,
        traitChanges: { adaptability: 0.1, intelligence: 0.05 },
        coherenceChange: 3
      };

      const identityResult = await identityHooks.processSoulUpdate(inftId, soulUpdate);
      expect(identityResult.success).to.be.true;

      // Step 3: Oracle reading triggers evolution
      const oracleReading = {
        summary: 'Complex soul navigating multiple realities',
        traits: { adaptability: 0.15, creativity: 0.1 },
        intensity: 0.85,
        positivity: 0.75
      };

      const oracleResult = await oracleHooks.processOracleReading(inftId, oracleReading);
      expect(oracleResult.success).to.be.true;

      // Step 4: Memory consolidation check
      const memoryStats = orchestrator.memoryStorage.getMemoryStats(inftId);
      expect(memoryStats.totalMemories).to.be.at.least(3);

      // Step 5: Context building
      const context = await orchestrator.memoryContext.buildINFTContext(inftId);
      expect(context).to.have.property('personality');
      expect(context).to.have.property('memories');
      expect(context).to.have.property('evolution');
      expect(context.insights.length).to.be.greaterThan(0);
    });

    it('should maintain data consistency across systems', async () => {
      const inftId = 'test_consistency';
      const initialCoherence = 0.6;

      // Create iNFT with known state
      const creationResult = await orchestrator.coordinateINFTCreation({
        inftId,
        soulId: 'consistency_soul',
        ownerAddress: 'consistency_owner',
        personality: { archetype: 'scholar', coherence: initialCoherence }
      });

      expect(creationResult.success).to.be.true;

      // Apply multiple evolutions
      const evolutions = [
        { type: 'oracle_reading', intensity: 0.7, positivity: 0.8 },
        { type: 'interaction_positive', intensity: 0.5, positivity: 0.9 },
        { type: 'time_based', intensity: 0.3, positivity: 0.7 }
      ];

      let totalCoherenceGain = 0;

      for (const evolution of evolutions) {
        const result = await orchestrator.coordinateINFTEvolution(inftId, evolution);
        expect(result.success).to.be.true;
        totalCoherenceGain += result.evolution.coherenceGain;
      }

      // Verify final coherence is consistent
      const expectedFinalCoherence = Math.min(100, initialCoherence * 100 + totalCoherenceGain);
      expect(expectedFinalCoherence).to.be.at.least(initialCoherence * 100);

      // Verify memory consistency
      const memoryStats = orchestrator.memoryStorage.getMemoryStats(inftId);
      expect(memoryStats.totalMemories).to.equal(evolutions.length + 1); // +1 for creation

      // Verify evolution history consistency
      const evolutionStats = orchestrator.evolutionHistory.getEvolutionStats(inftId);
      expect(evolutionStats.totalEvolutions).to.equal(evolutions.length);
    });

    it('should handle error recovery gracefully', async () => {
      const inftId = 'test_error_recovery';

      // Attempt invalid operation
      try {
        await orchestrator.coordinateINFTEvolution(inftId, {
          type: 'invalid_type',
          intensity: 2.0, // Invalid intensity
          positivity: 1.5 // Invalid positivity
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).to.be.an('error');
      }

      // Verify system remains stable
      const memoryStats = orchestrator.memoryStorage.getMemoryStats(inftId);
      expect(memoryStats).to.be.an('object');

      const evolutionStats = orchestrator.evolutionHistory.getEvolutionStats(inftId);
      expect(evolutionStats).to.be.an('object');

      // Should still be able to perform valid operations
      const validResult = await orchestrator.coordinateINFTEvolution(inftId, {
        type: 'oracle_reading',
        intensity: 0.7,
        positivity: 0.8
      });

      expect(validResult.success).to.be.true;
    });
  });

  describe('Performance and Scaling', () => {
    it('should handle multiple concurrent iNFTs', async () => {
      const inftIds = ['perf_1', 'perf_2', 'perf_3', 'perf_4', 'perf_5'];
      const results = [];

      // Create multiple iNFTs concurrently
      const creationPromises = inftIds.map(inftId =>
        orchestrator.coordinateINFTCreation({
          inftId,
          soulId: `soul_${inftId}`,
          ownerAddress: `owner_${inftId}`,
          personality: { archetype: 'scholar', coherence: 0.5 }
        })
      );

      const creationResults = await Promise.all(creationPromises);
      creationResults.forEach(result => {
        expect(result.success).to.be.true;
        results.push(result);
      });

      expect(results.length).to.equal(5);

      // Verify isolation between iNFTs
      const memoryStats1 = orchestrator.memoryStorage.getMemoryStats('perf_1');
      const memoryStats2 = orchestrator.memoryStorage.getMemoryStats('perf_2');

      expect(memoryStats1.totalMemories).to.equal(memoryStats2.totalMemories);
    });

    it('should maintain performance with memory growth', async () => {
      const inftId = 'test_memory_performance';

      // Create iNFT
      await orchestrator.coordinateINFTCreation({
        inftId,
        soulId: 'perf_soul',
        ownerAddress: 'perf_owner'
      });

      // Add many memories
      const memoryPromises = [];
      for (let i = 0; i < 50; i++) {
        memoryPromises.push(
          orchestrator.coordinateMemoryOperation(inftId, 'store', {
            type: 'test_memory',
            content: `Memory content ${i}`,
            importance: 0.5,
            emotional: 0,
            tags: ['test']
          })
        );
      }

      await Promise.all(memoryPromises);

      // Verify memory system still functions
      const recall = await orchestrator.memoryStorage.recallMemories(inftId, {});
      expect(recall.memories.length).to.be.greaterThan(0);

      const stats = orchestrator.memoryStorage.getMemoryStats(inftId);
      expect(stats.totalMemories).to.be.at.least(50);
    });
  });
});