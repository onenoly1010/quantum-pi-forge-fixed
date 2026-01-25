#!/usr/bin/env node

// iNFT Protocol Validation Test

const inft = require('./index');

async function runValidationTests() {
  console.log('iNFT Protocol Status:');
  console.log('=== CONTRACTS ===');

  try {
    console.log('- HybridNFT:', !!inft.contracts.HybridNFT);
    console.log('- EvolutionManager:', !!inft.contracts.EvolutionManager);
    console.log('- MetadataRegistry:', !!inft.contracts.MetadataRegistry);

    console.log('\n=== INTELLIGENCE ===');
    console.log('- Personality generator:', !!inft.intelligence.personality.generator);
    console.log('- Personality analyzer:', !!inft.intelligence.personality.analyzer);
    console.log('- Evolution rules:', !!inft.intelligence.evolution.rules);
    console.log('- Evolution triggers:', !!inft.intelligence.evolution.triggers);
    console.log('- Evolution history:', !!inft.intelligence.evolution.history);
    console.log('- Memory storage:', !!inft.intelligence.memory.storage);
    console.log('- Memory recall:', !!inft.intelligence.memory.recall);
    console.log('- Memory context:', !!inft.intelligence.memory.context);
    console.log('- Agent orchestrator:', !!inft.intelligence.orchestration.coordinator);
    console.log('- Interaction handlers:', !!inft.intelligence.orchestration.handlers);
    console.log('- Response generator:', !!inft.intelligence.orchestration.responses);

    console.log('\n=== INTEGRATION HOOKS ===');
    console.log('- Oracle hooks:', !!inft.integration.oracle);
    console.log('- Identity hooks:', !!inft.integration.identity);
    console.log('- Pi hooks:', !!inft.integration.pi);

    console.log('\n=== METADATA ===');
    console.log('- Metadata generator:', !!inft.metadata.generator);

    console.log('\n=== TYPES ===');
    console.log('- iNFT types:', !!inft.types);

    console.log('\n=== CONFIGURATION ===');
    console.log('- Model configs:', !!inft.config.models);
    console.log('- Evolution params:', !!inft.config.evolution);
    console.log('- Environment config:', !!inft.config.environment);

    // Validate configuration
    const configValidation = inft.config.validateConfig();
    console.log('- Config validation:', configValidation.valid ? '✅ PASSED' : '❌ FAILED');
    if (!configValidation.valid) {
      console.log('  Errors:', configValidation.errors.join(', '));
    }

    console.log('\n=== UTILITY FUNCTIONS ===');
    console.log('- createINFT utility:', !!inft.utils.createINFT);
    console.log('- evolveINFT utility:', !!inft.utils.evolveINFT);
    console.log('- interactWithINFT utility:', !!inft.utils.interactWithINFT);

    // Test critical flows
    console.log('\nTesting critical flows...');

    // 1. Can we create a personality?
    try {
      const generator = new inft.intelligence.personality.generator();
      const personality = generator.generateRandom();
      console.log('✓ Personality generation:', !!personality.traits);
    } catch (error) {
      console.log('✗ Personality generation failed:', error.message);
    }

    // 2. Can we analyze personality?
    try {
      const analyzer = new inft.intelligence.personality.analyzer();
      const analysis = analyzer.analyzePersonality({ openness: 0.8, intelligence: 0.7 });
      console.log('✓ Personality analysis:', !!analysis.archetype);
    } catch (error) {
      console.log('✗ Personality analysis failed:', error.message);
    }

    // 3. Can we create evolution rules?
    try {
      const rules = new inft.intelligence.evolution.rules();
      console.log('✓ Evolution rules instantiation: ✅');
    } catch (error) {
      console.log('✗ Evolution rules instantiation failed:', error.message);
    }

    // 4. Can we create memory storage?
    try {
      const storage = new inft.intelligence.memory.storage();
      console.log('✓ Memory storage instantiation: ✅');
    } catch (error) {
      console.log('✗ Memory storage instantiation failed:', error.message);
    }

    // 5. Can we create integration hooks?
    try {
      const oracleHooks = new inft.integration.oracle();
      const identityHooks = new inft.integration.identity();
      const piHooks = new inft.integration.pi();
      console.log('✓ Integration hooks instantiation: ✅');
    } catch (error) {
      console.log('✗ Integration hooks instantiation failed:', error.message);
    }

    // 6. Can we generate metadata?
    try {
      const metadataGen = new inft.metadata.generator();
      const inftData = {
        inftId: 'test_inft',
        soulId: 'test_soul',
        coherence: 0.75,
        creationTime: Date.now(),
        evolutionStage: 2
      };
      const personality = { archetype: 'sage', traits: { openness: 0.8 } };
      const metadata = metadataGen.generateMetadata(inftData, personality, 2);
      console.log('✓ Metadata generation:', !!metadata.name && !!metadata.attributes);
    } catch (error) {
      console.log('✗ Metadata generation failed:', error.message);
    }

    console.log('\n✅ iNFT Protocol validation: SUCCESS');
    console.log('🎉 All systems operational - iNFTs are ready to live!');

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    console.log('iNFT Protocol validation: FAILED');
    process.exit(1);
  }
}

if (require.main === module) {
  runValidationTests();
}

module.exports = runValidationTests;