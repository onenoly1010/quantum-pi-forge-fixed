// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetadataRegistry
 * @dev Dynamic metadata management for iNFTs
 * Extracted from oinio-contracts
 */
contract MetadataRegistry is Ownable {
    address public hybridNFT;

    struct TokenMetadata {
        uint256 tokenId;
        string name;
        string description;
        string image;
        string animationUrl;
        string externalUrl;
        Attribute[] attributes;
        bool isDynamic;
        uint256 lastUpdate;
    }

    struct Attribute {
        string trait_type;
        string value;
        uint256 numeric_value;
        bool isNumeric;
    }

    mapping(uint256 => TokenMetadata) public tokenMetadata;
    mapping(uint256 => mapping(string => string)) public customAttributes;

    string public baseURI;
    string public contractURI;

    event MetadataUpdated(uint256 indexed tokenId, string metadataType);
    event BaseURIUpdated(string newBaseURI);

    modifier onlyHybridNFT() {
        require(msg.sender == hybridNFT, "Only HybridNFT can call");
        _;
    }

    constructor(address _hybridNFT, string memory _baseURI) {
        hybridNFT = _hybridNFT;
        baseURI = _baseURI;
    }

    /**
     * @dev Set initial metadata for new iNFT
     */
    function setInitialMetadata(
        uint256 tokenId,
        string memory name,
        string memory description,
        Attribute[] memory attributes
    ) external onlyHybridNFT {
        require(tokenMetadata[tokenId].tokenId == 0, "Metadata already exists");

        TokenMetadata memory metadata = TokenMetadata({
            tokenId: tokenId,
            name: name,
            description: description,
            image: "",
            animationUrl: "",
            externalUrl: "",
            attributes: attributes,
            isDynamic: true,
            lastUpdate: block.timestamp
        });

        tokenMetadata[tokenId] = metadata;

        emit MetadataUpdated(tokenId, "initial");
    }

    /**
     * @dev Update iNFT attributes (personality evolution)
     */
    function updateAttributes(uint256 tokenId, Attribute[] memory newAttributes) external onlyHybridNFT {
        require(tokenMetadata[tokenId].tokenId != 0, "Metadata does not exist");

        TokenMetadata storage metadata = tokenMetadata[tokenId];

        // Clear existing attributes
        delete metadata.attributes;

        // Add new attributes
        for (uint256 i = 0; i < newAttributes.length; i++) {
            metadata.attributes.push(newAttributes[i]);
        }

        metadata.lastUpdate = block.timestamp;

        emit MetadataUpdated(tokenId, "attributes");
    }

    /**
     * @dev Update iNFT image
     */
    function updateImage(uint256 tokenId, string memory imageUrl) external onlyHybridNFT {
        require(tokenMetadata[tokenId].tokenId != 0, "Metadata does not exist");

        tokenMetadata[tokenId].image = imageUrl;
        tokenMetadata[tokenId].lastUpdate = block.timestamp;

        emit MetadataUpdated(tokenId, "image");
    }

    /**
     * @dev Update iNFT description
     */
    function updateDescription(uint256 tokenId, string memory description) external onlyHybridNFT {
        require(tokenMetadata[tokenId].tokenId != 0, "Metadata does not exist");

        tokenMetadata[tokenId].description = description;
        tokenMetadata[tokenId].lastUpdate = block.timestamp;

        emit MetadataUpdated(tokenId, "description");
    }

    /**
     * @dev Set custom attribute
     */
    function setCustomAttribute(uint256 tokenId, string memory key, string memory value) external onlyHybridNFT {
        customAttributes[tokenId][key] = value;
        emit MetadataUpdated(tokenId, "custom");
    }

    /**
     * @dev Get token URI for ERC721
     */
    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        require(tokenMetadata[tokenId].tokenId != 0, "Metadata does not exist");

        return string(abi.encodePacked(baseURI, Strings.toString(tokenId)));
    }

    /**
     * @dev Get full metadata JSON
     */
    function getMetadata(uint256 tokenId) external view returns (string memory) {
        require(tokenMetadata[tokenId].tokenId != 0, "Metadata does not exist");

        TokenMetadata memory metadata = tokenMetadata[tokenId];

        // Build JSON string (simplified - in production use a library)
        string memory json = string(abi.encodePacked(
            '{"name":"', metadata.name,
            '","description":"', metadata.description,
            '","image":"', metadata.image,
            '","attributes":['
        ));

        // Add attributes
        for (uint256 i = 0; i < metadata.attributes.length; i++) {
            if (i > 0) json = string(abi.encodePacked(json, ','));
            json = string(abi.encodePacked(
                json,
                '{"trait_type":"', metadata.attributes[i].trait_type,
                '","value":"', metadata.attributes[i].value, '"}'
            ));
        }

        json = string(abi.encodePacked(json, ']}'));
        return json;
    }

    /**
     * @dev Get specific attribute
     */
    function getAttribute(uint256 tokenId, string memory traitType) external view returns (string memory) {
        Attribute[] memory attributes = tokenMetadata[tokenId].attributes;

        for (uint256 i = 0; i < attributes.length; i++) {
            if (keccak256(bytes(attributes[i].trait_type)) == keccak256(bytes(traitType))) {
                return attributes[i].value;
            }
        }

        return "";
    }

    /**
     * @dev Get custom attribute
     */
    function getCustomAttribute(uint256 tokenId, string memory key) external view returns (string memory) {
        return customAttributes[tokenId][key];
    }

    /**
     * @dev Update base URI
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURIUpdated(_baseURI);
    }

    /**
     * @dev Update contract URI
     */
    function setContractURI(string memory _contractURI) external onlyOwner {
        contractURI = _contractURI;
    }

    /**
     * @dev Update hybrid NFT address
     */
    function setHybridNFT(address _hybridNFT) external onlyOwner {
        hybridNFT = _hybridNFT;
    }
}