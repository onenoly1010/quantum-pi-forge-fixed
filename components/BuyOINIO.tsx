'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Coins, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { SOVEREIGN_CONFIG } from '@/lib/sovereign-config';

interface BuyOINIOProps {
  className?: string;
}

export default function BuyOINIO({ className }: BuyOINIOProps) {
  const [amount, setAmount] = useState<string>('0.01');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'approving' | 'swapping' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [oinioBalance, setOINIOBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  // Initialize Web3 connection
  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
        setIsConnected(true);

        // Get balances
        await updateBalances(web3Signer);

        // Listen for account changes
        window.ethereum.on('accountsChanged', () => {
          window.location.reload();
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('Web3 initialization failed:', error);
        setError('Failed to connect wallet');
      }
    } else {
      setError('MetaMask not detected. Please install MetaMask to trade OINIO.');
    }
  };

  const updateBalances = async (web3Signer: ethers.JsonRpcSigner) => {
    try {
      const address = await web3Signer.getAddress();

      // Get 0G balance
      const ethBalance = await provider!.getBalance(address);
      setBalance(ethers.formatEther(ethBalance));

      // Get OINIO balance
      const oinioContract = new ethers.Contract(
        SOVEREIGN_CONFIG.contracts.oinioToken,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const oinioBal = await oinioContract.balanceOf(address);
      setOINIOBalance(ethers.formatEther(oinioBal));

    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  };

  const switchTo0GAristotle = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SOVEREIGN_CONFIG.network.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SOVEREIGN_CONFIG.network.chainId.toString(16)}`,
              chainName: SOVEREIGN_CONFIG.network.name,
              nativeCurrency: SOVEREIGN_CONFIG.network.nativeCurrency,
              rpcUrls: [SOVEREIGN_CONFIG.network.rpcUrl],
              blockExplorerUrls: [SOVEREIGN_CONFIG.network.blockExplorerUrl],
            }],
          });
        } catch (addError) {
          console.error('Failed to add 0G Aristotle network:', addError);
          setError('Failed to add 0G Aristotle network to MetaMask');
        }
      } else {
        console.error('Failed to switch to 0G Aristotle:', switchError);
        setError('Failed to switch to 0G Aristotle network');
      }
    }
  };

  const buyOINIO = async () => {
    if (!signer || !provider) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setStatus('swapping');
    setError('');
    setTxHash('');

    try {
      const amountInWei = ethers.parseEther(amount);

      // Check if amount is reasonable
      if (amountInWei < ethers.parseEther('0.001')) {
        throw new Error('Minimum purchase amount is 0.001 0G');
      }

      // Get expected output amount (rough estimate)
      const routerContract = new ethers.Contract(
        SOVEREIGN_CONFIG.contracts.dexRouter,
        [
          'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
          'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ],
        signer
      );

      // Path: 0G -> OINIO
      const path = [SOVEREIGN_CONFIG.network.nativeCurrency.address, SOVEREIGN_CONFIG.contracts.oinioToken];

      // Get expected output (with 5% slippage tolerance)
      const amountsOut = await routerContract.getAmountsOut(amountInWei, path);
      const amountOutMin = amountsOut[1] * BigInt(95) / BigInt(100); // 5% slippage

      info(`Expected OINIO output: ${ethers.formatEther(amountsOut[1])}`);
      info(`Minimum OINIO output: ${ethers.formatEther(amountOutMin)}`);

      // Execute swap
      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes

      const tx = await routerContract.swapExactETHForTokens(
        amountOutMin,
        path,
        await signer.getAddress(),
        deadline,
        { value: amountInWei }
      );

      setTxHash(tx.hash);
      setStatus('success');

      info(`Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      // Update balances
      await updateBalances(signer);

      success('OINIO purchase successful!');

    } catch (error: any) {
      console.error('Swap failed:', error);
      setStatus('error');

      if (error.code === 'ACTION_REJECTED') {
        setError('Transaction rejected by user');
      } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
        setError('Price impact too high. Try a smaller amount.');
      } else {
        setError(error.message || 'Failed to buy OINIO');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to wallet...';
      case 'approving':
        return 'Approving transaction...';
      case 'swapping':
        return 'Swapping 0G for OINIO...';
      case 'success':
        return 'Purchase successful!';
      case 'error':
        return 'Purchase failed';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
      case 'approving':
      case 'swapping':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          Buy OINIO
        </CardTitle>
        <CardDescription>
          Purchase OINIO tokens on 0G Aristotle Network
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
          <Badge variant="outline">
            0G Aristotle
          </Badge>
        </div>

        {/* Balance Display */}
        {isConnected && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">0G Balance</div>
              <div className="text-muted-foreground">{parseFloat(balance).toFixed(4)} 0G</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">OINIO Balance</div>
              <div className="text-muted-foreground">{parseFloat(oinioBalance).toFixed(2)} OINIO</div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (0G)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            min="0.001"
            step="0.001"
            disabled={isLoading}
          />
          <div className="text-xs text-muted-foreground">
            ≈ {(parseFloat(amount) * 100).toFixed(2)} OINIO (estimated)
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Display */}
        {status !== 'idle' && (
          <Alert>
            {getStatusIcon()}
            <AlertDescription>{getStatusMessage()}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Link */}
        {txHash && (
          <div className="text-center">
            <a
              href={`${SOVEREIGN_CONFIG.network.blockExplorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View Transaction ↗
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isConnected ? (
            <Button
              onClick={initializeWeb3}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={buyOINIO}
                className="w-full"
                disabled={isLoading || parseFloat(amount) <= 0}
              >
                {isLoading ? (
                  <>
                    {getStatusIcon()}
                    <span className="ml-2">{getStatusMessage()}</span>
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Buy OINIO
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={switchTo0GAristotle}
                className="w-full text-xs"
                size="sm"
              >
                Switch to 0G Aristotle
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center">
          Trading fee: 0.3% • Network: 0G Aristotle Mainnet
        </div>
      </CardContent>
    </Card>
  );
}