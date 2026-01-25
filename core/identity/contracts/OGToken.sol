// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OGToken
 * @dev OG token for OINIO ecosystem verification and rewards
 * Extracted from oinio-contracts repository
 */
contract OGToken is ERC20, Ownable {
    address public soulRegistry;
    address public oracle;

    // OG status tracking
    mapping(address => bool) public isOG;
    mapping(address => uint256) public ogSince;

    // Rewards
    uint256 public constant OG_REWARD = 100 * 10**18; // 100 OG tokens
    uint256 public constant READING_REWARD = 10 * 10**18; // 10 OG tokens per reading

    event OGStatusGranted(address indexed user, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 amount);

    modifier onlySoulRegistry() {
        require(msg.sender == soulRegistry, "Only SoulRegistry can call");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    constructor(
        address _soulRegistry,
        address _oracle
    ) ERC20("OINIO OG Token", "OG") {
        soulRegistry = _soulRegistry;
        oracle = _oracle;

        // Mint initial supply to contract for rewards
        _mint(address(this), 1000000 * 10**18); // 1M OG tokens
    }

    /**
     * @dev Grant OG status to a user
     */
    function grantOGStatus(address user) external onlySoulRegistry {
        require(!isOG[user], "User already has OG status");

        isOG[user] = true;
        ogSince[user] = block.timestamp;

        // Mint OG reward
        _transfer(address(this), user, OG_REWARD);

        emit OGStatusGranted(user, block.timestamp);
    }

    /**
     * @dev Check if user has OG status
     */
    function hasOGStatus(address user) external view returns (bool) {
        return isOG[user];
    }

    /**
     * @dev Get OG status info
     */
    function getOGInfo(address user) external view returns (bool status, uint256 since) {
        return (isOG[user], ogSince[user]);
    }

    /**
     * @dev Reward user for oracle reading (called by oracle)
     */
    function rewardReading(address user) external onlyOracle {
        require(isOG[user], "User must have OG status for reading rewards");

        _transfer(address(this), user, READING_REWARD);

        emit RewardClaimed(user, READING_REWARD);
    }

    /**
     * @dev Update soul registry address
     */
    function setSoulRegistry(address newRegistry) external onlyOwner {
        soulRegistry = newRegistry;
    }

    /**
     * @dev Update oracle address
     */
    function setOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }

    /**
     * @dev Mint additional tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}