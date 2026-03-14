// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuantumPiSovereignStaking is ERC2771Context, Ownable {
function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return 0;  // Override to resolve conflict
    }
    using SafeERC20 for IERC20;

    IERC20 public immutable oinioToken;

    struct StakeInfo {
        uint256 amount;
        uint256 lastRewardTimestamp;
        uint256 rewardDebt;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public rewardRatePerSecond; // Set by owner (Stage 2 Governance)

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _oinio, address _trustedForwarder)
        ERC2771Context(_trustedForwarder)
        Ownable(msg.sender)
    {
        oinioToken = IERC20(_oinio);
    }

    // Overriding _msgSender() to support gasless relayers via EIP-2771
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    // Atomic Gasless Entry
    function permitAndStake(
        address user,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        // 1. Execute Permit (Gasless for User, Relayer calls this)
        IERC20Permit(address(oinioToken)).permit(user, address(this), amount, deadline, v, r, s);

        // 2. Stake
        _stake(user, amount);
    }

    function _stake(address user, uint256 amount) internal {
        // Update reward logic here...
        oinioToken.safeTransferFrom(user, address(this), amount);
        stakes[user].amount += amount;
        emit Staked(user, amount);
    }

    // Withdraw + Renounce Ownership Path
    function withdraw(uint256 amount) external {
        address user = _msgSender();
        require(stakes[user].amount >= amount, "Insufficient stake");
        stakes[user].amount -= amount;
        oinioToken.safeTransfer(user, amount);
        emit Withdrawn(user, amount);
    }
}