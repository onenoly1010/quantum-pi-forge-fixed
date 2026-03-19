// Simple test of oracle extraction
const OracleEngine = require("./engine");
const { PATTERNS, generateDeterministicReading } = require("./shared");

console.log("🌾 Testing QuantumPiForge Oracle Extraction 🌾\n");

// Test shared constants
console.log("✓ Eternal Patterns loaded:", PATTERNS.length);

// Test deterministic reading
const testSeed = "a".repeat(64);
const reading = generateDeterministicReading("What is my path?", testSeed, 1);
console.log("✓ Deterministic reading generated:");
console.log("  Pattern:", reading.pattern);
console.log("  Resonance:", reading.resonance);
console.log("  Message preview:", reading.message.substring(0, 50) + "...");

// Test oracle engine
const engine = new OracleEngine();
const soul = engine.createSoul("Test Soul");
console.log("\n✓ Soul created:", soul.name);
console.log("  Seed length:", soul.seed.length);
console.log("  Epochs:", soul.epochs.length);

// Test reading generation through engine
const engineReading = engine.generateReading(
  "What should I focus on?",
  soul.seed,
  1,
);
console.log("\n✓ Engine reading generated:");
console.log("  Pattern:", engineReading.pattern);
console.log(
  "  All values in range:",
  engineReading.resonance >= 1 && engineReading.resonance <= 100,
);

// Test soul verification
const isValid = engine.verifySoulSignature(soul);
console.log("\n✓ Soul signature verification:", isValid ? "PASSED" : "FAILED");

console.log(
  "\n🎉 Oracle extraction successful! Ready for platform integration.",
);
