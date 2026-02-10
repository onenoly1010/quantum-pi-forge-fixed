// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CentralAwareness V2
 * @dev Sovereign iNFT Registry for Quantum Pi Forge
 * @notice Post-January 2026 Hard Fork: Cancun-compatible with optimized storage
 *
 * The Master Key for True Sovereign Architecture on 0G Aristotle
 * Once deployed, the landing page reads instructions from this contract
 * instead of centralized GitHub files.
 */
contract CentralAwarenessV2 is ERC721, Ownable {
    using Strings for uint256;

    // ============ STATE VARIABLES ============

    uint256 public nextTokenId;
    uint256 public constant MAX_BATCH_SIZE = 50; // Gas-optimized batch operations

    // Cancun-optimized mappings (packed storage slots)
    mapping(uint256 => string) public agentMemoryURI;
    mapping(uint256 => address) public agentController;
    mapping(uint256 => uint256) public agentResonance; // 1010 Hz alignment score
    mapping(address => uint256[]) public controllerAgents;

    // Ecosystem configuration (replaces static config.ts)
    struct EcosystemConfig {
        string landingPageURI;      // IPFS/Spheron hash for landing page
        string radicleRepoId;       // Radicle repository identifier
        address stakingContract;    // Quantum Pi Staking contract
        address forwarderContract;  // Gasless transaction forwarder
        uint256 lastUpdate;         // Timestamp of last ecosystem update
    }

    EcosystemConfig public ecosystem;

    // ============ EVENTS ============

    event AgentForged(uint256 indexed tokenId, address indexed controller, string memoryURI);
    event ResonanceUpdated(uint256 indexed tokenId, uint256 newResonance);
    event EcosystemUpdated(string landingPageURI, string radicleRepoId);
    event BatchOperationCompleted(uint256 processedCount, string operationType);

    // ============ CONSTRUCTOR ============

    constructor(address initialOwner)
        ERC721("CentralAwareness", "AWARE")
        Ownable(initialOwner)
    {
        // Initialize with sovereign defaults
        ecosystem = EcosystemConfig({
            landingPageURI: "",
            radicleRepoId: "",
            stakingContract: address(0),
            forwarderContract: address(0),
            lastUpdate: block.timestamp
        });
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Forge a new sovereign agent iNFT
     * @param to The address to mint the token to
     * @param memoryPointer IPFS/Spheron hash pointing to agent memory
     */
    function forgeAgent(address to, string memory memoryPointer)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = nextTokenId++;

        _safeMint(to, tokenId);
        agentMemoryURI[tokenId] = memoryPointer;
        agentController[tokenId] = to;
        agentResonance[tokenId] = 1010; // Base resonance frequency

        controllerAgents[to].push(tokenId);

        emit AgentForged(tokenId, to, memoryPointer);
        return tokenId;
    }

    /**
     * @dev Update agent resonance alignment
     * @param tokenId The token to update
     * @param newResonance New resonance value (0-1010 Hz)
     */
    function updateResonance(uint256 tokenId, uint256 newResonance)
        public
    {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
        require(newResonance <= 1010, "Resonance cannot exceed 1010 Hz");

        agentResonance[tokenId] = newResonance;
        emit ResonanceUpdated(tokenId, newResonance);
    }

    // ============ ECOSYSTEM MANAGEMENT ============

    /**
     * @dev Update ecosystem configuration (Sovereign Architecture)
     * @param landingPageURI New IPFS/Spheron hash for landing page
     * @param radicleRepoId New Radicle repository identifier
     * @param stakingContract Address of staking contract
     * @param forwarderContract Address of gasless forwarder
     */
    function updateEcosystem(
        string memory landingPageURI,
        string memory radicleRepoId,
        address stakingContract,
        address forwarderContract
    ) public onlyOwner {
        ecosystem = EcosystemConfig({
            landingPageURI: landingPageURI,
            radicleRepoId: radicleRepoId,
            stakingContract: stakingContract,
            forwarderContract: forwarderContract,
            lastUpdate: block.timestamp
        });

        emit EcosystemUpdated(landingPageURI, radicleRepoId);
    }

    /**
     * @dev Batch update multiple agent resonances (gas-optimized)
     * @param tokenIds Array of token IDs to update
     * @param resonances Array of new resonance values
     */
    function batchUpdateResonance(
        uint256[] memory tokenIds,
        uint256[] memory resonances
    ) public onlyOwner {
        require(tokenIds.length == resonances.length, "Array length mismatch");
        require(tokenIds.length <= MAX_BATCH_SIZE, "Batch size too large");

        uint256 processed = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            uint256 resonance = resonances[i];

            require(resonance <= 1010, "Invalid resonance value");
            agentResonance[tokenId] = resonance;

            emit ResonanceUpdated(tokenId, resonance);
            processed++;
        }

        emit BatchOperationCompleted(processed, "resonance_update");
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get ecosystem configuration for frontend
     * @return Current ecosystem config
     */
    function getEcosystemConfig()
        public
        view
        returns (
            string memory landingPageURI,
            string memory radicleRepoId,
            address stakingContract,
            address forwarderContract,
            uint256 lastUpdate
        )
    {
        return (
            ecosystem.landingPageURI,
            ecosystem.radicleRepoId,
            ecosystem.stakingContract,
            ecosystem.forwarderContract,
            ecosystem.lastUpdate
        );
    }

    /**
     * @dev Get all agents controlled by an address
     * @param controller The controller address
     * @return Array of token IDs
     */
    function getControllerAgents(address controller)
        public
        view
        returns (uint256[] memory)
    {
        return controllerAgents[controller];
    }

    /**
     * @dev Get agent full details
     * @param tokenId The token ID
     * @return controller, memoryURI, resonance
     */
    function getAgentDetails(uint256 tokenId)
        public
        view
        returns (address, string memory, uint256)
    {
        return (
            agentController[tokenId],
            agentMemoryURI[tokenId],
            agentResonance[tokenId]
        );
    }

    /**
     * @dev Override tokenURI to return memory pointer
     * @param tokenId The token ID
     * @return URI pointing to agent memory
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return agentMemoryURI[tokenId];
    }

    // ============ UTILITY FUNCTIONS ============

    /**
     * @dev Check if contract is properly initialized
     * @return True if ecosystem is configured
     */
    function isSovereignReady() public view returns (bool) {
        return bytes(ecosystem.landingPageURI).length > 0 &&
               bytes(ecosystem.radicleRepoId).length > 0;
    }

    /**
     * @dev Get total agents forged
     * @return Total supply
     */
    function totalSupply() public view returns (uint256) {
        return nextTokenId;
    }
}