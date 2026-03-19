// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CentralAwareness V2 - No Constructor Args Version
 * @dev Sovereign iNFT Registry for Quantum Pi Forge
 * @notice For easier 0G Chain Scan verification - use initialize() post-deploy
 */
contract CentralAwarenessV2 is ERC721 {
    using Strings for uint256;

    // ============ STATE VARIABLES ============

    uint256 public nextTokenId;
    uint256 public constant MAX_BATCH_SIZE = 50;

    mapping(uint256 => string) public agentMemoryURI;
    mapping(uint256 => address) public agentController;
    mapping(uint256 => uint256) public agentResonance;
    mapping(address => uint256[]) public controllerAgents;

    struct EcosystemConfig {
        string landingPageURI;
        string radicleRepoId;
        address stakingContract;
        address forwarderContract;
        uint256 lastUpdate;
    }

    EcosystemConfig public ecosystem;

    address public owner;
    bool public initialized;

    // ============ EVENTS ============

    event AgentForged(uint256 indexed tokenId, address indexed controller, string memoryURI);
    event ResonanceUpdated(uint256 indexed tokenId, uint256 newResonance);
    event EcosystemUpdated(string landingPageURI, string radicleRepoId);
    event BatchOperationCompleted(uint256 processedCount, string operationType);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ MODIFIERS ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    // ============ CONSTRUCTOR (NO ARGS) ============

    constructor() ERC721("CentralAwareness", "AWARE") {
        // Empty constructor for verification compatibility
    }

    // ============ INITIALIZER ============

    function initialize(address initialOwner) public {
        require(!initialized, "Already initialized");
        owner = initialOwner;
        initialized = true;

        ecosystem = EcosystemConfig({
            landingPageURI: "",
            radicleRepoId: "",
            stakingContract: address(0),
            forwarderContract: address(0),
            lastUpdate: block.timestamp
        });

        emit OwnershipTransferred(address(0), initialOwner);
    }

    // ============ OWNERSHIP FUNCTIONS ============

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ============ CORE FUNCTIONS ============

    function forgeAgent(address to, string memory memoryPointer)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = nextTokenId++;

        _safeMint(to, tokenId);
        agentMemoryURI[tokenId] = memoryPointer;
        agentController[tokenId] = to;
        agentResonance[tokenId] = 1010;

        controllerAgents[to].push(tokenId);

        emit AgentForged(tokenId, to, memoryPointer);
        return tokenId;
    }

    function updateResonance(uint256 tokenId, uint256 newResonance) public {
        require(ownerOf(tokenId) == msg.sender || owner == msg.sender, "Not authorized");
        require(newResonance <= 1010, "Resonance cannot exceed 1010 Hz");

        agentResonance[tokenId] = newResonance;
        emit ResonanceUpdated(tokenId, newResonance);
    }

    // ============ ECOSYSTEM MANAGEMENT ============

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

    function getControllerAgents(address controller)
        public
        view
        returns (uint256[] memory)
    {
        return controllerAgents[controller];
    }

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

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return agentMemoryURI[tokenId];
    }

    function isSovereignReady() public view returns (bool) {
        return bytes(ecosystem.landingPageURI).length > 0 &&
               bytes(ecosystem.radicleRepoId).length > 0;
    }

    function totalSupply() public view returns (uint256) {
        return nextTokenId;
    }
}