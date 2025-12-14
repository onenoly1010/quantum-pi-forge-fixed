import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
const OINIO_TOKEN_ADDRESS = process.env.OINIO_TOKEN_ADDRESS;

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!SPONSOR_PRIVATE_KEY) {
      console.error('SPONSOR_PRIVATE_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!OINIO_TOKEN_ADDRESS) {
      console.error('OINIO_TOKEN_ADDRESS not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { amount, userAddress } = await request.json();

    if (!amount || !userAddress) {
      return NextResponse.json(
        { error: 'Amount and userAddress are required' },
        { status: 400 }
      );
    }

    // Validate amount (should be positive number)
    const stakeAmount = parseFloat(amount);
    if (isNaN(stakeAmount) || stakeAmount <= 0 || stakeAmount > 10000) {
      return NextResponse.json(
        { error: 'Invalid stake amount. Must be between 0.01 and 10000' },
        { status: 400 }
      );
    }

    // Validate Ethereum address
    if (!ethers.isAddress(userAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(SPONSOR_PRIVATE_KEY, provider);

    // OINIO Token contract
    const oinioContract = new ethers.Contract(
      OINIO_TOKEN_ADDRESS,
      [
        'function transfer(address to, uint256 amount) public returns (bool)',
        'function balanceOf(address account) public view returns (uint256)'
      ],
      wallet
    );

    // Check sponsor wallet balance
    const sponsorBalance = await oinioContract.balanceOf(wallet.address);
    const stakeAmountWei = ethers.parseEther(stakeAmount.toString());

    if (sponsorBalance < stakeAmountWei) {
      return NextResponse.json(
        { error: 'Insufficient sponsor balance. Please contact support.' },
        { status: 400 }
      );
    }

    // Execute gasless transfer
    const tx = await oinioContract.transfer(userAddress, stakeAmountWei);
    await tx.wait();

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      amount: stakeAmount,
      userAddress,
      message: 'Staking transaction sponsored successfully',
    });

  } catch (error) {
    console.error('Sponsor transaction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sponsor transaction',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}