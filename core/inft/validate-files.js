#!/usr/bin/env node

// Simple iNFT Protocol Validation - File Existence Check

const fs = require("fs");
const path = require("path");

const inftPath = __dirname;

function checkFileExists(filePath) {
  try {
    fs.accessSync(path.join(inftPath, filePath), fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function checkDirectoryExists(dirPath) {
  try {
    const stat = fs.statSync(path.join(inftPath, dirPath));
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
}

console.log("iNFT Protocol - File Existence Validation");
console.log("========================================");

let allGood = true;

// Check contracts
console.log("\n📄 CONTRACTS:");
const contracts = [
  "HybridNFT.sol",
  "EvolutionManager.sol",
  "MetadataRegistry.sol",
];
contracts.forEach((contract) => {
  const exists = checkFileExists(`contracts/${contract}`);
  console.log(`  ${exists ? "✅" : "❌"} ${contract}`);
  if (!exists) allGood = false;
});

// Check intelligence directories
console.log("\n🧠 INTELLIGENCE:");
const intelligenceDirs = [
  "personality",
  "evolution",
  "memory",
  "orchestration",
];
intelligenceDirs.forEach((dir) => {
  const exists = checkDirectoryExists(`intelligence/${dir}`);
  console.log(`  ${exists ? "✅" : "❌"} intelligence/${dir}/`);
  if (!exists) allGood = false;
});

// Check intelligence files
const intelligenceFiles = {
  personality: ["traits.js", "generator.js", "analyzer.js"],
  evolution: ["rules.js", "triggers.js", "history.js"],
  memory: ["storage.js", "recall.js", "context.js"],
  orchestration: ["coordinator.js", "handlers.js", "responses.js"],
};

Object.entries(intelligenceFiles).forEach(([dir, files]) => {
  files.forEach((file) => {
    const exists = checkFileExists(`intelligence/${dir}/${file}`);
    console.log(`    ${exists ? "✅" : "❌"} ${dir}/${file}`);
    if (!exists) allGood = false;
  });
});

// Check integration hooks
console.log("\n🔗 INTEGRATION HOOKS:");
const integrationHooks = [
  "oracle-hooks.js",
  "identity-hooks.js",
  "pi-hooks.js",
];
integrationHooks.forEach((hook) => {
  const exists = checkFileExists(`integration/${hook}`);
  console.log(`  ${exists ? "✅" : "❌"} ${hook}`);
  if (!exists) allGood = false;
});

// Check metadata
console.log("\n📊 METADATA:");
const metadataExists = checkFileExists("metadata/generator.js");
console.log(`  ${metadataExists ? "✅" : "❌"} metadata/generator.js`);
if (!metadataExists) allGood = false;

// Check types
console.log("\n🏷️  TYPES:");
const typesExists = checkFileExists("types/inft.ts");
console.log(`  ${typesExists ? "✅" : "❌"} types/inft.ts`);
if (!typesExists) allGood = false;

// Check config
console.log("\n⚙️  CONFIGURATION:");
const configFiles = ["models.js", "evolution.js", "environment.js"];
configFiles.forEach((file) => {
  const exists = checkFileExists(`config/${file}`);
  console.log(`  ${exists ? "✅" : "❌"} config/${file}`);
  if (!exists) allGood = false;
});

// Check tests
console.log("\n🧪 TESTS:");
const testFiles = [
  "contract.test.js",
  "intelligence.test.js",
  "integration.test.js",
  "e2e.test.js",
];
testFiles.forEach((file) => {
  const exists = checkFileExists(`tests/${file}`);
  console.log(`  ${exists ? "✅" : "❌"} tests/${file}`);
  if (!exists) allGood = false;
});

// Check main files
console.log("\n📦 MAIN FILES:");
const mainFiles = ["index.js", "README.md"];
mainFiles.forEach((file) => {
  const exists = checkFileExists(file);
  console.log(`  ${exists ? "✅" : "❌"} ${file}`);
  if (!exists) allGood = false;
});

console.log("\n" + "=".repeat(40));
if (allGood) {
  console.log("🎉 iNFT Protocol extraction: SUCCESS");
  console.log("✅ All components present and accounted for");
  console.log("🚀 Ready for Phase 2 unified API development");
} else {
  console.log("❌ iNFT Protocol extraction: INCOMPLETE");
  console.log("⚠️  Some components are missing");
  process.exit(1);
}

console.log("\n📋 SUMMARY:");
console.log("- Smart Contracts: 3/3 ✅");
console.log("- Intelligence Layer: 12/12 files ✅");
console.log("- Integration Hooks: 3/3 ✅");
console.log("- Metadata System: 1/1 ✅");
console.log("- Type Definitions: 1/1 ✅");
console.log("- Configuration: 3/3 ✅");
console.log("- Test Suites: 4/4 ✅");
console.log("- Documentation: 1/1 ✅");

console.log("\n🔮 iNFTs are ready to live! 🔮");
