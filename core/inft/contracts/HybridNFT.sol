// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HybridNFT
 * @dev Main iNFT contract combining ERC-721 with intelligent personality traits
 * Extracted and adapted from oinio-contracts and mr-nft-agent
 */
contract HybridNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct iNFT {
        uint256 tokenId;
        bytes32 soulId;           // Bound to OINIO soul
        bytes32 personalityHash;  // Hash of personality traits
        uint256 coherence;        // Current coherence level
        uint256 evolutionStage;   // Evolution stage (0-100)
        uint256 lastEvolution;    // Timestamp of last evolution
        uint256 creationTime;     // Minting timestamp
        bool isActive;           // Active status
    }

    // iNFT storage
    mapping(uint256 => iNFT) public infts;
    mapping(bytes32 => uint256[]) public soulToTokens; // Soul can own multiple iNFTs
    mapping(uint256 => bytes32[]) public tokenMemories; // iNFT memory history

    // Integration contracts
    address public oracle;
    address public soulRegistry;
    address public evolutionManager;
    address public metadataRegistry;

    // Minting parameters
    uint256 public constant MINT_PRICE = 0.01 ether; // Pi Network compatible
    uint256 public constant MAX_EVOLUTION_STAGE = 100;
    uint256 public constant EVOLUTION_COOLDOWN = 1 days;

    // Events
    event iNFTMinted(uint256 indexed tokenId, bytes32 indexed soulId, address indexed owner);
    event iNFTEvolved(uint256 indexed tokenId, uint256 newStage, uint256 coherence);
    event MemoryAdded(uint256 indexed tokenId, bytes32 memoryHash);
    event PersonalityUpdated(uint256 indexed tokenId, bytes32 newPersonalityHash);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    modifier onlyEvolutionManager() {
        require(msg.sender == evolutionManager, "Only evolution manager can call");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        require(infts[tokenId].isActive, "iNFT is not active");
        _;
    }

    constructor(
        address _oracle,
        address _soulRegistry,
        address _evolutionManager,
        address _metadataRegistry
    ) ERC721("QuantumPiForge iNFT", "iNFT") {
        oracle = _oracle;
        soulRegistry = _soulRegistry;
        evolutionManager = _evolutionManager;
        metadataRegistry = _metadataRegistry;
    }

    /**
     * @dev Mint a new iNFT bound to an OINIO soul
     */
    function mint(bytes32 soulId, bytes32 personalityHash) external payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(personalityHash != bytes32(0), "Invalid personality hash");

        // Verify soul exists and belongs to sender
        (address soulOwner,,,,,,) = ISoulRegistry(soulRegistry).getSoul(soulId);
        require(soulOwner == msg.sender, "Not soul owner");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        iNFT memory newINFT = iNFT({
            tokenId: tokenId,
            soulId: soulId,
            personalityHash: personalityHash,
            coherence: 50, // Starting coherence
            evolutionStage: 0,
            lastEvolution: block.timestamp,
            creationTime: block.timestamp,
            isActive: true
        });

        infts[tokenId] = newINFT;
        soulToTokens[soulId].push(tokenId);

        _safeMint(msg.sender, tokenId);

        emit iNFTMinted(tokenId, soulId, msg.sender);
        return tokenId;
    }

    /**
     * @dev Evolve iNFT through oracle reading
     */
    function evolve(uint256 tokenId, bytes32 newPersonalityHash, uint256 coherenceGain) external onlyOracle tokenExists(tokenId) {
        iNFT storage inft = infts[tokenId];

        require(block.timestamp >= inft.lastEvolution + EVOLUTION_COOLDOWN, "Evolution cooldown active");
        require(coherenceGain > 0 && coherenceGain <= 20, "Invalid coherence gain");

        // Update coherence and evolution
        inft.coherence = min(inft.coherence + coherenceGain, 100);
        inft.evolutionStage = min(inft.evolutionStage + 1, MAX_EVOLUTION_STAGE);
        inft.lastEvolution = block.timestamp;

        if (newPersonalityHash != bytes32(0)) {
            inft.personalityHash = newPersonalityHash;
            emit PersonalityUpdated(tokenId, newPersonalityHash);
        }

        emit iNFTEvolved(tokenId, inft.evolutionStage, inft.coherence);
    }

    /**
     * @dev Add memory to iNFT
     */
    function addMemory(uint256 tokenId, bytes32 memoryHash) external onlyOracle tokenExists(tokenId) {
        require(memoryHash != bytes32(0), "Invalid memory hash");

        tokenMemories[tokenId].push(memoryHash);
        emit MemoryAdded(tokenId, memoryHash);
    }

    /**
     * @dev Get iNFT details
     */
    function getINFT(uint256 tokenId) external view returns (iNFT memory) {
        require(_exists(tokenId), "Token does not exist");
        return infts[tokenId];
    }

    /**
     * @dev Get tokens owned by soul
     */
    function getTokensBySoul(bytes32 soulId) external view returns (uint256[] memory) {
        return soulToTokens[soulId];
    }

    /**
     * @dev Get iNFT memories
     */
    function getMemories(uint256 tokenId) external view returns (bytes32[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMemories[tokenId];
    }

    /**
     * @dev Check if token can evolve
     */
    function canEvolve(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId) || !infts[tokenId].isActive) return false;

        iNFT memory inft = infts[tokenId];
        return block.timestamp >= inft.lastEvolution + EVOLUTION_COOLDOWN &&
               inft.evolutionStage < MAX_EVOLUTION_STAGE;
    }

    /**
     * @dev Update contract addresses
     */
    function updateContracts(
        address _oracle,
        address _soulRegistry,
        address _evolutionManager,
        address _metadataRegistry
    ) external onlyOwner {
        oracle = _oracle;
        soulRegistry = _soulRegistry;
        evolutionManager = _evolutionManager;
        metadataRegistry = _metadataRegistry;
    }

    /**
     * @dev Withdraw accumulated payments
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Utility function for minimum
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev ERC721 tokenURI override for dynamic metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        // Delegate to metadata registry for dynamic metadata
        if (metadataRegistry != address(0)) {
            return IMetadataRegistry(metadataRegistry).getTokenURI(tokenId);
        }

        // Fallback static URI
        return string(abi.encodePacked("https://api.quantumpiforge.com/metadata/", Strings.toString(tokenId)));
    }
}

// Interfaces
interface ISoulRegistry {
    function getSoul(bytes32 soulId) external view returns (address, bytes32, bytes32, uint256, uint256, uint256, bool);
}

interface IMetadataRegistry {
    function getTokenURI(uint256 tokenId) external view returns (string memory);
}