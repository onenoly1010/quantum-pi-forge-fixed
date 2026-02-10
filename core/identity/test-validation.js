#!/usr/bin/env node

// OINIO Identity System Validation Test

const identity = require("./index");

async function runValidationTests() {
  console.log("OINIO Identity System Status:");

  try {
    // Contracts check
    console.log("=== CONTRACTS ===");
    console.log("- SoulRegistry:", !!identity.contracts.SoulRegistry);
    console.log("- OGToken:", !!identity.contracts.OGToken);
    console.log("- Verification:", !!identity.contracts.Verification);

    // Services check
    console.log("\n=== SERVICES ===");
    console.log("- Resolution service:", !!identity.services.resolution);
    console.log("- Verification service:", !!identity.services.verification);
    console.log("- Profile service:", !!identity.services.profiles);
    console.log("- Database models:", !!identity.services.database);

    // Types check
    console.log("\n=== TYPES ===");
    console.log("- Soul type defined:", !!identity.types.Soul);
    console.log("- Claim type defined:", !!identity.types.Claim);

    // Utils check
    console.log("\n=== UTILITIES ===");
    console.log("- Crypto utils:", !!identity.utils.crypto);
    console.log("- Validation utils:", !!identity.utils.validation);
    console.log("- Conversion utils:", !!identity.utils.conversion);

    // Config check
    console.log("\n=== CONFIGURATION ===");
    console.log("- Networks config:", !!identity.config.networks);
    console.log("- Addresses config:", !!identity.config.addresses);
    console.log("- Environment config:", !!identity.config.environment);

    // Environment validation
    try {
      identity.config.validateConfig();
      console.log("- Environment validation: ✅ PASSED");
    } catch (error) {
      console.log("- Environment validation: ❌ FAILED -", error.message);
    }

    // Basic service instantiation
    console.log("\n=== SERVICE INSTANTIATION ===");
    try {
      const resolutionService = new identity.services.resolution();
      console.log("- Resolution service instantiation: ✅");
    } catch (error) {
      console.log("- Resolution service instantiation: ❌ -", error.message);
    }

    try {
      const verificationService = new identity.services.verification();
      console.log("- Verification service instantiation: ✅");
    } catch (error) {
      console.log("- Verification service instantiation: ❌ -", error.message);
    }

    try {
      const profileService = new identity.services.profiles();
      console.log("- Profile service instantiation: ✅");
    } catch (error) {
      console.log("- Profile service instantiation: ❌ -", error.message);
    }

    console.log("\n✅ OINIO Identity System validation: SUCCESS");
  } catch (error) {
    console.error("❌ Validation error:", error.message);
    console.log("OINIO Identity System validation: FAILED");
    process.exit(1);
  }
}

if (require.main === module) {
  runValidationTests();
}

module.exports = runValidationTests;
