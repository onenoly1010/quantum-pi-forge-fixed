import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const OINIO_TOKEN_ADDRESS = process.env.OINIO_TOKEN_ADDRESS;

export async function GET() {
  try {
    if (!OINIO_TOKEN_ADDRESS) {
      console.error('OINIO_TOKEN_ADDRESS not configured');
      return NextResponse.json(
        { error: 'OINIO_TOKEN_ADDRESS not configured', metrics: {
          oinioPrice: 0.00,
          priceChange: 0.00,
          tvl: 0.00,
          tvlChange: 0.00,
          activeStakers: 0,
          totalStaked: 0,
          tokenName: "OINIO",
          tokenSymbol: "OINIO",
          lastUpdated: new Date().toISOString()
        } },
        { status: 200 }  // Return 200 with fallback to keep app running
      );
    }

    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

    // ERC20 ABI for basic functions
    const ERC20_ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)"
    ];

    const contract = new ethers.Contract(OINIO_TOKEN_ADDRESS, ERC20_ABI, provider);

    // Fetch basic token data
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    // For now, mock other metrics until we have staking contracts deployed
    const metrics = {
      oinioPrice: 0.00, // TODO: Integrate with price oracle
      priceChange: 0.00,
      tvl: 0.00, // TODO: Calculate from staking contracts
      tvlChange: 0.00,
      activeStakers: 0, // TODO: Track from staking events
      totalStaked: parseFloat(ethers.formatUnits(totalSupply, decimals)), // Total supply as placeholder
      tokenName: name,
      tokenSymbol: symbol,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}