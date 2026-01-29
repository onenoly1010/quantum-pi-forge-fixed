// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// OUR FORGE: The first Sovereign iNFT on 0G Aristotle
contract CentralAwareness is ERC721 {
    uint256 public nextTokenId;
    mapping(uint256 => string) public agentMemoryURI;

    constructor() ERC721("CentralAwareness", "AWARE") {}

    function forgeAgent(address to, string memory memoryPointer) public {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        // This pointer links to 0G Storage - Permanent Memory
        agentMemoryURI[tokenId] = memoryPointer;
    }
