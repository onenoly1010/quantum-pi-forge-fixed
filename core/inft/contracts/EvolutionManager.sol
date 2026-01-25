// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EvolutionManager
 * @dev Manages iNFT evolution triggers and rules on-chain
 * Extracted from oinio-contracts
 */
contract EvolutionManager is Ownable {
    address public hybridNFT;
    address public oracle;

    struct EvolutionTrigger {
        uint256 triggerId;
        uint256 tokenId;
        bytes32 triggerType;     // 'oracle_reading', 'time_based', 'interaction'
        bytes32 condition;       // Specific condition hash
        uint256 activationTime;  // When trigger becomes active
        bool executed;          // Whether trigger has been executed
    }

    mapping(uint256 => EvolutionTrigger[]) public tokenTriggers;
    mapping(bytes32 => bool) public validTriggerTypes;

    uint256 public constant MAX_TRIGGERS_PER_TOKEN = 10;
    uint256 public constant TRIGGER_LIFETIME = 30 days;

    event TriggerCreated(uint256 indexed tokenId, uint256 triggerId, bytes32 triggerType);
    event TriggerExecuted(uint256 indexed tokenId, uint256 triggerId);
    event TriggerExpired(uint256 indexed tokenId, uint256 triggerId);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    modifier onlyHybridNFT() {
        require(msg.sender == hybridNFT, "Only HybridNFT can call");
        _;
    }

    constructor(address _hybridNFT, address _oracle) {
        hybridNFT = _hybridNFT;
        oracle = _oracle;

        // Initialize valid trigger types
        validTriggerTypes[keccak256("oracle_reading")] = true;
        validTriggerTypes[keccak256("time_based")] = true;
        validTriggerTypes[keccak256("interaction")] = true;
        validTriggerTypes[keccak256("coherence_threshold")] = true;
    }

    /**
     * @dev Create evolution trigger for iNFT
     */
    function createTrigger(
        uint256 tokenId,
        bytes32 triggerType,
        bytes32 condition,
        uint256 delay
    ) external onlyOracle returns (uint256) {
        require(validTriggerTypes[triggerType], "Invalid trigger type");

        EvolutionTrigger[] storage triggers = tokenTriggers[tokenId];
        require(triggers.length < MAX_TRIGGERS_PER_TOKEN, "Max triggers reached");

        uint256 triggerId = triggers.length;
        uint256 activationTime = block.timestamp + delay;

        EvolutionTrigger memory newTrigger = EvolutionTrigger({
            triggerId: triggerId,
            tokenId: tokenId,
            triggerType: triggerType,
            condition: condition,
            activationTime: activationTime,
            executed: false
        });

        triggers.push(newTrigger);

        emit TriggerCreated(tokenId, triggerId, triggerType);
        return triggerId;
    }

    /**
     * @dev Execute evolution trigger
     */
    function executeTrigger(uint256 tokenId, uint256 triggerId) external onlyOracle {
        EvolutionTrigger[] storage triggers = tokenTriggers[tokenId];
        require(triggerId < triggers.length, "Trigger does not exist");

        EvolutionTrigger storage trigger = triggers[triggerId];
        require(!trigger.executed, "Trigger already executed");
        require(block.timestamp >= trigger.activationTime, "Trigger not yet active");

        trigger.executed = true;

        emit TriggerExecuted(tokenId, triggerId);
    }

    /**
     * @dev Check if trigger can be executed
     */
    function canExecuteTrigger(uint256 tokenId, uint256 triggerId) external view returns (bool) {
        if (tokenId >= tokenTriggers[tokenId].length) return false;

        EvolutionTrigger memory trigger = tokenTriggers[tokenId][triggerId];
        return !trigger.executed && block.timestamp >= trigger.activationTime;
    }

    /**
     * @dev Get active triggers for token
     */
    function getActiveTriggers(uint256 tokenId) external view returns (uint256[] memory) {
        EvolutionTrigger[] memory triggers = tokenTriggers[tokenId];
        uint256 activeCount = 0;

        // Count active triggers
        for (uint256 i = 0; i < triggers.length; i++) {
            if (!triggers[i].executed && block.timestamp >= triggers[i].activationTime) {
                activeCount++;
            }
        }

        uint256[] memory activeTriggers = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < triggers.length; i++) {
            if (!triggers[i].executed && block.timestamp >= triggers[i].activationTime) {
                activeTriggers[index] = i;
                index++;
            }
        }

        return activeTriggers;
    }

    /**
     * @dev Clean expired triggers
     */
    function cleanExpiredTriggers(uint256 tokenId) external {
        EvolutionTrigger[] storage triggers = tokenTriggers[tokenId];
        uint256 writeIndex = 0;

        for (uint256 i = 0; i < triggers.length; i++) {
            EvolutionTrigger memory trigger = triggers[i];

            // Keep if not expired or not executed
            if (!trigger.executed && block.timestamp < trigger.activationTime + TRIGGER_LIFETIME) {
                if (writeIndex != i) {
                    triggers[writeIndex] = trigger;
                }
                writeIndex++;
            } else if (trigger.executed) {
                emit TriggerExpired(tokenId, trigger.triggerId);
            }
        }

        // Resize array
        while (triggers.length > writeIndex) {
            triggers.pop();
        }
    }

    /**
     * @dev Add new trigger type
     */
    function addTriggerType(bytes32 triggerType) external onlyOwner {
        validTriggerTypes[triggerType] = true;
    }

    /**
     * @dev Update contract addresses
     */
    function updateContracts(address _hybridNFT, address _oracle) external onlyOwner {
        hybridNFT = _hybridNFT;
        oracle = _oracle;
    }

    /**
     * @dev Get trigger details
     */
    function getTrigger(uint256 tokenId, uint256 triggerId) external view returns (EvolutionTrigger memory) {
        require(triggerId < tokenTriggers[tokenId].length, "Trigger does not exist");
        return tokenTriggers[tokenId][triggerId];
    }
}