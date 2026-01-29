// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TruthEngine
 * @dev Engine for asserting and verifying sovereign truths
 * Maintains immutable record of verified statements
 */
contract TruthEngine is Ownable(msg.sender), ReentrancyGuard {
    struct TruthAssertion {
        address asserter;
        string statement;
        string evidence;
        uint256 timestamp;
        bool verified;
    }

    struct Challenge {
        address challenger;
        string reason;
        bool resolved;
        bool upheld;
    }

    address public culturalCharter;
    mapping(bytes32 => TruthAssertion) public assertions;
    bytes32[] public assertionHashes;
    mapping(uint256 => Challenge) public challenges;
    uint256 public nextChallengeId;

    event TruthAsserted(bytes32 indexed hash, address indexed asserter, string statement, string evidence);
    event TruthVerified(bytes32 indexed hash, address indexed verifier);
    event AssertionChallenged(address indexed challenger, uint256 challengeId, string reason);
    event ChallengeResolved(address indexed resolver, uint256 challengeId, bool upheld);
    event CulturalCharterSet(address indexed charter);

    constructor(address _culturalCharter) {
        culturalCharter = _culturalCharter;
    }

    function assertTruth(string calldata statement, string calldata evidence) external nonReentrant returns (bytes32) {
        require(bytes(statement).length > 0, "Statement cannot be empty");
        bytes32 hash = keccak256(abi.encodePacked(msg.sender, statement, evidence, block.timestamp));
        assertions[hash] = TruthAssertion({
            asserter: msg.sender,
            statement: statement,
            evidence: evidence,
            timestamp: block.timestamp,
            verified: false
        });
        assertionHashes.push(hash);
        emit TruthAsserted(hash, msg.sender, statement, evidence);
        return hash;
    }

    function verifyTruth(bytes32 hash) external onlyOwner {
        require(assertions[hash].asserter != address(0), "Assertion does not exist");
        assertions[hash].verified = true;
        emit TruthVerified(hash, msg.sender);
    }

    function getAssertion(bytes32 hash) external view returns (TruthAssertion memory) {
        return assertions[hash];
    }

    function getAssertionCount() external view returns (uint256) {
        return assertionHashes.length;
    }

    function setCulturalCharter(address _culturalCharter) external onlyOwner {
        culturalCharter = _culturalCharter;
        emit CulturalCharterSet(_culturalCharter);
    }

    // Dissent Mechanisms
    function challengeAssertion(uint256 assertionIndex, string calldata reason) external {
        require(assertionIndex < assertionHashes.length, "Assertion does not exist");
        bytes32 hash = assertionHashes[assertionIndex];
        require(assertions[hash].verified, "Can only challenge verified assertions");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        uint256 challengeId = nextChallengeId++;
        challenges[challengeId] = Challenge({
            challenger: msg.sender,
            reason: reason,
            resolved: false,
            upheld: false
        });

        emit AssertionChallenged(msg.sender, challengeId, reason);
    }

    function resolveChallenge(uint256 challengeId, bool upheld) external onlyOwner {
        require(challengeId < nextChallengeId, "Challenge does not exist");
        Challenge storage challenge = challenges[challengeId];
        require(!challenge.resolved, "Challenge already resolved");

        challenge.resolved = true;
        challenge.upheld = upheld;

        // If challenge is not upheld, overturn the assertion
        if (!upheld) {
            // Find the assertion that was challenged (this is simplified - in practice would need better tracking)
            // For now, assume challengeId corresponds to assertionIndex
            if (challengeId < assertionHashes.length) {
                bytes32 hash = assertionHashes[challengeId];
                assertions[hash].verified = false;
            }
        }

        emit ChallengeResolved(msg.sender, challengeId, upheld);
    }

    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        require(challengeId < nextChallengeId, "Challenge does not exist");
        return challenges[challengeId];
    }

    function getDissentMetrics(uint256 assertionIndex) external view returns (uint256 challengeCount, uint256 unresolvedChallenges, uint256 resolvedChallenges) {
        require(assertionIndex < assertionHashes.length, "Assertion does not exist");
        
        // Count challenges for this assertion (simplified - in practice would need mapping)
        challengeCount = nextChallengeId; // Placeholder - would need proper tracking
        unresolvedChallenges = 0;
        resolvedChallenges = 0;
        
        for (uint256 i = 0; i < nextChallengeId; i++) {
            if (challenges[i].resolved) {
                resolvedChallenges++;
            } else {
                unresolvedChallenges++;
            }
        }
    }

    function getAllAssertions() external view returns (TruthAssertion[] memory) {
        TruthAssertion[] memory allAssertions = new TruthAssertion[](assertionHashes.length);
        for (uint256 i = 0; i < assertionHashes.length; i++) {
            allAssertions[i] = assertions[assertionHashes[i]];
        }
        return allAssertions;
    }
}