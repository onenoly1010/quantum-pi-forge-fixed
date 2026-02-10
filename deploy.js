const { ethers } = require("ethers");

// Your private key (from MetaMask)
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // Get from MetaMask: Account Details → Export Private Key

// Polygon RPC URL (free)
const POLYGON_RPC = "https://polygon-rpc.com";

// Contract code
const contractCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OINIOToken {
    string public constant name = "OINIO Token";
    string public constant symbol = "OINIO";
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 1_000_000_000 * 10**18;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(address initialOwner) {
        _balances[initialOwner] = totalSupply;
        emit Transfer(address(0), initialOwner, totalSupply);
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
    
    function burn(uint256 amount) public {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
`;

async function deploy() {
  // Connect to Polygon
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying from:", wallet.address);
  console.log(
    "Balance:",
    ethers.formatEther(await provider.getBalance(wallet.address)),
    "POL",
  );

  // Compile and deploy
  const factory = new ethers.ContractFactory(contractCode, wallet);

  console.log("Deploying contract...");
  const contract = await factory.deploy(
    "0x335651BD160fDA89C9E7A095dF9Dc1BB9f3cF4DC",
  );

  console.log("Transaction hash:", contract.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");

  await contract.waitForDeployment();

  console.log("✅ CONTRACT DEPLOYED!");
  console.log("Contract address:", await contract.getAddress());
  console.log(
    "Check on Polygonscan: https://polygonscan.com/address/" +
      (await contract.getAddress()),
  );
}

deploy().catch(console.error);
