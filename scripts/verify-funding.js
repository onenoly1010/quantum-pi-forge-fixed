import { ethers } from 'ethers';

async function verifyFunding() {
    if (!process.env.ZERO_G_RPC_URL || !process.env.DEPLOYER_ADDRESS) {
    console.error('Error: ZERO_G_RPC_URL or DEPLOYER_ADDRESS environment variables are not set.');
    process.exit(1);
}
const provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL);
    const walletAddress = process.env.DEPLOYER_ADDRESS;
    
    try {
        const balance = await provider.getBalance(walletAddress);
        const balanceInEth = ethers.formatEther(balance);
        
        console.log(`💰 Current Balance: ${balanceInEth} A0G`);
        
        const requiredBalance = 5;  // Minimum required in A0G
        if (parseFloat(balanceInEth) >= requiredBalance) {
            console.log(`✅ SUCCESS: Sufficient balance for DEX deployment!`);
            process.exit(0);  // Exit with success
        } else {
            console.log(`❌ FAILURE: Insufficient balance. Need at least ${requiredBalance} A0G.`);
            process.exit(1);  // Exit with failure
        }
    } catch (error) {
        console.error(`Error fetching balance: ${error.message}`);
        process.exit(1);  // Exit with failure
    }
}

verifyFunding();
