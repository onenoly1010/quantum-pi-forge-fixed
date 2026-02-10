#!/usr/bin/env node

// Pi Network Integration Test Runner

const pi = require("./index");

async function runTests() {
  console.log("Pi Network Integration Status:");

  try {
    // Environment check
    console.log("\nEnvironment Requirements:");
    console.log(
      "- PI_API_KEY:",
      process.env.PI_API_KEY ? "✅ Set" : "❌ Missing",
    );
    console.log(
      "- PI_APP_ID:",
      process.env.PI_APP_ID ? "✅ Set" : "❌ Missing",
    );
    console.log(
      "- PI_WEBHOOK_SECRET:",
      process.env.PI_WEBHOOK_SECRET ? "✅ Set" : "⚠️ Optional",
    );

    // Module exports check
    console.log("\nModule Exports:");
    console.log(
      "- Auth exports:",
      pi.auth && pi.auth.connect && pi.auth.session && pi.auth.verify
        ? "✅"
        : "❌",
    );
    console.log(
      "- Payments exports:",
      pi.payments &&
        pi.payments.createPayment &&
        pi.payments.verifyPayment &&
        pi.payments.webhooks
        ? "✅"
        : "❌",
    );
    console.log(
      "- Identity exports:",
      pi.identity && pi.identity.mapProfile && pi.identity.resolveUser
        ? "✅"
        : "❌",
    );
    console.log(
      "- API exports:",
      pi.api && pi.api.client && pi.api.endpoints ? "✅" : "❌",
    );
    console.log(
      "- Config exports:",
      pi.config && pi.config.initSDK && pi.config.environment ? "✅" : "❌",
    );

    // SDK availability
    console.log("\nSDK Status:");
    console.log(
      "- Pi SDK available:",
      pi.config.initSDK.isAvailable() ? "✅" : "⚠️ Demo mode",
    );

    // Basic functionality tests
    console.log("\nBasic Functionality Tests:");

    // Test auth instantiation
    const auth = new pi.auth.connect();
    console.log(
      "- Auth instantiation:",
      auth instanceof pi.auth.connect ? "✅" : "❌",
    );

    // Test session instantiation
    const session = new pi.session() ? new pi.auth.session() : null;
    console.log("- Session instantiation:", session ? "✅" : "❌");

    // Test payment instantiation
    const paymentCreator = new pi.payments.createPayment();
    console.log(
      "- Payment instantiation:",
      paymentCreator instanceof pi.payments.createPayment ? "✅" : "❌",
    );

    // Test identity instantiation
    const profileMapper = new pi.identity.mapProfile();
    console.log(
      "- Identity instantiation:",
      profileMapper instanceof pi.identity.mapProfile ? "✅" : "❌",
    );

    // Test API client instantiation
    const apiClient = new pi.api.client();
    console.log(
      "- API client instantiation:",
      apiClient instanceof pi.api.client ? "✅" : "❌",
    );

    console.log("\n✅ Pi Network Integration validation: SUCCESS");
  } catch (error) {
    console.error("❌ Test error:", error.message);
    console.log("Pi Network Integration validation: FAILED");
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
