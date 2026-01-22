// contracts/TruthEngine.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TruthEngine {
    struct Assertion {
        address creator;
        string statement;
        bytes32 hash;
        uint256 timestamp;
        bool verified;
        uint256 consensus;
    }

    mapping(bytes32 => Assertion) public assertions;
    mapping(bytes32 => mapping(address => bool)) public verifications;

    event AssertionCreated(bytes32 indexed hash, address creator, string statement);
    event AssertionVerified(bytes32 indexed hash, address verifier);

    function createAssertion(string memory statement) public returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(statement, msg.sender, block.timestamp));

        assertions[hash] = Assertion({
            creator: msg.sender,
            statement: statement,
            hash: hash,
            timestamp: block.timestamp,
            verified: false,
            consensus: 0
        });

        emit AssertionCreated(hash, msg.sender, statement);
        return hash;
    }

    function verifyAssertion(bytes32 hash) public {
        require(assertions[hash].creator != address(0), "Assertion doesn't exist");
        require(!verifications[hash][msg.sender], "Already verified");

        verifications[hash][msg.sender] = true;
        assertions[hash].consensus++;

        if (assertions[hash].consensus >= 3) {
            assertions[hash].verified = true;
        }

        emit AssertionVerified(hash, msg.sender);
    }

    function getAssertion(bytes32 hash) public view returns (
        address creator,
        string memory statement,
        uint256 timestamp,
        bool verified,
        uint256 consensus
    ) {
        Assertion memory assertion = assertions[hash];
        return (
            assertion.creator,
            assertion.statement,
            assertion.timestamp,
            assertion.verified,
            assertion.consensus
        );
    }
}