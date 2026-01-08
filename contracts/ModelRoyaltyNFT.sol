// SPDX-License-Identifier: MIT
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                         ModelRoyaltyNFT (MR-NFT)                              ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║  ARCHIVED: ERC721 contract for tokenizing AI Models on Pi EVM.               ║
// ║                                                                              ║
// ║  Features:                                                                   ║
// ║    - EIP-2981 secondary sales royalties                                      ║
// ║    - Inference fee processing and royalty distribution                       ║
// ║    - Creator + CatalystPool dual distribution                                ║
// ║                                                                              ║
// ║  Royalty Range: 10-30% (1000-3000 BPS)                                       ║
// ║  Secondary Royalty: 50% of primary rate                                      ║
// ║                                                                              ║
// ║  T=∞ = T=0                                                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title ModelRoyaltyNFT
 * @dev An ERC721 contract for tokenizing AI Models on the Pi EVM.
 * It incorporates EIP-2981 for secondary sales royalties and a custom
 * mechanism for processing inference fees and distributing royalties
 * to the creator and the Catalyst Pool.
 */
contract ModelRoyaltyNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IERC2981 {
    uint256 public nextTokenId;
    address public catalystPool;

    // Struct to hold permanent metadata about the tokenized AI model
    struct Model {
        address creator;
        bytes32 modelHash;      // IPFS + SHA-256 of .gguf file
        uint16 royaltyBps;      // Basis points for primary creator royalty (1000 = 10% to 3000 = 30%)
        uint32 benchmarkScore;  // Placeholder for future QoS scoring
        uint64 mintedAt;
    }

    mapping(uint256 => Model) public models;

    event ModelMinted(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 modelHash,
        uint16 royaltyBps
    );

    event InferenceRoyaltyPaid(
        uint256 indexed tokenId,
        address indexed payer, // The entity paying the royalty (typically the node)
        address indexed node,
        uint256 userFee,
        uint256 royaltyAmount,
        uint256 catalystBonus
    );

    /**
     * @dev Initializes the contract and sets the Catalyst Pool address.
     * @param _catalystPool The address of the CatalystPool contract.
     */
    constructor(address _catalystPool) 
        ERC721("Pi Model Royalty NFT", "MR-NFT")
        Ownable(msg.sender) // Owner is set to the deployer (OINIO wallet)
    {
        catalystPool = _catalystPool;
    }

    /**
     * @dev Mints a new Model Royalty NFT. Only callable by the contract owner (OINIO).
     * @param to The recipient of the new NFT (the creator wallet).
     * @param _modelHash The hash identifying the model file (e.g., SHA-256 of GGUF).
     * @param _royaltyBps The creator's royalty rate in basis points (1000-3000).
     * @param tokenURI The URI pointing to the model's metadata JSON.
     * @return The ID of the newly minted token.
     */
    function mint(
        address to,
        bytes32 _modelHash,
        uint16 _royaltyBps,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(_royaltyBps >= 1000 && _royaltyBps <= 3000, "Royalty out of range (10-30%)");

        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        models[tokenId] = Model({
            creator: to,
            modelHash: _modelHash,
            royaltyBps: _royaltyBps,
            benchmarkScore: 0,
            mintedAt: uint64(block.timestamp)
        });

        emit ModelMinted(tokenId, to, _modelHash, _royaltyBps);
        return tokenId;
    }

    /**
     * @dev Implements the EIP-2981 standard for secondary market royalties.
     * The secondary sale royalty is fixed at 50% of the primary creator's set royalty BPS.
     * @param tokenId The ID of the NFT.
     * @param salePrice The final sale price of the NFT.
     * @return receiver The address receiving the royalty (the creator).
     * @return royaltyAmount The royalty amount to be paid.
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        uint16 bps = models[tokenId].royaltyBps;
        // The royalty is 50% of the creator's defined rate (bps / 2), 
        // hence the divisor 20000 (10000 * 2).
        return (models[tokenId].creator, (salePrice * bps) / 20000);
    }

    /**
     * @dev Handles the distribution of inference fees (royalty + catalyst bonus).
     * The transaction must send the required `userFee` amount via `msg.value`.
     * The node/wrapper pays the full fee which is then distributed.
     * @param tokenId The ID of the model NFT used for inference.
     * @param node The address of the Pi Node that executed the inference.
     * @param userFee The total fee charged to the end-user (in Wei).
     * @param catalystMultiplier The current bonus multiplier from CatalystPool (e.g., 800 = 8.00x).
     */
    function payRoyalty(
        uint256 tokenId,
        address node,
        uint256 userFee,
        uint256 catalystMultiplier // e.g., 8_00 = 8.00x (2 decimals of precision)
    ) external payable nonReentrant {
        Model memory m = models[tokenId];
        require(m.creator != address(0), "Invalid token ID");
        require(msg.value >= userFee, "Insufficient PI sent for fee");

        // 1. Calculate creator royalty
        uint256 royalty = (userFee * m.royaltyBps) / 10000;
        
        // 2. Calculate catalyst bonus based on creator royalty and multiplier
        // Multiplier is scaled by 100 (e.g., 800 for 8.0x)
        uint256 bonus = (royalty * catalystMultiplier) / 100; 

        // 3. Calculate remaining amount for the Node (the difference)
        uint256 nodePayment = userFee - royalty - bonus;
        require(userFee >= royalty + bonus, "Fee breakdown calculation error");
        
        // 4. Distribute funds
        // Send creator royalty
        (bool creatorSuccess, ) = payable(m.creator).call{value: royalty}("");
        require(creatorSuccess, "Royalty transfer failed");

        // Send Catalyst Bonus
        (bool poolSuccess, ) = payable(catalystPool).call{value: bonus}("");
        require(poolSuccess, "Catalyst transfer failed");
        
        // Send remainder back to the Node/caller (this assumes the node/caller keeps the remainder)
        // If the intention is for the node to receive this, we transfer to the 'node' address
        // If the intention is for the caller (the inference wrapper) to receive the remainder, we transfer to 'msg.sender'
        // Given the function signature, let's assume the caller (wrapper) handles the node payment separately, and 
        // this function *only* handles royalty/pool fees. The amount sent should be exactly royalty + bonus.
        
        // RE-EVALUATE: The function is designed to take the 'userFee' and distribute royalty and bonus.
        // It's more secure if the caller only sends the total amount *required* for the transfer.
        // Adjusting logic: require msg.value == royalty + bonus
        
        // Correcting based on common EVM patterns: The caller (node wrapper) sends ONLY the royalty + bonus amount required.
        // We will assume the node wrapper calculates: Payment = Royalty + Bonus.
        uint256 requiredPayment = royalty + bonus;
        require(msg.value == requiredPayment, "Must send exact royalty + bonus amount");
        
        // The node's portion is handled off-chain or by the wrapper's separate calculation.
        // Funds are already transferred to creator and pool. No remaining transfer needed for `msg.value`.

        emit InferenceRoyaltyPaid(tokenId, msg.sender, node, userFee, royalty, bonus);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     * Adds support for ERC721 metadata and EIP-2981.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, IERC165)
        returns (bool)
    {
        return 
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
