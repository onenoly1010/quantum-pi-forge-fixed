// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShadowAnchor {
    event Etched(address indexed scribe, string message, uint256 timestamp);

    struct Whisper {
        address scribe;
        string message;
        uint256 timestamp;
    }

    Whisper[] public whispers;

    function etch(string memory _message) public {
        whispers.push(Whisper(msg.sender, _message, block.timestamp));
        emit Etched(msg.sender, _message, block.timestamp);
    }

    function getWhispers() public view returns (Whisper[] memory) {
        return whispers;
    }

    function getWhisperCount() public view returns (uint256) {
        return whispers.length;
    }
}
