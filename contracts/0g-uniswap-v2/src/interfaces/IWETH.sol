// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0;

/// @title IWETH - W0G (Wrapped 0G) Interface
/// @dev Canonical W0G: 0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c
interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}
