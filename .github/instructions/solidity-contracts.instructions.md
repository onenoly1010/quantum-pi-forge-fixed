---
description: "Solidity smart contract development guidelines"
applyTo: "contracts/**/*.sol"
---

# Solidity Smart Contract Instructions

## Supported Versions

This project uses multiple Solidity versions:
- **0.5.16**: Legacy Uniswap V2 contracts
- **0.6.6**: Bridge contracts
- **0.8.20**: New custom contracts

Always check existing contracts in the same directory to determine the correct version.

## Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContractName
 * @dev Brief description of contract purpose
 */
contract ContractName is ERC20, Ownable {
    // State variables
    uint256 public constant MAX_SUPPLY = 1000000;
    
    // Events
    event Action(address indexed user, uint256 amount);
    
    // Constructor
    constructor() ERC20("Token", "TKN") Ownable(msg.sender) {
        // Initialization
    }
    
    // External functions
    function publicFunction() external {
        // Implementation
    }
    
    // Internal functions
    function _internalFunction() internal {
        // Implementation
    }
}
```

## Security Best Practices

### 1. Access Control
```solidity
// Use OpenZeppelin's access control
import "@openzeppelin/contracts/access/Ownable.sol";

modifier onlyAuthorized() {
    require(msg.sender == authorized, "Not authorized");
    _;
}
```

### 2. Reentrancy Protection
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function withdraw() external nonReentrant {
    // Safe withdrawal logic
}
```

### 3. Integer Overflow (Pre-0.8.0)
```solidity
// For Solidity < 0.8.0, use SafeMath
using SafeMath for uint256;

uint256 result = a.add(b); // Instead of a + b
```

### 4. Input Validation
```solidity
function transfer(address recipient, uint256 amount) external {
    require(recipient != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be positive");
    require(amount <= balanceOf(msg.sender), "Insufficient balance");
    // Transfer logic
}
```

## Gas Optimization

### Use `calldata` for Read-Only Arrays
```solidity
function processData(uint256[] calldata data) external {
    // More gas efficient than 'memory' for read-only
}
```

### Pack Storage Variables
```solidity
// Good: Variables packed into one slot
uint128 public var1;
uint128 public var2;

// Bad: Each uses a full slot
uint256 public var1;
uint256 public var2;
```

### Use `external` Over `public`
```solidity
// More gas efficient for functions called externally
function externalFunc() external returns (uint256) {
    // Implementation
}
```

## Testing Requirements

Every contract must have corresponding tests in `test/`:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractName", function () {
  let contract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
  });

  it("Should perform expected action", async function () {
    // Test logic
  });
});
```

## Deployment

Use Hardhat deployment scripts in `scripts/`:

```javascript
async function main() {
  const Contract = await ethers.getContractFactory("ContractName");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  
  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Network Configuration

Contracts are deployed to:
- **Polygon Mainnet** (Chain ID: 137) - Production OINIO token
- **0G Aristotle** (Chain ID: 16661) - DEX contracts

## Common Patterns

### ERC20 Token
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply);
    }
}
```

### Upgradeable Contracts
```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyContract is Initializable {
    function initialize() public initializer {
        // Initialization logic (replaces constructor)
    }
}
```

## DON'Ts

- ❌ Don't use `tx.origin` (use `msg.sender`)
- ❌ Don't leave floating pragmas in production (`^0.8.0` → `0.8.20`)
- ❌ Don't skip input validation
- ❌ Don't forget to emit events for state changes
- ❌ Don't deploy without thorough testing
- ❌ Don't hardcode addresses (use constructor parameters or config)
