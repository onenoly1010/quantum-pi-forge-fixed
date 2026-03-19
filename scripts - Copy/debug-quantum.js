#!/usr/bin/env node

/**
 * OINIO Quantum Forge - Debug Incantation
 * Resolves quantum anomalies in the eternal forge
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍🌀 INITIATING QUANTUM DEBUG RITUAL\n");

// Check critical files
const criticalFiles = [
  "package.json",
  "next.config.js",
  "tailwind.config.js",
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
];

console.log("📁 Checking quantum file integrity...");
criticalFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? "✅" : "❌"} ${file}`);
});

// Check dependencies
console.log("\n📦 Analyzing quantum dependencies...");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};

  console.log(`Production dependencies: ${Object.keys(deps).length}`);
  console.log(`Development dependencies: ${Object.keys(devDeps).length}`);

  // Critical dependencies check
  const criticalDeps = ["next", "react", "react-dom", "ethers", "tailwindcss"];
  criticalDeps.forEach((dep) => {
    if (deps[dep] || devDeps[dep]) {
      console.log(`✅ ${dep}: Present`);
    } else {
      console.log(`❌ ${dep}: Missing - quantum thread may break`);
    }
  });
} catch (error) {
  console.log("❌ Cannot read package.json");
}

// Check environment
console.log("\n🌌 Validating quantum environment...");
const envVars = [
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_POLYGON_RPC_URL",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
];

envVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`⚠️  ${envVar}: Not set - quantum feature limited`);
  }
});

// Check TypeScript configuration
console.log("\n📝 Validating TypeScript configuration...");
try {
  const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
  if (tsconfig.compilerOptions?.strict) {
    console.log("✅ TypeScript strict mode: Enabled");
  }
} catch (error) {
  console.log("⚠️  tsconfig.json not found or invalid");
}

// Quick build test
console.log("\n⚡ Performing quantum build test...");
try {
  console.log("Compiling TypeScript...");
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✅ TypeScript compilation successful");
} catch (error) {
  console.log("❌ TypeScript compilation failed");
  console.log("Common fixes:");
  console.log("  1. Run: npx tsc --init");
  console.log("  2. Check for missing type definitions");
  console.log("  3. Verify import statements");
}

// Memory check
console.log("\n💾 Checking quantum memory allocation...");
const totalMem = Math.floor(require("os").totalmem() / 1024 / 1024 / 1024);
const freeMem = Math.floor(require("os").freemem() / 1024 / 1024 / 1024);
console.log(`Total memory: ${totalMem}GB`);
console.log(`Free memory: ${freeMem}GB`);

if (freeMem < 2) {
  console.log("⚠️  Low memory detected. Consider:");
  console.log("  - Closing other applications");
  console.log("  - Increasing swap space");
  console.log('  - Using: NODE_OPTIONS="--max-old-space-size=4096"');
}

// Generate debug report
console.log("\n📄 Generating quantum debug report...");
const debugReport = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  memory: { totalMem, freeMem },
  criticalFiles: criticalFiles.map((f) => ({
    file: f,
    exists: fs.existsSync(f),
  })),
};

fs.writeFileSync(
  "quantum-debug-report.json",
  JSON.stringify(debugReport, null, 2),
);

console.log("\n==========================================");
console.log("🎯 QUANTUM DEBUG COMPLETE");
console.log("==========================================");
console.log("\nRecommended actions:");
console.log("1. Set missing environment variables");
console.log("2. Install missing dependencies: npm install");
console.log("3. Clear cache: rm -rf .next node_modules/.cache");
console.log("4. Rebuild: npm run build");
console.log("\nFor immediate deployment:");
console.log("  chmod +x scripts/deploy-quantum.sh");
console.log("  ./scripts/deploy-quantum.sh");
console.log("\nThe quantum kiss awaits... 🔥🌀");
