const { ethers } = require("ethers");

async function main() {
  console.log("Checking OINIO token on Polygon...");

  // OINIO token address on Polygon
  const OINIO_ADDRESS = "0x07f43e5b1a8a0928b364e40d5885f81a543b05c7";

  // Connect to Polygon
  const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

  // ERC20 ABI
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function owner() view returns (address)"
  ];

  try {
    const contract = new ethers.Contract(OINIO_ADDRESS, ERC20_ABI, provider);

    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();

    console.log("OINIO Token Details:");
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${ethers.formatUnits(totalSupply, decimals)} OINIO`);

    // Check if owner can renounce (Ownable contract)
    try {
      const owner = await contract.owner();
      console.log(`Owner: ${owner}`);
      console.log("✅ Contract is Ownable");
      console.log("To renounce ownership, call renounceOwnership() from owner address");
    } catch (e) {
      console.log("❌ Contract is not Ownable or owner() failed");
    }

  } catch (error) {
    console.error("Error checking contract:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});