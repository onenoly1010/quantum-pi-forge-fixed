/**
 * Identity System Tests
 * Contract and service integration tests
 */

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('OINIO Identity System', () => {
  let soulRegistry, ogToken, verification;
  let owner, oracle, user1, user2;

  beforeEach(async () => {
    [owner, oracle, user1, user2] = await ethers.getSigners();

    // Deploy contracts
    const SoulRegistry = await ethers.getContractFactory('SoulRegistry');
    soulRegistry = await SoulRegistry.deploy(oracle.address);
    await soulRegistry.waitForDeployment();

    const OGToken = await ethers.getContractFactory('OGToken');
    ogToken = await OGToken.deploy(await soulRegistry.getAddress(), oracle.address);
    await ogToken.waitForDeployment();

    const Verification = await ethers.getContractFactory('Verification');
    verification = await Verification.deploy(await soulRegistry.getAddress(), oracle.address);
    await verification.waitForDeployment();
  });

  describe('SoulRegistry', () => {
    it('should mint a new soul', async () => {
      const piUid = ethers.keccak256(ethers.toUtf8Bytes('pi_user_123'));

      await expect(soulRegistry.connect(oracle).mintSoul(piUid, user1.address))
        .to.emit(soulRegistry, 'SoulMinted');

      const soul = await soulRegistry.getSoulByPiUid(piUid);
      expect(soul.owner).to.equal(user1.address);
      expect(soul.isActive).to.be.true;
    });

    it('should update soul coherence', async () => {
      const piUid = ethers.keccak256(ethers.toUtf8Bytes('pi_user_123'));
      await soulRegistry.connect(oracle).mintSoul(piUid, user1.address);

      const soul = await soulRegistry.getSoulByPiUid(piUid);
      await soulRegistry.connect(oracle).updateCoherence(soul.soulId, 75);

      const updatedSoul = await soulRegistry.getSoul(soul.soulId);
      expect(updatedSoul.coherence).to.equal(75);
    });

    it('should transfer soul ownership', async () => {
      const piUid = ethers.keccak256(ethers.toUtf8Bytes('pi_user_123'));
      await soulRegistry.connect(oracle).mintSoul(piUid, user1.address);

      const soul = await soulRegistry.getSoulByPiUid(piUid);
      await soulRegistry.connect(user1).transferSoul(soul.soulId, user2.address);

      const transferredSoul = await soulRegistry.getSoul(soul.soulId);
      expect(transferredSoul.owner).to.equal(user2.address);
    });
  });

  describe('OGToken', () => {
    it('should grant OG status', async () => {
      const piUid = ethers.keccak256(ethers.toUtf8Bytes('pi_user_123'));
      await soulRegistry.connect(oracle).mintSoul(piUid, user1.address);

      await ogToken.connect(soulRegistry).grantOGStatus(user1.address);

      expect(await ogToken.hasOGStatus(user1.address)).to.be.true;
      expect(await ogToken.balanceOf(user1.address)).to.equal(ethers.parseEther('100'));
    });

    it('should reward reading for OG users', async () => {
      const piUid = ethers.keccak256(ethers.toUtf8Bytes('pi_user_123'));
      await soulRegistry.connect(oracle).mintSoul(piUid, user1.address);
      await ogToken.connect(soulRegistry).grantOGStatus(user1.address);

      const initialBalance = await ogToken.balanceOf(user1.address);
      await ogToken.connect(oracle).rewardReading(user1.address);

      expect(await ogToken.balanceOf(user1.address)).to.equal(initialBalance + ethers.parseEther('10'));
    });
  });

  describe('Verification', () => {
    it('should submit and verify claims', async () => {
      const piUid = ethers.keccak256(ethers.toUtf8Bytes('pi_user_123'));
      await soulRegistry.connect(oracle).mintSoul(piUid, user1.address);

      const soul = await soulRegistry.getSoulByPiUid(piUid);
      const claimHash = ethers.keccak256(ethers.toUtf8Bytes('test claim'));

      await verification.connect(user1).submitClaim(soul.soulId, claimHash);

      // Verify claim
      const claimId = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'bytes32', 'address', 'uint256'],
          [soul.soulId, claimHash, user1.address, await ethers.provider.getBlock('latest').then(b => b.timestamp)]
        )
      );

      await verification.connect(oracle).verifyClaim(claimId, true);

      const claim = await verification.getClaim(claimId);
      expect(claim.verified).to.be.true;
    });
  });
});