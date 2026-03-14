// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "solady/src/tokens/ERC20.sol";

contract Oinio is ERC20 {
    constructor() ERC20() {
        super._initialize("OINIO", "OINIO");
        _mint(msg.sender, 1000000000 * 10**18);
    }

    function name() public view override returns (string memory) {
        return "OINIO Token";
    }

    function symbol() public view override returns (string memory) {
        return "OINIO";
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}