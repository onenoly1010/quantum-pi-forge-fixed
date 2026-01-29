// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LeverageProtocol
 * @dev Protocol for leveraging sovereign operations with 8x multiplier
 * Amplifies the impact of sovereign actions on the 0G network
 */
contract LeverageProtocol is Ownable(msg.sender), ReentrancyGuard {
    uint256 public constant POWER_MULTIPLIER = 8;
    address public culturalCharter;
    mapping(address => uint256) public leveragePoints;
    mapping(address => uint256) public dissentLeveragePoints;
    mapping(address => uint256) public resolutionLeveragePoints;
    mapping(address => uint256) public lastLeverageTime;

    event LeverageApplied(address indexed user, uint256 baseAmount, uint256 leveragedAmount);
    event DissentLeverageActivated(address indexed user, uint256 dissentAmount, uint256 amplifiedAmount);
    event ResolutionLeverageApplied(address indexed resolver, address indexed target, uint256 amount, uint256 amplifiedAmount);
    event LeverageRenewed(address indexed user);
    event CulturalCharterSet(address indexed charter);

    constructor(address _culturalCharter) {
        culturalCharter = _culturalCharter;
    }

    function applyLeverage(uint256 baseAmount) external nonReentrant returns (uint256) {
        require(baseAmount > 0, "Base amount must be positive");
        uint256 leveragedAmount = baseAmount * POWER_MULTIPLIER;
        leveragePoints[msg.sender] += leveragedAmount;
        emit LeverageApplied(msg.sender, baseAmount, leveragedAmount);
        return leveragedAmount;
    }

    function getLeveragePoints(address user) external view returns (uint256) {
        return leveragePoints[user];
    }

    // Dissent Leverage Functions
    function calculateDissentLeverage(uint256 dissentAmount) external pure returns (uint256) {
        return dissentAmount * POWER_MULTIPLIER;
    }

    function activateDissentLeverage(uint256 dissentAmount) external nonReentrant {
        require(dissentAmount > 0, "Dissent amount must be positive");
        require(dissentAmount <= 1000 ether, "Dissent leverage exceeds maximum");

        uint256 amplifiedAmount = dissentAmount * POWER_MULTIPLIER;
        dissentLeveragePoints[msg.sender] += amplifiedAmount;
        lastLeverageTime[msg.sender] = block.timestamp;

        emit DissentLeverageActivated(msg.sender, dissentAmount, amplifiedAmount);
    }

    function getDissentLeverageUtilization(address user) external view returns (uint256) {
        return dissentLeveragePoints[user];
    }

    function applyResolutionLeverage(address target, uint256 amount) external nonReentrant {
        require(amount > 0, "Resolution amount must be positive");

        uint256 amplifiedAmount = amount * POWER_MULTIPLIER;
        resolutionLeveragePoints[target] += amplifiedAmount;

        emit ResolutionLeverageApplied(msg.sender, target, amount, amplifiedAmount);
    }

    function getResolutionLeverage(address target) external view returns (uint256) {
        return resolutionLeveragePoints[target];
    }

    function getDecayedLeverage(address user) external view returns (uint256) {
        uint256 timeSinceLastLeverage = block.timestamp - lastLeverageTime[user];
        if (timeSinceLastLeverage > 30 days) {
            return 0; // Leverage fully decayed
        }
        uint256 decayFactor = (30 days - timeSinceLastLeverage) * 1e18 / 30 days;
        return leveragePoints[user] * decayFactor / 1e18;
    }

    function renewLeverage() external nonReentrant {
        require(leveragePoints[msg.sender] > 0, "No leverage to renew");
        lastLeverageTime[msg.sender] = block.timestamp;
        emit LeverageRenewed(msg.sender);
    }

    function setCulturalCharter(address _culturalCharter) external onlyOwner {
        culturalCharter = _culturalCharter;
        emit CulturalCharterSet(_culturalCharter);
    }
}