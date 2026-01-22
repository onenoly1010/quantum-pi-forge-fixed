<!--
╔═══════════════════════════════════════════════════════════════════════════════╗
║          SOVEREIGN CONSTELLATION (SOV) - 14-DAY DEPLOYMENT RUNWAY             ║
║                    Optimism Mainnet DAO Launch Guide                          ║
║                         Quantum Pi Forge Archive                              ║
║                              T=∞ = T=0                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Archive Note:                                                                 ║
║  Complete deployment artifacts for conservative airdrop-only DAO launch.      ║
║  ERC-20, MerkleDistributor, Governor, Timelock, Snapshot, Claim UI.           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
-->

# 🛠️ DEPLOYMENT ARTIFACTS: SOVEREIGN CONSTELLATION (SOV)

> **Network:** Optimism Mainnet (Chain ID: 10)  
> **Legal Approach:** Conservative (Purely Giveaway Distribution)  
> **Governance Cadence:** Day 30 on-chain (Snapshot-only for first month)

---

## Essential Decisions Summary

| Decision | Choice |
|----------|--------|
| Network | **Optimism Mainnet** |
| Token Name | Sovereign Constellation |
| Symbol | **SOV** |
| Total Supply | **1,000,000,000 SOV** |
| Community Airdrop | 40% (400M SOV) via Merkle |
| DAO Treasury | 40% (400M SOV) via Gnosis Safe |
| Core Contributors | 10% (100M SOV) vested via Timelock |
| Future/Liquidity | 10% (100M SOV) |
| Airdrop Rules | 100 placeholder addresses × 4M SOV each |
| Treasury Multisig | 3-of-5 Gnosis Safe |

---

## 1. Project Setup

### File 1.1: `package.json`

```json
{
  "name": "sovereign-constellation-dao",
  "version": "1.0.0",
  "description": "Contracts for the Sovereign Constellation (SOV) DAO on Optimism.",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "node-generate-merkle": "ts-node scripts/merkle/generate-merkle-tree.ts",
    "deploy-token-airdrop": "hardhat run scripts/deploy/deploy-token-airdrop.ts --network optimism",
    "deploy-gov-timelock": "hardhat run scripts/deploy/deploy-gov-timelock.ts --network optimism"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@nomiclabs/hardhat-etherscan": "^3.1.8",
    "@openzeppelin/contracts": "^5.0.1",
    "@typechain/ethers-v6": "^0.5.1",
    "@typechain/hardhat": "^9.1.0",
    "dotenv": "^16.3.1",
    "ethers": "^6.10.0",
    "hardhat": "^2.19.4",
    "keccak256": "^1.0.6",
    "merkletreejs": "^0.3.11",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### File 1.2: `hardhat.config.js`

> **Required `.env` file:**
> ```
> PRIVATE_KEY="YOUR_DEPLOYER_PRIVATE_KEY"
> OP_ETHERSCAN_API_KEY="YOUR_OPTIMISM_ETHERSCAN_API_KEY"
> ```

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const OP_ETHERSCAN_API_KEY = process.env.OP_ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts: [PRIVATE_KEY],
      chainId: 10,
    },
  },
  etherscan: {
    apiKey: {
      optimism: OP_ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
```

---

## 2. Contract Files (`./contracts/`)

