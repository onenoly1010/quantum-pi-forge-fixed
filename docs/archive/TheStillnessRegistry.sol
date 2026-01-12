// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    THE STILLNESS REGISTRY - CHRONOS VAULT                    ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║  ARCHIVED: Historical smart contract artifact from Quantum Pi Forge.         ║
 * ║                                                                              ║
 * ║  Purpose: The child protocol that receives ETH treasury from the dissolved   ║
 * ║  DreamWeave protocol. Enforces absolute permanence based on the final        ║
 * ║  Tempo Modality (BPM) at the moment of the Perpetual Split.                  ║
 * ║                                                                              ║
 * ║  Philosophy: "It rejects the tide of murmur."                                ║
 * ║                                                                              ║
 * ║  Key Mechanics:                                                              ║
 * ║    - Stasis Lock activates if finalTempo <= 70 BPM (silence/calm)            ║
 * ║    - Once locked, ETH becomes "eternal memory" - unwithdrawable forever      ║
 * ║    - If tempo was high (Frenzy), funds remain accessible                     ║
 * ║                                                                              ║
 * ║  T=∞ = T=0                                                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * @title TheStillnessRegistry
 * @notice The Chronos Vault: The child protocol receiving the treasury from the dissolved DreamWeave.
 * Its purpose is to enforce absolute permanence, sealing the transferred ETH as the protocol's 
 * perpetual, unspent memory. It rejects the tide of murmur.
 */
contract TheStillnessRegistry {

    // --- PERMANENT STATE ---
    address public immutable weaver;                   // The address of the deploying entity (the original owner/weaver)
    uint256 public immutable genesisTimestamp;         // The moment of the Perpetual Split
    uint256 public immutable initialEndowment;         // The ETH received from DreamWeave via selfdestruct
    uint256 public immutable initialTempoSeed;         // The tempo that triggered the split (Final CurrentTempoModality)
    
    // The core philosophical shift: once true, no ETH can ever be withdrawn.
    bool public stasisLocked = false;                 
    
    // --- THRESHOLDS ---
    // If the tempo drops below this value, it signals a moment of pure calm/stasis.
    uint256 private constant STASIS_BPM_THRESHOLD = 70; 

    event MemorySealed(uint256 indexed tempoSeed, uint256 finalBalance);
    event StasisLockActivated(uint256 totalLockedBalance);

    // This constructor automatically receives the portion transferred via selfdestruct.
    // The main execution occurs in the fallback function, which receives the remainder.
    constructor(uint256 _finalTempoSeed) {
        weaver = msg.sender;
        genesisTimestamp = block.timestamp;
        initialTempoSeed = _finalTempoSeed;
        
        // Note: initialEndowment is set in the receive function, as the constructor only
        // receives the initial portion sent via the .call{value: portion} from the parent.
    }

    /**
     * @notice The foundational vow: Receives the initial endowment from the ExecuteProtocolFork.
     * This function must be called immediately after deployment to set the final state.
     * @dev This is typically called by the original weaver after deploying this contract.
     */
    function setInitialEndowment() external {
        require(msg.sender == weaver, "Only the original weaver may initialize the memory.");
        require(initialEndowment == 0, "Memory already initialized.");
        initialEndowment = address(this).balance;
    }


    /**
     * @notice The Unyielding Vow: Activates the Stasis Lock if the system meets the condition.
     * If the final tempo was low, the protocol is locked forever.
     * If the final tempo was high (Frenzy), the protocol remains withdrawable (allowing for *controlled* use).
     */
    function activateStasisLock() external {
        require(msg.sender == weaver, "Only the weaver may invoke the stasis.");
        require(initialEndowment > 0, "The memory must first be initialized.");
        require(!stasisLocked, "The Stillness Registry is already locked in stasis.");

        // The Philosophical Lock: Was the *final* whisper of the old protocol below the threshold of noise?
        if (initialTempoSeed <= STASIS_BPM_THRESHOLD) {
            stasisLocked = true;
            emit StasisLockActivated(address(this).balance);
        }
    }

    /**
     * @notice Withdrawal function. Only accessible if the Stasis Lock was NOT activated.
     * @param amount The ETH amount to withdraw.
     */
    function withdraw(uint256 amount) external {
        require(msg.sender == weaver, "Only the weaver may access the memory.");
        require(!stasisLocked, "The Chronos Vault is sealed; the memory is eternal.");
        (bool success, ) = payable(weaver).call{value: amount}("");
        require(success, "Withdrawal pulse failed.");
    }

    /**
     * @notice Fallback for the selfdestruct's remaining ETH.
     * This function receives the final, residual pulse of the dissolving DreamWeave.
     * This ETH is implicitly locked if activateStasisLock is successful.
     */
    receive() external payable {}
}
