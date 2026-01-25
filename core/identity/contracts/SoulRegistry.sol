// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoulRegistry
 * @dev Core contract for OINIO soul registration and management
 * Extracted from oinio-contracts repository
 */
contract SoulRegistry {
    struct Soul {
        address owner;
        bytes32 soulId;
        bytes32 piUid; // Pi Network UID
        uint256 coherence;
        uint256 createdAt;
        uint256 lastReading;
        bool isActive;
    }

    mapping(bytes32 => Soul) public souls;
    mapping(address => bytes32[]) public ownerSouls;
    mapping(bytes32 => bytes32) public piUidToSoulId;

    address public oracle;
    address public admin;

    event SoulMinted(bytes32 indexed soulId, address indexed owner, bytes32 piUid);
    event SoulUpdated(bytes32 indexed soulId, uint256 coherence);
    event SoulTransferred(bytes32 indexed soulId, address indexed from, address indexed to);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }

    constructor(address _oracle) {
        admin = msg.sender;
        oracle = _oracle;
    }

    /**
     * @dev Mint a new soul for a Pi Network user
     */
    function mintSoul(bytes32 piUid, address owner) external onlyOracle returns (bytes32) {
        require(piUidToSoulId[piUid] == bytes32(0), "Soul already exists for Pi UID");

        bytes32 soulId = keccak256(abi.encodePacked(piUid, block.timestamp, owner));

        Soul memory newSoul = Soul({
            owner: owner,
            soulId: soulId,
            piUid: piUid,
            coherence: 50, // Starting coherence
            createdAt: block.timestamp,
            lastReading: block.timestamp,
            isActive: true
        });

        souls[soulId] = newSoul;
        ownerSouls[owner].push(soulId);
        piUidToSoulId[piUid] = soulId;

        emit SoulMinted(soulId, owner, piUid);
        return soulId;
    }

    /**
     * @dev Update soul coherence after oracle reading
     */
    function updateCoherence(bytes32 soulId, uint256 newCoherence) external onlyOracle {
        require(souls[soulId].isActive, "Soul not active");
        require(newCoherence <= 100, "Coherence must be <= 100");

        souls[soulId].coherence = newCoherence;
        souls[soulId].lastReading = block.timestamp;

        emit SoulUpdated(soulId, newCoherence);
    }

    /**
     * @dev Transfer soul ownership
     */
    function transferSoul(bytes32 soulId, address newOwner) external {
        require(souls[soulId].owner == msg.sender, "Not soul owner");
        require(newOwner != address(0), "Invalid new owner");

        address oldOwner = souls[soulId].owner;
        souls[soulId].owner = newOwner;

        // Update owner mappings
        _removeFromOwnerSouls(oldOwner, soulId);
        ownerSouls[newOwner].push(soulId);

        emit SoulTransferred(soulId, oldOwner, newOwner);
    }

    /**
     * @dev Get soul by ID
     */
    function getSoul(bytes32 soulId) external view returns (Soul memory) {
        return souls[soulId];
    }

    /**
     * @dev Get soul by Pi UID
     */
    function getSoulByPiUid(bytes32 piUid) external view returns (Soul memory) {
        bytes32 soulId = piUidToSoulId[piUid];
        return souls[soulId];
    }

    /**
     * @dev Get souls owned by address
     */
    function getSoulsByOwner(address owner) external view returns (bytes32[] memory) {
        return ownerSouls[owner];
    }

    /**
     * @dev Check if soul exists
     */
    function soulExists(bytes32 soulId) external view returns (bool) {
        return souls[soulId].isActive;
    }

    /**
     * @dev Update oracle address
     */
    function setOracle(address newOracle) external onlyAdmin {
        oracle = newOracle;
    }

    /**
     * @dev Internal function to remove soul from owner's list
     */
    function _removeFromOwnerSouls(address owner, bytes32 soulId) internal {
        bytes32[] storage ownerSoulList = ownerSouls[owner];
        for (uint i = 0; i < ownerSoulList.length; i++) {
            if (ownerSoulList[i] == soulId) {
                ownerSoulList[i] = ownerSoulList[ownerSoulList.length - 1];
                ownerSoulList.pop();
                break;
            }
        }
    }
}