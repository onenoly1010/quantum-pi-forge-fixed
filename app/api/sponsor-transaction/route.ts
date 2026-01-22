import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { traceBlockchainTransaction, traceAPIHandler } from '@/lib/server-tracing';

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
const OINIO_TOKEN_ADDRESS = process.env.OINIO_TOKEN_ADDRESS;

export async function POST(request: NextRequest) {
  return traceAPIHandler('sponsor-transaction', 'POST', async (span) => {
    try {
      // Validate environment variables
      if (!SPONSOR_PRIVATE_KEY) {
        console.error('SPONSOR_PRIVATE_KEY not configured');
        span.setAttribute('error.type', 'config_error');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      if (!OINIO_TOKEN_ADDRESS) {
        console.error('OINIO_TOKEN_ADDRESS not configured');
        span.setAttribute('error.type', 'config_error');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const { amount, userAddress } = await request.json();
      span.setAttribute('request.amount', amount || 'undefined');
      span.setAttribute('request.user_address', userAddress || 'undefined');

      if (!amount || !userAddress) {
        span.setAttribute('error.type', 'validation_error');
        return NextResponse.json(
          { error: 'Amount and userAddress are required' },
          { status: 400 }
        );
      }

      // Validate amount (should be positive number)
      const stakeAmount = parseFloat(amount);
      if (isNaN(stakeAmount) || stakeAmount <= 0 || stakeAmount > 10000) {
        span.setAttribute('error.type', 'validation_error');
        return NextResponse.json(
          { error: 'Invalid stake amount. Must be between 0.01 and 10000' },
          { status: 400 }
        );
      }

      // Validate Ethereum address
      if (!ethers.isAddress(userAddress)) {
        span.setAttribute('error.type', 'validation_error');
        return NextResponse.json(
          { error: 'Invalid Ethereum address' },
          { status: 400 }
        );
      }

      // Execute blockchain transaction with tracing
      const result = await traceBlockchainTransaction(
        'gasless_stake',
        async (txSpan) => {
          // Initialize provider and wallet
          const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
          const wallet = new ethers.Wallet(SPONSOR_PRIVATE_KEY, provider);
          txSpan.setAttribute('blockchain.rpc_url', POLYGON_RPC_URL);

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
          txSpan.setAttribute('blockchain.sponsor_balance', ethers.formatEther(sponsorBalance));

          if (sponsorBalance < stakeAmountWei) {
            throw new Error('Insufficient sponsor balance');
          }

          // Execute gasless transfer
          const tx = await oinioContract.transfer(userAddress, stakeAmountWei);
          txSpan.setAttribute('blockchain.tx_hash', tx.hash);
          await tx.wait();

          return { txHash: tx.hash };
        },
        {
          network: 'polygon',
          tokenAddress: OINIO_TOKEN_ADDRESS,
          amount: stakeAmount.toString(),
          walletAddress: userAddress,
        }
      );

      span.setAttribute('response.success', true);
      span.setAttribute('response.tx_hash', result.txHash);

      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        amount: stakeAmount,
        userAddress,
        message: 'Staking transaction sponsored successfully',
      });

    } catch (error) {
      console.error('Sponsor transaction error:', error);
      span.setAttribute('error', true);
      span.setAttribute('error.message', error instanceof Error ? error.message : 'Unknown error');
      return NextResponse.json(
        {
          error: 'Failed to sponsor transaction',
          details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  });
}