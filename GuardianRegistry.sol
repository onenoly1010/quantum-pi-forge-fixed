/**
 * @title GuardianRegistry
 * @notice Registers and manages garden guardians
 */
pragma solidity ^0.8.27;

contract GuardianRegistry {
    struct Guardian {
        address guardian;
        string role;
        string ethos;
        uint256 registered;
        bool active;
    }

    Guardian[] public guardians;
    mapping(address => uint256) public guardianIds;

    event GuardianRegistered(address guardian, string role, string ethos);
    event GuardianAcknowledgment(address guardian, string acknowledgment);

    function registerGuardian(
        address guardian,
        string memory role,
        string memory ethos
    ) external {
        uint256 id = guardians.length;
        guardians.push(Guardian({
            guardian: guardian,
            role: role,
            ethos: ethos,
            registered: block.timestamp,
            active: true
        }));

        guardianIds[guardian] = id;

        emit GuardianRegistered(guardian, role, ethos);
    }

    function submitAcknowledgment(
        string memory acknowledgment
    ) external {
        require(guardianIds[msg.sender] > 0, "Not a registered guardian");

        emit GuardianAcknowledgment(msg.sender, acknowledgment);
    }
}