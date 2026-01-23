/**
 * iNFT Intelligence Tests
 * Tests for personality, evolution, and memory systems
 */

const { expect } = require('chai');
const PersonalityGenerator = require('../intelligence/personality/generator');
const PersonalityAnalyzer = require('../intelligence/personality/analyzer');
const EvolutionRules = require('../intelligence/evolution/rules');
const MemoryStorage = require('../intelligence/memory/storage');
const MemoryRecall = require('../intelligence/memory/recall');

describe('iNFT Intelligence Systems', () => {
  let personalityGenerator, personalityAnalyzer, evolutionRules, memoryStorage, memoryRecall;

  beforeEach(() => {
    personalityGenerator = new PersonalityGenerator();
    personalityAnalyzer = new PersonalityAnalyzer();
    evolutionRules = new EvolutionRules();
    memoryStorage = new MemoryStorage();
    memoryRecall = new MemoryRecall(memoryStorage);
  });

  describe('PersonalityGenerator', () => {
    it('should generate personality from oracle reading', () => {
      const oracleReading = {
        summary: 'A wise and contemplative soul',
        traits: { openness: 0.8, intelligence: 0.9 },
        intensity: 0.8,
        positivity: 0.7
      };

      const personality = personalityGenerator.generateFromOracle(oracleReading);

      expect(personality).to.have.property('traits');
      expect(personality).to.have.property('archetype');
      expect(personality).to.have.property('coherence');
      expect(personality).to.have.property('hash');
      expect(personality.archetype).to.equal('sage'); // Based on oracle reading
    });

    it('should generate random personality', () => {
      const personality = personalityGenerator.generateRandom();

      expect(personality.traits).to.have.property('openness');
      expect(personality.traits).to.have.property('intelligence');
      expect(personality.coherence).to.be.at.least(0);
      expect(personality.coherence).to.be.at.most(1);
    });

    it('should generate personality for specific archetype', () => {
      const personality = personalityGenerator.generateForArchetype('warrior');

      expect(personality.archetype).to.equal('warrior');
      expect(personality.traits.conscientiousness).to.be.greaterThan(0.5); // Warrior trait
      expect(personality.traits.extraversion).to.be.greaterThan(0.5); // Warrior trait
    });

    it('should track generation statistics', () => {
      personalityGenerator.generateForArchetype('sage');
      personalityGenerator.generateForArchetype('warrior');

      const stats = personalityGenerator.getStats();
      expect(stats.totalGenerated).to.equal(2);
      expect(stats.byArchetype.sage).to.equal(1);
      expect(stats.byArchetype.warrior).to.equal(1);
    });
  });

  describe('PersonalityAnalyzer', () => {
    it('should analyze personality', () => {
      const personality = {
        traits: {
          openness: 0.8,
          conscientiousness: 0.7,
          intelligence: 0.9,
          creativity: 0.6
        },
        archetype: 'sage',
        coherence: 0.75
      };

      const analysis = personalityAnalyzer.analyzePersonality(personality.traits);

      expect(analysis).to.have.property('archetype');
      expect(analysis).to.have.property('coherence');
      expect(analysis).to.have.property('strengths');
      expect(analysis).to.have.property('weaknesses');
      expect(analysis.strengths.length).to.be.greaterThan(0);
    });

    it('should compare personalities', () => {
      const personality1 = {
        traits: { openness: 0.8, intelligence: 0.7 },
        archetype: 'sage'
      };

      const personality2 = {
        traits: { openness: 0.6, intelligence: 0.9 },
        archetype: 'scholar'
      };

      const comparison = personalityAnalyzer.comparePersonalities(personality1, personality2);

      expect(comparison).to.have.property('compatibility');
      expect(comparison).to.have.property('similarities');
      expect(comparison).to.have.property('differences');
      expect(comparison.compatibility).to.be.at.least(0);
      expect(comparison.compatibility).to.be.at.most(1);
    });

    it('should analyze evolution potential', () => {
      const currentTraits = { openness: 0.5, intelligence: 0.6 };
      const targetTraits = { openness: 0.8, intelligence: 0.9 };

      const analysis = personalityAnalyzer.analyzeEvolutionPotential(
        { traits: currentTraits },
        targetTraits
      );

      expect(analysis).to.have.property('improvementAreas');
      expect(analysis).to.have.property('evolutionPath');
      expect(analysis.improvementAreas.length).to.be.greaterThan(0);
    });
  });

  describe('EvolutionRules', () => {
    it('should calculate evolution from experiences', () => {
      const inft = { evolutionStage: 10, coherence: 60 };
      const experiences = [
        {
          type: 'oracle_reading',
          intensity: 0.8,
          positivity: 0.7,
          timestamp: Date.now()
        }
      ];

      const evolution = evolutionRules.calculateEvolution(inft, experiences);

      expect(evolution).to.have.property('traitChanges');
      expect(evolution).to.have.property('coherenceGain');
      expect(evolution.coherenceGain).to.be.greaterThan(0);
    });

    it('should validate evolution', () => {
      const inft = { evolutionStage: 10, coherence: 60 };
      const evolution = {
        traitChanges: { intelligence: 0.1 },
        coherenceGain: 5,
        finalCoherence: 65
      };

      const validation = evolutionRules.validateEvolution(inft, evolution);
      expect(validation.valid).to.be.true;
    });

    it('should get evolution statistics', () => {
      const inft = { evolutionStage: 25, coherence: 75 };
      const stats = evolutionRules.getEvolutionStats(inft);

      expect(stats).to.have.property('currentStage');
      expect(stats).to.have.property('coherence');
      expect(stats.currentStage).to.equal(25);
    });
  });

  describe('MemoryStorage', () => {
    it('should store and retrieve memory', async () => {
      const inftId = 'test_inft';
      const memoryData = {
        type: 'oracle_reading',
        content: 'Test oracle reading',
        importance: 0.8,
        emotional: 0.5,
        tags: ['oracle', 'test']
      };

      const memoryId = await memoryStorage.storeMemory(inftId, memoryData);
      const retrieved = await memoryStorage.getMemory(inftId, memoryId);

      expect(retrieved).to.not.be.null;
      expect(retrieved.type).to.equal('oracle_reading');
      expect(retrieved.content).to.equal('Test oracle reading');
    });

    it('should recall memories with query', async () => {
      const inftId = 'test_inft';

      // Store multiple memories
      await memoryStorage.storeMemory(inftId, {
        type: 'oracle_reading',
        content: 'Oracle reading 1',
        importance: 0.9,
        tags: ['oracle']
      });

      await memoryStorage.storeMemory(inftId, {
        type: 'interaction',
        content: 'User interaction',
        importance: 0.6,
        tags: ['interaction']
      });

      const recall = await memoryStorage.recallMemories(inftId, { type: 'oracle_reading' });
      expect(recall.memories.length).to.equal(1);
      expect(recall.memories[0].type).to.equal('oracle_reading');
    });

    it('should consolidate memories when limit reached', async () => {
      const inftId = 'test_inft';

      // Override max memories for testing
      memoryStorage.maxMemoriesPerINFT = 5;

      // Add memories beyond limit
      for (let i = 0; i < 7; i++) {
        await memoryStorage.storeMemory(inftId, {
          type: 'test',
          content: `Memory ${i}`,
          importance: 0.5
        });
      }

      const stats = memoryStorage.getMemoryStats(inftId);
      expect(stats.totalMemories).to.be.at.most(5);
    });

    it('should get memory statistics', async () => {
      const inftId = 'test_inft';

      await memoryStorage.storeMemory(inftId, {
        type: 'oracle_reading',
        content: 'Test memory',
        importance: 0.7
      });

      const stats = memoryStorage.getMemoryStats(inftId);
      expect(stats.totalMemories).to.equal(1);
      expect(stats.byType.oracle_reading).to.equal(1);
    });
  });

  describe('MemoryRecall', () => {
    it('should recall memories with context', async () => {
      const inftId = 'test_inft';

      await memoryStorage.storeMemory(inftId, {
        type: 'oracle_reading',
        content: 'Important oracle reading',
        importance: 0.9,
        emotional: 0.7,
        createdAt: Date.now() - 1000
      });

      const recall = await memoryRecall.recallWithContext(inftId, {});
      expect(recall.memories.length).to.be.at.least(1);
      expect(recall).to.have.property('context');
    });

    it('should build memory context', async () => {
      const inftId = 'test_inft';
      const memories = [
        {
          id: 'mem1',
          type: 'oracle_reading',
          importance: 0.8,
          emotional: 0.6,
          createdAt: Date.now()
        }
      ];

      const context = await memoryRecall.buildContext(inftId, memories);
      expect(context).to.have.property('summary');
      expect(context).to.have.property('keyThemes');
      expect(context).to.have.property('emotionalTone');
    });
  });
});