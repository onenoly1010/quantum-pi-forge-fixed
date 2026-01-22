const fs = require('fs');
const { ethers } = require('ethers');

async function main() {
    try {
        const artifactPath = 'artifacts/contracts/0g-uniswap-v2/src/UniswapV2Pair.sol/UniswapV2Pair.json';
        if (!fs.existsSync(artifactPath)) {
            console.error(`Artifact not found at ${artifactPath}`);
            return;
        }

        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        let bytecode = artifact.bytecode;
        if (!bytecode.startsWith('0x')) {
            bytecode = '0x' + bytecode;
        }

        const hash = ethers.keccak256(bytecode);
        console.log(`Init Code Hash: ${hash}`);
        
        // Check against the one in the file
        const libraryPath = 'contracts/0g-uniswap-v2/src/libraries/UniswapV2Library.sol';
        if (fs.existsSync(libraryPath)) {
            const libraryContent = fs.readFileSync(libraryPath, 'utf8');
            const match = libraryContent.match(/hex'([a-fA-F0-9]{64})'/);
            if (match) {
                console.log(`Current Hash in File: 0x${match[1]}`);
                if (`0x${match[1]}` !== hash) {
                    console.log('Hashes do NOT match! Update required.');
                } else {
                    console.log('Hashes match. No update required.');
                }
            } else {
                console.log('Could not find hash in UniswapV2Library.sol');
            }
        }

    } catch (error) {
        console.error(error);
    }
}

main();
