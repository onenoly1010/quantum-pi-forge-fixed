// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OINIOToken.sol";

contract DeployOINIO is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy OINIO token with deployer as initial owner
        OINIOToken oinio = new OINIOToken(msg.sender);

        console.log("OINIO deployed to:", address(oinio));
        console.log("Owner:", msg.sender);

        vm.stopBroadcast();
    }
}