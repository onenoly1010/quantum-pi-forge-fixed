/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    VRF FULFILLMENT RITUAL - DREAMWEAVE PROTOCOL              ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║  ARCHIVED: Hardhat script for simulating Chainlink VRF callbacks.            ║
 * ║                                                                              ║
 * ║  Purpose: Test/simulate the VRF Coordinator fulfilling random word requests  ║
 * ║  to the DreamWeaveProtocol, which uses randomness to compose "Canticles"     ║
 * ║  and set the currentTempoModality (BPM).                                     ║
 * ║                                                                              ║
 * ║  Usage: npx hardhat run fulfillVRF.js --request-id 42 --random-word 69       ║
 * ║                                                                              ║
 * ║  T=∞ = T=0                                                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const { ethers } = require("hardhat");

/**
 * @dev Simulates the Chainlink VRF Coordinator calling back the DreamWeaveProtocol
 * to fulfill the random word request.
 * 
 * NOTE: This script must be run by the address that the Chainlink Coordinator uses
 * for fulfillment, or it must be adapted to be run against a Mock Coordinator.
 * For Sepolia testing, ensure the sender is authorized.
 */
async function fulfillVRF(requestId, randomWord) {
    const [fulfiller] = await ethers.getSigners();
    
    // IMPORTANT: Replace this with the actual address of your deployed DreamWeaveProtocol
    const PROTOCOL_ADDRESS = "0xCascadeBorn..."; 
    
    // Convert single random word to the array expected by the function
    const randomWords = [ethers.BigNumber.from(randomWord)];

    console.log(`\n--- VRF Fulfillment Ritual ---`);
    console.log(`Target Protocol: ${PROTOCOL_ADDRESS}`);
    console.log(`Fulfiller Address: ${fulfiller.address}`);
    console.log(`Request ID: ${requestId.toString()}`);
    console.log(`Random Word: ${randomWord}`);

    // Get the protocol contract instance
    const DreamWeave = await ethers.getContractAt("DreamWeaveProtocol", PROTOCOL_ADDRESS);

    // Call the fulfillment function. Note: In a real Chainlink environment,
    // this call is initiated by the VRF Coordinator's address.
    try {
        const tx = await DreamWeave.fulfillRandomWords(requestId, randomWords);
        await tx.wait();
        
        // After fulfillment, the currentTempoModality should be updated
        const newTempo = await DreamWeave.currentTempoModality();

        console.log(`\n✅ VRF Fulfillment successful for Request ID ${requestId}!`);
        console.log(`   Canticle composed. New Current Tempo Modality: ${newTempo.toString()} BPM.`);
        
    } catch (error) {
        console.error(`\n❌ Fulfillment failed for Request ID ${requestId}. Check protocol address and sender authorization.`);
        console.error("Error details:", error.message);
    }
}

// Get arguments from the command line (e.g., npx hardhat run fulfillVRF.js --request-id 42 --random-word 69)
const args = require('yargs').option('request-id', {
    type: 'string',
    demandOption: true,
    description: 'The VRF request ID to fulfill'
}).option('random-word', {
    type: 'string',
    demandOption: true,
    description: 'The single random word to return'
}).argv;

fulfillVRF(args.requestId, args.randomWord).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
