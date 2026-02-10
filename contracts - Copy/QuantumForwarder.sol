// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract QuantumForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("QuantumForwarder") {}
}