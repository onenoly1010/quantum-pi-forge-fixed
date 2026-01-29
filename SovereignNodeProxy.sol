// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SovereignNodeProxy
 * @dev Upgradeable proxy for sovereign node operations
 * Allows seamless upgrades while maintaining sovereignty
 */
contract SovereignNodeProxy is TransparentUpgradeableProxy, Ownable {
    address public culturalCharter;
    address public leverageProtocol;
    address public truthEngine;

    event ImplementationUpgraded(address indexed newImplementation);
    event SovereignComponentsSet(address charter, address leverage, address truth);

    constructor(
        address _logic,
        address _admin,
        bytes memory _data,
        address _culturalCharter,
        address _leverageProtocol,
        address _truthEngine
    ) TransparentUpgradeableProxy(_logic, _admin, _data) Ownable(_admin) {
        culturalCharter = _culturalCharter;
        leverageProtocol = _leverageProtocol;
        truthEngine = _truthEngine;
    }

    function setSovereignComponents(
        address _culturalCharter,
        address _leverageProtocol,
        address _truthEngine
    ) external onlyOwner {
        culturalCharter = _culturalCharter;
        leverageProtocol = _leverageProtocol;
        truthEngine = _truthEngine;
        emit SovereignComponentsSet(_culturalCharter, _leverageProtocol, _truthEngine);
    }

    function getSovereignComponents() external view returns (
        address charter,
        address leverage,
        address truth
    ) {
        return (culturalCharter, leverageProtocol, truthEngine);
    }
}