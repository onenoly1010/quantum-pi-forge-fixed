#!/usr/bin/env node
/**
 * Safe Private Key Derivation Script
 * 
 * This script derives your private key from your seed phrase LOCALLY.
 * Your seed phrase NEVER leaves your machine.
 * 
 * Usage: node scripts/derive-key.js
 */

import readline from 'readline';
import { ethers } from 'ethers';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TARGET_ADDRESS = '0x7f43e5b1a8a092b8364e40d5885f81434b05c7';

console.log('🔐 Safe Private Key Derivation Tool');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('⚠️  Your seed phrase will NOT be stored or transmitted.');
console.log('⚠️  This runs 100% locally on your machine.');
console.log('');
console.log(`Target Address: ${TARGET_ADDRESS}`);
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('');

rl.question('Enter your 12 or 24 word seed phrase: ', async (seedPhrase) => {
  try {
    console.log('');
    console.log('🔍 Searching for matching address...');
    console.log('');

    const trimmedSeed = seedPhrase.trim();
    
    // Validate seed phrase
    if (!ethers.Mnemonic.isValidMnemonic(trimmedSeed)) {
      console.error('❌ Invalid seed phrase format');
      rl.close();
      process.exit(1);
    }

    // Create HD wallet from seed - derive each account from mnemonic
    const mnemonic = ethers.Mnemonic.fromPhrase(trimmedSeed);
    
    // Check first 20 accounts (standard MetaMask range)
    let found = false;
    for (let i = 0; i < 20; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, path);
      
      if (wallet.address.toLowerCase() === TARGET_ADDRESS.toLowerCase()) {
        console.log(`✅ FOUND! Account ${i}`);
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 YOUR PRIVATE KEY:');
        console.log('');
        console.log(wallet.privateKey);
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('✅ Copy the private key above');
        console.log('✅ Paste it when prompted: DEPLOYER_PRIVATE_KEY=0x...');
        console.log('');
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('❌ Address not found in first 20 accounts');
      console.log('💡 Your address might be at a different derivation path');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  rl.close();
});
