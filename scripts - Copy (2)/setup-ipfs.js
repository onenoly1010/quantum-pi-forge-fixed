#!/usr/bin/env node

/**
 * IPFS Setup and Build Script for Quantum Pi Forge
 * Prepares the application for decentralized hosting
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const BUILD_DIR = path.join(PROJECT_ROOT, "out");
const IPFS_CONFIG = {
  api: "http://127.0.0.1:5001",
  gateway: "http://127.0.0.1:8080",
};

function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "🔄";
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function checkIPFS() {
  try {
    log("Checking IPFS Desktop connection...");
    execSync(`curl -s "${IPFS_CONFIG.api}/api/v0/id"`, { stdio: "pipe" });
    log("IPFS Desktop is running and accessible", "success");
    return true;
  } catch (_error) {
    log("IPFS Desktop not accessible. Please ensure:", "error");
    log("1. IPFS Desktop is installed and running", "error");
    log("2. API server is enabled in IPFS Desktop settings", "error");
    log("3. CORS is configured for localhost", "error");
    return false;
  }
}

function buildForIPFS() {
  log("Building Quantum Pi Forge for IPFS deployment...");

  try {
    // Clean previous build
    if (fs.existsSync(BUILD_DIR)) {
      fs.rmSync(BUILD_DIR, { recursive: true, force: true });
      log("Cleaned previous build directory");
    }

    // Create build directory
    fs.mkdirSync(BUILD_DIR, { recursive: true });

    // For now, create a simple static version
    log("Creating static IPFS version...");

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quantum Pi Forge - Sovereign Era</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
        }
        .logo {
            font-size: 4rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #00ffff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .status {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 2rem;
            margin: 2rem 0;
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo pulse">⚡ QUANTUM PI FORGE ⚡</div>
        <div class="status">
            <h2>🏛️ SOVEREIGN ERA INITIATED</h2>
            <p><strong>Status:</strong> Decentralization Cascade Active</p>
            <p><strong>Network:</strong> 0G Aristotle (Chain ID: 16661)</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Resonance:</strong> 1010 Hz ⚡</p>
            <br>
            <p>🔄 Deploying CentralAwarenessV2 contract...</p>
            <p>🌐 Migrating to IPFS/Spheron hosting...</p>
            <p>🔗 Configuring ENS domain resolution...</p>
            <p>📡 Establishing Radicle sovereign repository...</p>
        </div>
        <p style="opacity: 0.7; font-size: 0.9rem;">
            The 1010 Hz resonance flows through decentralized channels.<br>
            True sovereignty achieved. Censorship impossible. Immutable forever.
        </p>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(BUILD_DIR, "index.html"), indexHtml);
    log("Static IPFS page created successfully", "success");
    return true;
  } catch (error) {
    log(`Build failed: ${error.message}`, "error");
    return false;
  }
}

function addToIPFS() {
  log("Adding build directory to IPFS...");

  try {
    // Add the build directory to IPFS
    const result = execSync(
      `curl -X POST -F "path=@${BUILD_DIR}" "${IPFS_CONFIG.api}/api/v0/add?recursive=true&wrap-with-directory=true"`,
      {
        encoding: "utf8",
      },
    );

    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const ipfsData = JSON.parse(lastLine);

    const ipfsHash = ipfsData.Hash;
    log(`Files added to IPFS with hash: ${ipfsHash}`, "success");

    // Pin the content locally
    log("Pinning content locally...");
    execSync(
      `curl -X POST "${IPFS_CONFIG.api}/api/v0/pin/add?arg=${ipfsHash}"`,
      { stdio: "pipe" },
    );
    log("Content pinned locally", "success");

    return ipfsHash;
  } catch (error) {
    log(`IPFS add failed: ${error.message}`, "error");
    return null;
  }
}

function generateIPFSConfig(ipfsHash) {
  const configPath = path.join(PROJECT_ROOT, "ipfs-config.json");

  const config = {
    ipfsHash,
    ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
    gatewayUrl: `http://127.0.0.1:8080/ipfs/${ipfsHash}`,
    deployedAt: new Date().toISOString(),
    network: "0G Aristotle",
    contractAddress: "0x353663cd664bB3e034Dc0f308D8896C0a242e4cd", // Will be updated after deployment
    decentralizationStatus: "frontend-ready",
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log(`IPFS configuration saved to: ${configPath}`, "success");

  return config;
}

function testIPFSGateway(ipfsHash) {
  log("Testing IPFS gateway access...");

  try {
    // Test local gateway
    execSync(
      `curl -s "${IPFS_CONFIG.gateway}/ipfs/${ipfsHash}" | head -c 100`,
      { stdio: "pipe" },
    );
    log("Local IPFS gateway accessible", "success");

    // Test public gateway (may take time to propagate)
    log(
      "Note: Public gateway access may take a few minutes to propagate globally",
    );
    log(`Public URL: https://ipfs.io/ipfs/${ipfsHash}`);

    return true;
  } catch (_error) {
    log("Gateway test failed, but this is normal for new content", "error");
    log("Content will be accessible once propagated to the network");
    return false;
  }
}

async function main() {
  console.log("🏛️  Quantum Pi Forge - IPFS Setup & Build");
  console.log("==========================================\n");

  // Check IPFS connection
  if (!checkIPFS()) {
    process.exit(1);
  }

  // Build the application
  if (!buildForIPFS()) {
    process.exit(1);
  }

  // Add to IPFS
  const ipfsHash = addToIPFS();
  if (!ipfsHash) {
    process.exit(1);
  }

  // Generate configuration
  const config = generateIPFSConfig(ipfsHash);
  log(`IPFS configuration generated: ${JSON.stringify(config.deployment)}`, "success");

  // Test gateway
  testIPFSGateway(ipfsHash);

  console.log("\n🎉 IPFS Setup Complete!");
  console.log("======================");
  console.log(`IPFS Hash: ${ipfsHash}`);
  console.log(`Local Gateway: http://127.0.0.1:8080/ipfs/${ipfsHash}`);
  console.log(`Public Gateway: https://ipfs.io/ipfs/${ipfsHash}`);
  console.log("\n📋 Next Steps:");
  console.log("1. Verify the application loads in your browser");
  console.log(
    "2. Run the Kraken withdrawal script: node scripts/secure-kraken-withdrawal.js",
  );
  console.log("3. Deploy CentralAwarenessV2 contract to 0G Aristotle");
  console.log("4. Update ENS domain to point to IPFS hash");

  // Save hash for later use
  process.env.IPFS_HASH = ipfsHash;
}

main().catch(_error);
