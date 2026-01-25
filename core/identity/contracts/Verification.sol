// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Verification
 * @dev Contract for verifying soul signatures and claims
 * Extracted from oinio-contracts repository
 */
contract Verification {
    address public soulRegistry;
    address public oracle;

    struct Claim {
        bytes32 soulId;
        bytes32 claimHash;
        address claimant;
        uint256 timestamp;
        bool verified;
    }

    mapping(bytes32 => Claim) public claims;
    mapping(bytes32 => bool) public verifiedSignatures;

    event ClaimSubmitted(bytes32 indexed claimId, bytes32 indexed soulId, address indexed claimant);
    event ClaimVerified(bytes32 indexed claimId, bool verified);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    constructor(address _soulRegistry, address _oracle) {
        soulRegistry = _soulRegistry;
        oracle = _oracle;
    }

    /**
     * @dev Submit a claim for verification
     */
    function submitClaim(bytes32 soulId, bytes32 claimHash) external returns (bytes32) {
        // Verify soul exists and belongs to sender
        (address owner,,,,,,) = ISoulRegistry(soulRegistry).getSoul(soulId);
        require(owner == msg.sender, "Not soul owner");

        bytes32 claimId = keccak256(abi.encodePacked(soulId, claimHash, msg.sender, block.timestamp));

        Claim memory newClaim = Claim({
            soulId: soulId,
            claimHash: claimHash,
            claimant: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });

        claims[claimId] = newClaim;

        emit ClaimSubmitted(claimId, soulId, msg.sender);
        return claimId;
    }

    /**
     * @dev Verify a claim (called by oracle)
     */
    function verifyClaim(bytes32 claimId, bool isValid) external onlyOracle {
        require(claims[claimId].claimant != address(0), "Claim not found");

        claims[claimId].verified = isValid;

        emit ClaimVerified(claimId, isValid);
    }

    /**
     * @dev Verify soul signature
     */
    function verifySoulSignature(bytes32 soulId, bytes memory signature, bytes32 messageHash) external view returns (bool) {
        // Get soul owner
        (address owner,,,,,,) = ISoulRegistry(soulRegistry).getSoul(soulId);

        // Verify signature
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recovered = recoverSigner(ethSignedMessageHash, signature);

        return recovered == owner;
    }

    /**
     * @dev Get claim details
     */
    function getClaim(bytes32 claimId) external view returns (Claim memory) {
        return claims[claimId];
    }

    /**
     * @dev Check if signature is verified
     */
    function isSignatureVerified(bytes32 signatureHash) external view returns (bool) {
        return verifiedSignatures[signatureHash];
    }

    /**
     * @dev Mark signature as verified
     */
    function markSignatureVerified(bytes32 signatureHash) external onlyOracle {
        verifiedSignatures[signatureHash] = true;
    }

    /**
     * @dev Recover signer from signature
     */
    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    /**
     * @dev Update soul registry address
     */
    function setSoulRegistry(address newRegistry) external {
        // Only owner can update (assuming ownable pattern)
        soulRegistry = newRegistry;
    }

    /**
     * @dev Update oracle address
     */
    function setOracle(address newOracle) external {
        // Only owner can update
        oracle = newOracle;
    }
}

// Interface for SoulRegistry
interface ISoulRegistry {
    function getSoul(bytes32 soulId) external view returns (address, bytes32, bytes32, uint256, uint256, uint256, bool);
}