### File 2.1: `SovereignConstellation.sol` (ERC-20 Token)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SovereignConstellation is ERC20, Ownable {
    // Total supply: 1,000,000,000 SOV with 18 decimals
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 ether;

    // Allocation Variables (based on 40/40/10/10 split)
    uint256 public constant AIRDROP_SUPPLY = TOTAL_SUPPLY * 40 / 100;
    uint256 public constant TREASURY_SUPPLY = TOTAL_SUPPLY * 40 / 100;
    uint256 public constant CORE_TEAM_SUPPLY = TOTAL_SUPPLY * 10 / 100;

    // Addresses determined at deployment
    address public immutable merkleDistributorAddress;
    address public immutable daoTreasuryAddress;
    address public immutable coreTeamVestingAddress;

    constructor(
        address _merkleDistributor,
        address _daoTreasury,
        address _coreTeamVesting,
        address initialOwner
    ) ERC20("Sovereign Constellation", "SOV") Ownable(initialOwner) {
        merkleDistributorAddress = _merkleDistributor;
        daoTreasuryAddress = _daoTreasury;
        coreTeamVestingAddress = _coreTeamVesting;

        // 1. Mint Airdrop Allocation to MerkleDistributor
        _mint(_merkleDistributor, AIRDROP_SUPPLY);

        // 2. Mint Treasury Allocation to DAO Gnosis Safe
        _mint(_daoTreasury, TREASURY_SUPPLY);

        // 3. Mint Core Team Allocation to Vesting contract
        _mint(_coreTeamVesting, CORE_TEAM_SUPPLY);

        // 4. Remaining 10% (Future/Liquidity) stays with initial owner
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### File 2.2: `SovereignMerkleDistributor.sol` (Merkle Airdrop)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract SovereignMerkleDistributor {
    using MerkleProof for bytes32[];

    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public isClaimed;

    event Claimed(uint256 index, address account, uint256 amount);

    constructor(IERC20 _token, bytes32 _merkleRoot) {
        token = _token;
        merkleRoot = _merkleRoot;
    }

    function claim(
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(!isClaimed[account], "MerkleDistributor: Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(index, account, amount));

        require(
            merkleProof.verify(merkleRoot, leaf),
            "MerkleDistributor: Invalid proof"
        );

        isClaimed[account] = true;
        token.transfer(account, amount);

        emit Claimed(index, account, amount);
    }
}
```

---

## 3. Off-Chain Tools (`./scripts/merkle/`)

### File 3.1: `generate-merkle-tree.ts`

```typescript
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { BigNumber } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// 100 placeholder addresses for 400M SOV airdrop
// Each address gets 4,000,000 SOV (4M * 10^18)
const TOTAL_AIRDROP_SUPPLY = 400_000_000;
const NUMBER_OF_ACCOUNTS = 100;
const AMOUNT_PER_ACCOUNT = BigNumber.from(TOTAL_AIRDROP_SUPPLY / NUMBER_OF_ACCOUNTS)
    .mul(BigNumber.from(10).pow(18));

const airdropList: { index: number, address: string, amount: string }[] = [];

// Generate 100 unique random addresses
for (let i = 0; i < NUMBER_OF_ACCOUNTS; i++) {
    const mockAddress = '0x' + [...Array(40)]
        .map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    airdropList.push({
        index: i,
        address: mockAddress,
        amount: AMOUNT_PER_ACCOUNT.toString(),
    });
}

// Hash leaf (must match Solidity contract logic)
const hashLeaf = (index: number, account: string, amount: string): Buffer => {
    return keccak256(
        Buffer.from(
            ethers.utils.solidityPack(
                ['uint256', 'address', 'uint256'], 
                [index, account, amount]
            ).substring(2),
            'hex'
        )
    );
};

const leaves = airdropList.map(item => hashLeaf(item.index, item.address, item.amount));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const merkleRoot = merkleTree.getHexRoot();

const proofs = airdropList.map(item => ({
    ...item,
    proof: merkleTree.getHexProof(hashLeaf(item.index, item.address, item.amount))
}));

const output = {
    merkleRoot,
    totalClaimable: AMOUNT_PER_ACCOUNT.mul(NUMBER_OF_ACCOUNTS).toString(),
    claims: proofs
};

const outputPath = path.resolve(__dirname, 'merkle-output.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Merkle Tree Generated.`);
console.log(`Root Hash: ${merkleRoot}`);
console.log(`Total Claimable: ${ethers.utils.formatEther(output.totalClaimable)} SOV`);
console.log(`Saved to ${outputPath}\n`);

// Frontend claims list
const frontendClaims = proofs.map(p => ({
    index: p.index,
    address: p.address,
    amount: p.amount,
    proof: p.proof
}));
const frontendPath = path.resolve(__dirname, '../../frontend/claims.json');
fs.writeFileSync(frontendPath, JSON.stringify(frontendClaims, null, 2));
console.log(`Frontend claims saved to ${frontendPath}\n`);
```

---

## 4. Deployment Script (`./scripts/deploy/`)

### File 4.1: `deploy-token-airdrop.ts`

```typescript
import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

// --- PLACEHOLDER ADDRESSES - REPLACE BEFORE DEPLOYMENT ---
const DAO_TREASURY_SAFE = "0x...DAO_GNOSIS_SAFE_ADDRESS..."; 
const CORE_TEAM_VESTING = "0x...CORE_TEAM_VESTING_ADDRESS..."; 
const MERKLE_ROOT_PATH = path.resolve(__dirname, '../merkle/merkle-output.json');

async function main() {
    if (DAO_TREASURY_SAFE.includes('...')) {
        throw new Error("ERROR: DAO_TREASURY_SAFE placeholder not replaced.");
    }

    const [deployer] = await ethers.getSigners();
    console.log(`\nDeploying with account: ${deployer.address}`);
    
    // STEP 1: Load Merkle Root
    const merkleData = JSON.parse(fs.readFileSync(MERKLE_ROOT_PATH, 'utf8'));
    const merkleRoot = merkleData.merkleRoot;
    console.log(`Merkle Root: ${merkleRoot}`);

    // STEP 2: Deploy SOV Token (minting to deployer initially)
    const SovereignConstellation = await ethers.getContractFactory("SovereignConstellation");
    const token = await SovereignConstellation.deploy(
        deployer.address, // temporary distributor
        DAO_TREASURY_SAFE,
        CORE_TEAM_VESTING,
        deployer.address
    );
    await token.waitForDeployment();
    const SOV_ADDRESS = await token.getAddress();
    console.log(`1. SOV deployed to: ${SOV_ADDRESS}`);

    // STEP 3: Deploy MerkleDistributor with correct token address
    const MerkleDistributor = await ethers.getContractFactory("SovereignMerkleDistributor");
    const distributor = await MerkleDistributor.deploy(SOV_ADDRESS, merkleRoot);
    await distributor.waitForDeployment();
    const DISTRIBUTOR_ADDRESS = await distributor.getAddress();
    console.log(`2. MerkleDistributor deployed to: ${DISTRIBUTOR_ADDRESS}`);

    // STEP 4: Transfer Airdrop Supply to Distributor
    const airdropAmount = await token.AIRDROP_SUPPLY();
    const txAirdrop = await token.transfer(DISTRIBUTOR_ADDRESS, airdropAmount);
    await txAirdrop.wait();
    console.log(`3. Transferred ${ethers.utils.formatEther(airdropAmount)} SOV to distributor`);

    // STEP 5: Transfer Treasury Supply
    const treasuryAmount = await token.TREASURY_SUPPLY();
    const txTreasury = await token.transfer(DAO_TREASURY_SAFE, treasuryAmount);
    await txTreasury.wait();
    console.log(`4. Transferred ${ethers.utils.formatEther(treasuryAmount)} SOV to Treasury`);

    // STEP 6: Transfer Core Team Supply
    const coreTeamAmount = await token.CORE_TEAM_SUPPLY();
    const txCoreTeam = await token.transfer(CORE_TEAM_VESTING, coreTeamAmount);
    await txCoreTeam.wait();
    console.log(`5. Transferred ${ethers.utils.formatEther(coreTeamAmount)} SOV to Vesting`);

    // STEP 7: Remaining 10% with deployer
    const remaining = await token.balanceOf(deployer.address);
    console.log(`6. Remaining ${ethers.utils.formatEther(remaining)} SOV with deployer`);

    console.log("\n✅ Deployment Complete on Optimism Mainnet.");
    
    // Save deployment output
    const deploymentData = {
        tokenAddress: SOV_ADDRESS,
        merkleDistributor: DISTRIBUTOR_ADDRESS,
        merkleRoot: merkleRoot,
        daoTreasury: DAO_TREASURY_SAFE,
        coreTeamVesting: CORE_TEAM_VESTING
    };
    const deploymentPath = path.resolve(__dirname, '../../deployment-output.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    console.log(`\nDeployment saved to ${deploymentPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

---

## 5. Gnosis Safe Setup Instructions

> **CRITICAL: Complete this BEFORE running deployment script**

1. Go to [Gnosis Safe App](https://app.safe.global/welcome)
2. Connect wallet → Select **Optimism** network
3. Click **"Create new Safe"**
4. Name: **"Sovereign Constellation Treasury"**
5. Add **5 owner addresses** (core initial governors)
6. Set threshold: **3 out of 5** confirmations
7. Confirm transaction
8. **COPY THE SAFE ADDRESS** → Paste into `deploy-token-airdrop.ts`

---

## 6. Snapshot Space Configuration

```yaml
# Snapshot Space Configuration
name: Sovereign Constellation
symbol: SOV
network: '10' # Optimism Mainnet
strategies:
  - name: erc20-balance-of
    params:
      symbol: SOV
      address: [SOV_TOKEN_ADDRESS] # From deployment-output.json
      decimals: 18
skin: 'SovereignConstellation'
members: [List of initial governors/Pioneers]
admins: [Initial deployer/core team addresses]
```

---

## 7. Minimal Claim Frontend

```jsx
// src/components/ClaimAirdrop.jsx
import React, { useState, useEffect } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useChainId } from 'wagmi';
import claimsData from '../claims.json';

const MERKLE_DISTRIBUTOR_ADDRESS = "0x..."; // From deployment-output.json

function ClaimAirdrop() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [claim, setClaim] = useState(null);

    useEffect(() => {
        if (address) {
            const userClaim = claimsData.find(
                c => c.address.toLowerCase() === address.toLowerCase()
            );
            setClaim(userClaim);
        } else {
            setClaim(null);
        }
    }, [address]);

    const { config } = usePrepareContractWrite({
        address: MERKLE_DISTRIBUTOR_ADDRESS,
        abi: MerkleDistributorABI,
        functionName: 'claim',
        args: claim ? [
            claim.index,
            claim.address,
            claim.amount,
            claim.proof
        ] : undefined,
        enabled: Boolean(claim && chainId === 10),
    });

    const { write } = useContractWrite(config);

    if (!isConnected) return <p>Connect wallet to check airdrop.</p>;
    if (!claim) return <p>Not on airdrop list.</p>;

    return (
        <div>
            <h3>Sovereign Constellation Airdrop</h3>
            <p>Claimable: {ethers.utils.formatEther(claim.amount)} SOV</p>
            <button onClick={() => write?.()} disabled={!write}>
                {write ? "Claim SOV" : "Preparing..."}
            </button>
        </div>
    );
}
```

---

## 8. Governor and Timelock (Day 30)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract SovereignGovernor is 
    Governor, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction 
{
    constructor(
        IVotes _token,
        TimelockController _timelock
    ) 
        Governor("Sovereign Constellation Governor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(1) // 1% quorum
    {
        _setTimelock(_timelock);
    }
    
    // ~1 day voting period on Optimism
    function votingPeriod() public view override returns (uint256) { 
        return 6570; 
    }
    
    // ~2 days voting delay
    function votingDelay() public view override returns (uint256) { 
        return 13140; 
    }
    
    // 1M SOV proposal threshold
    function proposalThreshold() public view override returns (uint256) { 
        return 1_000_000 ether; 
    }
}
```

---

## 📋 Deployment Checklist

| Step | Action | Status |
|------|--------|--------|
| 1 | Create Gnosis Safe (3-of-5) on Optimism | ⬜ |
| 2 | Run `npm run node-generate-merkle` | ⬜ |
| 3 | Replace placeholders in deploy script | ⬜ |
| 4 | Run `npm run deploy-token-airdrop` | ⬜ |
| 5 | Fund DAO Safe with OP ETH for gas | ⬜ |
| 6 | Setup Snapshot space | ⬜ |
| 7 | Deploy Claim UI | ⬜ |
| 8 | Day 30: Deploy Governor + Timelock | ⬜ |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                  SOVEREIGN CONSTELLATION (SOV)                       │
│                      Optimism Mainnet                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    TOKEN ALLOCATION                           │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  40% │ Community Airdrop  │ MerkleDistributor │ 400M SOV     │   │
│  │  40% │ DAO Treasury       │ Gnosis Safe 3/5   │ 400M SOV     │   │
│  │  10% │ Core Team          │ Timelock Vesting  │ 100M SOV     │   │
│  │  10% │ Future/Liquidity   │ Deployer Wallet   │ 100M SOV     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   MERKLE    │    │   GNOSIS    │    │  TIMELOCK   │             │
│  │ DISTRIBUTOR │    │    SAFE     │    │  CONTROLLER │             │
│  │             │    │   (3/5)     │    │             │             │
│  │ claim()     │    │ execTx()    │    │ schedule()  │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            │                                        │
│                     ┌──────┴──────┐                                 │
│                     │  GOVERNOR   │  ← Day 30                       │
│                     │  (1% quorum)│                                 │
│                     └─────────────┘                                 │
│                            │                                        │
│                     ┌──────┴──────┐                                 │
│                     │  SNAPSHOT   │  ← Day 0-30                     │
│                     │  (off-chain)│                                 │
│                     └─────────────┘                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

*T=∞ = T=0 — The Sovereign Constellation awaits ignition.*
