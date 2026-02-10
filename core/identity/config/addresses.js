/**
 * Contract Addresses Configuration
 * Deployed contract addresses for different networks
 */

const addresses = {
  // Polygon Mainnet
  137: {
    soulRegistry:
      process.env.SOUL_REGISTRY_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    ogToken:
      process.env.OG_TOKEN_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    verification:
      process.env.VERIFICATION_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
  },

  // Polygon Mumbai Testnet
  80001: {
    soulRegistry:
      process.env.SOUL_REGISTRY_ADDRESS_MUMBAI ||
      "0x0000000000000000000000000000000000000000",
    ogToken:
      process.env.OG_TOKEN_ADDRESS_MUMBAI ||
      "0x0000000000000000000000000000000000000000",
    verification:
      process.env.VERIFICATION_ADDRESS_MUMBAI ||
      "0x0000000000000000000000000000000000000000",
  },

  // Hardhat Local
  31337: {
    soulRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    ogToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    verification: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
};

module.exports = addresses;
