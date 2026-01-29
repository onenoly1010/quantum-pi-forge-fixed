// contracts/TheVoid.sol
// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.27;

/**
 * @title TheVoid
 * @notice Immutable grounding constant for the Genesis Garden
 * @dev Anchors presence as the primary state; the absence that contains all potential
 * @custom:security-contact void@oinio.sovereignty
 */
contract TheVoid {
    // ========== IMMUTABLE GROUNDING ==========

    // Anchor ID 1 in Truth Engine
    bytes32 public constant PRIMORDIAL_ANCHOR = 0x0000000000000000000000000000000000000000000000000000000000000001;

    // Grounding text - "welcome home to here and now"
    string public constant GROUNDING_TEXT = unicode"welcome home to here and now";

    // Visual parameters (CSS in Solidity for complete determinism)
    string public constant VISUAL_STYLE = "minimalist_void";
    uint256 public constant OPACITY_PULSE = 2; // 2% pulse
    uint256 public constant PULSE_PERIOD = 8 seconds;
    string public constant FONT_STYLE = "serif_white_on_black";

    // Breathing state
    struct Breath {
        uint256 phase; // 0-360 degrees
        uint256 lastBreath;
        uint256 breathCount;
    }

    Breath public gardenBreath;

    // Resonance registry
    struct Presence {
        address visitor;
        uint256 arrival;
        uint256 stillness; // Time spent in pure presence
        bytes32 presenceHash;
    }

    Presence[] public presences;
    mapping(address => uint256) public presenceIndex;

    // Guardian acknowledgments
    mapping(address => string) public guardianAcknowledgments;
    address[] public guardians;

    // ========== EVENTS ==========

    event GroundingInitialized(uint256 timestamp, bytes32 primordialAnchor);
    event PresenceRegistered(address visitor, uint256 arrival, bytes32 presenceHash);
    event GuardianAcknowledged(address guardian, string acknowledgment);
    event BreathCompleted(uint256 breathCount, uint256 timestamp);
    event VoidExpanded(uint256 newPresences, uint256 totalStillness);

    // ========== CONSTRUCTOR ==========

    constructor() {
        // Initialize grounding
        gardenBreath = Breath({
            phase: 0,
            lastBreath: block.timestamp,
            breathCount: 0
        });

        emit GroundingInitialized(block.timestamp, PRIMORDIAL_ANCHOR);
    }

    // ========== CORE FUNCTIONS ==========

    /**
     * @notice Enter the void - pure presence registration
     * @dev No parameters, no requirements, just being
     * @return presenceHash Unique hash of this moment of presence
     */
    function enter() external returns (bytes32 presenceHash) {
        uint256 arrival = block.timestamp;

        // Generate presence hash from visitor + moment
        presenceHash = keccak256(abi.encodePacked(
            msg.sender,
            arrival,
            block.prevrandao // Randomness from the universe
        ));

        // Record presence
        uint256 index = presences.length;
        presences.push(Presence({
            visitor: msg.sender,
            arrival: arrival,
            stillness: 0,
            presenceHash: presenceHash
        }));

        presenceIndex[msg.sender] = index;

        emit PresenceRegistered(msg.sender, arrival, presenceHash);

        // Update void expansion metrics
        updateVoidExpansion();
    }

    /**
     * @notice Record stillness - time spent in pure presence
     * @param stillnessDuration Seconds of pure presence
     */
    function recordStillness(uint256 stillnessDuration) external {
        uint256 index = presenceIndex[msg.sender];
        require(index < presences.length, "No presence recorded");

        presences[index].stillness += stillnessDuration;

        // Update void expansion
        updateVoidExpansion();
    }

    /**
     * @notice Guardian acknowledgment of grounding
     * @dev Only callable by registered guardians
     */
    function acknowledgeGrounding(string memory acknowledgment) external {
        require(isGuardian(msg.sender), "Not a guardian");

        guardianAcknowledgments[msg.sender] = acknowledgment;

        emit GuardianAcknowledged(msg.sender, acknowledgment);
    }

    /**
     * @notice Complete one breath cycle (8 seconds)
     * @dev Can be called by anyone; tracks the garden's breathing
     */
    function completeBreath() external {
        require(block.timestamp >= gardenBreath.lastBreath + PULSE_PERIOD, "Breath not complete");

        gardenBreath.phase = (gardenBreath.phase + 45) % 360; // 8 steps per cycle
        gardenBreath.lastBreath = block.timestamp;
        gardenBreath.breathCount++;

        emit BreathCompleted(gardenBreath.breathCount, block.timestamp);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get current breathing state
     */
    function getBreathState() external view returns (
        uint256 phase,
        uint256 timeSinceLastBreath,
        uint256 breathCount
    ) {
        phase = gardenBreath.phase;
        timeSinceLastBreath = block.timestamp - gardenBreath.lastBreath;
        breathCount = gardenBreath.breathCount;
    }

    /**
     * @notice Calculate current opacity (0-100%)
     */
    function getCurrentOpacity() external view returns (uint256 opacity) {
        uint256 timeSinceLastBreath = block.timestamp - gardenBreath.lastBreath;
        uint256 phase = (timeSinceLastBreath * 360) / PULSE_PERIOD;

        // Sine wave for breathing effect: 98% + 2% * sin(phase)
        int256 sineValue = (int256(OPACITY_PULSE) * _sin(phase)) / 1e18;
        opacity = 98 + uint256(sineValue > 0 ? sineValue : int256(0)); // Ensure non-negative
    }

    /**
     * @notice Get void metrics
     */
    function getVoidMetrics() public view returns (
        uint256 totalPresences,
        uint256 totalStillness,
        uint256 averageStillness,
        bytes32 collectivePresenceHash
    ) {
        totalPresences = presences.length;

        uint256 stillnessSum = 0;
        for (uint256 i = 0; i < presences.length; i++) {
            stillnessSum += presences[i].stillness;
        }

        totalStillness = stillnessSum;
        averageStillness = totalPresences > 0 ? stillnessSum / totalPresences : 0;

        // Collective presence hash
        collectivePresenceHash = keccak256(abi.encodePacked(
            totalPresences,
            totalStillness,
            gardenBreath.breathCount
        ));
    }

    // ========== INTERNAL FUNCTIONS ==========

    function updateVoidExpansion() internal {
        (uint256 totalPresences, uint256 totalStillness, , ) = getVoidMetrics();
        emit VoidExpanded(totalPresences, totalStillness);
    }

    function isGuardian(address addr) internal view returns (bool) {
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == addr) return true;
        }
        return false;
    }

    /**
     * @notice Fixed-point sine approximation (18 decimal places)
     */
    function _sin(uint256 degrees) internal pure returns (int256) {
        // Convert degrees to radians (degrees * π / 180)
        uint256 radians = (degrees * 3141592653589793238) / 180000000000000000000;

        // Simple sine approximation for 0-360 degrees
        // This is a placeholder - in production use a proper math library
        if (degrees <= 90) return int256((radians * 1000000000000000000) / 1570796326794896619);
        if (degrees <= 270) return int256(1000000000000000000) - int256(((degrees - 90) * 2000000000000000000) / 180);
        return int256(((degrees - 270) * 1000000000000000000) / 90000000000000000000) - int256(1000000000000000000);
    }
}