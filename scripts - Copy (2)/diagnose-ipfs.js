#!/usr/bin/env node

/**
 * IPFS Connection Diagnostic Tool
 * Helps troubleshoot IPFS Desktop connectivity issues
 */

import { execSync } from "child_process";
import http from "http";

const IPFS_API_URL = "http://127.0.0.1:5001";
const IPFS_GATEWAY_URL = "http://127.0.0.1:8080";

function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : type === "warning" ? "⚠️" : "🔄";
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function checkProcessRunning(processName) {
  try {
    if (process.platform === "win32") {
      execSync(`tasklist /FI "IMAGENAME eq ${processName}.exe" /NH`, { stdio: "pipe" });
      return true;
    } else {
      execSync(`pgrep -f ${processName}`, { stdio: "pipe" });
      return true;
    }
  } catch {
    return false;
  }
}

function testHttpEndpoint(url, description) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: "GET", timeout: 5000 }, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on("error", () => resolve({ success: false }));
    req.on("timeout", () => resolve({ success: false }));
    req.end();
  });
}

async function diagnoseIPFS() {
  log("🔍 Starting IPFS Connection Diagnostics", "info");
  log("=====================================", "info");

  // Check if IPFS Desktop is running
  log("Checking if IPFS Desktop is running...");
  const isIPFSRunning = checkProcessRunning("ipfs-desktop") || checkProcessRunning("IPFS Desktop");

  if (isIPFSRunning) {
    log("IPFS Desktop process is running", "success");
  } else {
    log("IPFS Desktop process not found. Please start IPFS Desktop.", "error");
  }

  // Test API endpoint
  log("Testing IPFS API endpoint...");
  const apiResult = await testHttpEndpoint(`${IPFS_API_URL}/api/v0/id`, "API");

  if (apiResult.success) {
    log(`IPFS API is accessible (Status: ${apiResult.status})`, "success");
  } else {
    log("IPFS API is not accessible", "error");
  }

  // Test Gateway endpoint
  log("Testing IPFS Gateway endpoint...");
  const gatewayResult = await testHttpEndpoint(IPFS_GATEWAY_URL, "Gateway");

  if (gatewayResult.success) {
    log(`IPFS Gateway is accessible (Status: ${gatewayResult.status})`, "success");
  } else {
    log("IPFS Gateway is not accessible", "error");
  }

  // Provide solutions
  log("🔧 TROUBLESHOOTING STEPS", "warning");
  log("=========================", "warning");

  if (!isIPFSRunning) {
    log("1. Start IPFS Desktop application", "info");
    log("   - Open IPFS Desktop from your applications menu", "info");
    log("   - Wait for it to fully start up (may take 30-60 seconds)", "info");
  }

  if (!apiResult.success) {
    log("2. Enable IPFS API Server:", "info");
    log("   - Open IPFS Desktop", "info");
    log("   - Go to Settings/Preferences", "info");
    log("   - Enable 'IPFS API Server'", "info");
    log("   - Set API address to: http://127.0.0.1:5001", "info");
    log("   - Restart IPFS Desktop", "info");
  }

  if (!gatewayResult.success) {
    log("3. Enable IPFS Gateway:", "info");
    log("   - In IPFS Desktop Settings", "info");
    log("   - Enable 'IPFS Gateway'", "info");
    log("   - Set Gateway address to: http://127.0.0.1:8080", "info");
    log("   - Restart IPFS Desktop", "info");
  }

  log("4. Configure CORS (if needed):", "info");
  log("   - In IPFS Desktop Settings", "info");
  log("   - Go to Advanced Settings", "info");
  log("   - Add CORS headers for localhost", "info");

  log("5. Check Firewall:", "info");
  log("   - Ensure Windows Firewall allows IPFS Desktop", "info");
  log("   - Check if antivirus is blocking connections", "info");

  // Test again after providing instructions
  log("⏳ Testing connection again in 5 seconds...", "info");
  await new Promise(resolve => setTimeout(resolve, 5000));

  const finalApiResult = await testHttpEndpoint(`${IPFS_API_URL}/api/v0/id`, "API");
  const finalGatewayResult = await testHttpEndpoint(IPFS_GATEWAY_URL, "Gateway");

  if (finalApiResult.success && finalGatewayResult.success) {
    log("🎉 IPFS connection successful!", "success");
    log("You can now use IPFS commands.", "success");
  } else {
    log("❌ IPFS still not accessible. Please follow the troubleshooting steps above.", "error");
    log("For more help, visit: https://docs.ipfs.tech/install/ipfs-desktop/", "info");
  }
}

// Run diagnostics
diagnoseIPFS().catch(error => {
  log(`Diagnostic error: ${error.message}`, "error");
  process.exit(1);
});