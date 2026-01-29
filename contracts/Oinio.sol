// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "solady/src/tokens/ERC20.sol";

contract Oinio is ERC20 {
    constructor()
        ERC20("OINIO", "OINIO", 18)
    {
        // Mint 1 billion OINIO to deployer
        _mint(msg.sender, 1000000000 * 10**18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}