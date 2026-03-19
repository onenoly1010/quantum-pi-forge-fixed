/**
 * iNFT Contract Tests
 * Smart contract tests for iNFT protocol
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("iNFT Protocol Contracts", () => {
  let hybridNFT, evolutionManager, metadataRegistry;
  let owner, oracle, user1, user2;
  let soulRegistry, ogToken;

  beforeEach(async () => {
    [owner, oracle, user1, user2] = await ethers.getSigners();

    // Deploy mock contracts for testing
    const MockSoulRegistry =
      await ethers.getContractFactory("MockSoulRegistry");
    soulRegistry = await MockSoulRegistry.deploy();
    await soulRegistry.waitForDeployment();

    const MockOGToken = await ethers.getContractFactory("MockOGToken");
    ogToken = await MockOGToken.deploy();
    await ogToken.waitForDeployment();

    // Deploy iNFT contracts
    const HybridNFT = await ethers.getContractFactory("HybridNFT");
    hybridNFT = await HybridNFT.deploy(
      oracle.address,
      await soulRegistry.getAddress(),
      ethers.ZeroAddress, // evolutionManager not deployed yet
      ethers.ZeroAddress, // metadataRegistry not deployed yet
    );
    await hybridNFT.waitForDeployment();

    const EvolutionManager =
      await ethers.getContractFactory("EvolutionManager");
    evolutionManager = await EvolutionManager.deploy(
      await hybridNFT.getAddress(),
      oracle.address,
    );
    await evolutionManager.waitForDeployment();

    const MetadataRegistry =
      await ethers.getContractFactory("MetadataRegistry");
    metadataRegistry = await MetadataRegistry.deploy(
      await hybridNFT.getAddress(),
      "https://api.quantumpiforge.com/metadata/",
    );
    await metadataRegistry.waitForDeployment();

    // Update contract references
    await hybridNFT.updateContracts(
      oracle.address,
      await soulRegistry.getAddress(),
      await evolutionManager.getAddress(),
      await metadataRegistry.getAddress(),
    );
  });

  describe("HybridNFT", () => {
    it("should mint a new iNFT", async () => {
      const soulId = ethers.keccak256(ethers.toUtf8Bytes("soul_123"));
      const personalityHash = ethers.keccak256(
        ethers.toUtf8Bytes("personality_data"),
      );

      // Mock soul ownership
      await soulRegistry.setSoulOwner(soulId, user1.address);

      await expect(
        hybridNFT
          .connect(user1)
          .mint(soulId, personalityHash, { value: ethers.parseEther("0.01") }),
      ).to.emit(hybridNFT, "iNFTMinted");

      const totalSupply = await hybridNFT.totalSupply();
      expect(totalSupply).to.equal(1);
    });

    it("should evolve iNFT", async () => {
      // Mint first
      const soulId = ethers.keccak256(ethers.toUtf8Bytes("soul_123"));
      const personalityHash = ethers.keccak256(
        ethers.toUtf8Bytes("personality_data"),
      );
      await soulRegistry.setSoulOwner(soulId, user1.address);
      await hybridNFT
        .connect(user1)
        .mint(soulId, personalityHash, { value: ethers.parseEther("0.01") });

      const tokenId = 0;
      const newPersonalityHash = ethers.keccak256(
        ethers.toUtf8Bytes("evolved_personality"),
      );

      await expect(
        hybridNFT.connect(oracle).evolve(tokenId, newPersonalityHash, 5),
      ).to.emit(hybridNFT, "iNFTEvolved");

      const inft = await hybridNFT.getINFT(tokenId);
      expect(inft.coherence).to.equal(55); // 50 + 5
    });

    it("should reject minting without payment", async () => {
      const soulId = ethers.keccak256(ethers.toUtf8Bytes("soul_123"));
      const personalityHash = ethers.keccak256(
        ethers.toUtf8Bytes("personality_data"),
      );
      await soulRegistry.setSoulOwner(soulId, user1.address);

      await expect(
        hybridNFT.connect(user1).mint(soulId, personalityHash),
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("EvolutionManager", () => {
    it("should create evolution trigger", async () => {
      const triggerId = await evolutionManager.connect(oracle).createTrigger(
        0, // tokenId
        ethers.keccak256(ethers.toUtf8Bytes("time_based")),
        ethers.keccak256(ethers.toUtf8Bytes("delay_86400")),
        86400, // 1 day
      );

      expect(triggerId).to.equal(0);

      const trigger = await evolutionManager.getTrigger(0, 0);
      expect(trigger.triggerType).to.equal(
        ethers.keccak256(ethers.toUtf8Bytes("time_based")),
      );
    });

    it("should execute trigger when conditions met", async () => {
      // Create trigger
      await evolutionManager.connect(oracle).createTrigger(
        0,
        ethers.keccak256(ethers.toUtf8Bytes("time_based")),
        ethers.keccak256(ethers.toUtf8Bytes("delay_1")),
        1, // 1 second
      );

      // Fast forward time (in test environment)
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");

      const canExecute = await evolutionManager.canExecuteTrigger(0, 0);
      expect(canExecute).to.be.true;

      await expect(
        evolutionManager.connect(oracle).executeTrigger(0, 0),
      ).to.emit(evolutionManager, "TriggerExecuted");
    });
  });

  describe("MetadataRegistry", () => {
    it("should set initial metadata", async () => {
      const tokenId = 0;
      const attributes = [
        { trait_type: "Archetype", value: "Sage", isNumeric: false },
        { trait_type: "Coherence", value: 75, isNumeric: true },
      ];

      await expect(
        metadataRegistry.setInitialMetadata(
          tokenId,
          "Wise Sage",
          "A wise being",
          attributes,
        ),
      ).to.emit(metadataRegistry, "MetadataUpdated");
    });

    it("should update attributes", async () => {
      const tokenId = 0;
      const initialAttributes = [
        { trait_type: "Archetype", value: "Sage", isNumeric: false },
      ];

      await metadataRegistry.setInitialMetadata(
        tokenId,
        "Wise Sage",
        "A wise being",
        initialAttributes,
      );

      const newAttributes = [
        { trait_type: "Archetype", value: "Sage", isNumeric: false },
        { trait_type: "Coherence", value: 85, isNumeric: true },
      ];

      await expect(
        metadataRegistry.updateAttributes(tokenId, newAttributes),
      ).to.emit(metadataRegistry, "MetadataUpdated");
    });

    it("should generate token URI", async () => {
      const tokenId = 0;
      const attributes = [
        { trait_type: "Archetype", value: "Sage", isNumeric: false },
      ];

      await metadataRegistry.setInitialMetadata(
        tokenId,
        "Wise Sage",
        "A wise being",
        attributes,
      );

      const uri = await metadataRegistry.getTokenURI(tokenId);
      expect(uri).to.include("https://api.quantumpiforge.com/metadata/0");
    });
  });
});
