'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LaunchCountdown from './LaunchCountdown';
import AgentStatusWidget from '@/components/AgentStatusWidget';

interface DashboardProps {
  userAddress?: string;
  balance?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAddress: propUserAddress, balance: propBalance }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [stakingAmount, setStakingAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setIsConnected(true);
          setUserAddress(accounts[0]);
          setBalance(propBalance || '0');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        setIsConnected(true);
        setUserAddress(accounts[0]);
        setError('');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      setError('MetaMask not detected. Please install MetaMask.');
    }
  };

  const handleStake = async () => {
    if (!stakingAmount || !isConnected || !userAddress) {
      setError('Please connect your wallet and enter an amount.');
      return;
    }

    setIsStaking(true);
    setError('');
    setLastTxHash('');

    try {
      const response = await fetch('/api/sponsor-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: stakingAmount,
          userAddress: userAddress
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLastTxHash(data.txHash);
        setStakingAmount('');
        alert(`Staking successful! Transaction: ${data.txHash}`);
      } else {
        setError(data.error || 'Staking failed. Please try again.');
      }
    } catch (error) {
      console.error('Staking error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <LaunchCountdown />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Quantum Pi Forge Dashboard
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {lastTxHash && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
              <p className="font-semibold">Transaction Successful!</p>
              <p className="text-sm opacity-75 break-all">Hash: {lastTxHash}</p>
              <a
                href={`https://polygonscan.com/tx/${lastTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                View on PolygonScan
              </a>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Wallet Connection</h2>
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  Connect MetaMask
                </button>
              ) : (
                <div className="text-green-400">
                  <p className="text-lg">✅ Connected</p>
                  <p className="text-sm opacity-75 break-all">{userAddress}</p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">OINIO Balance</h2>
              <p className="text-3xl font-bold text-yellow-400">
                {balance} OINIO
              </p>
              <p className="text-sm text-white/70 mt-2">
                Real-time balance from Polygon
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 md:col-span-2">
              <h2 className="text-2xl font-semibold text-white mb-4">Stake OINIO Tokens</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Amount to Stake (OINIO)
                  </label>
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    placeholder="Enter amount (0.01 - 10000)"
                    min="0.01"
                    max="10000"
                    step="0.01"
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isConnected}
                  />
                </div>
                <button
                  onClick={handleStake}
                  disabled={!isConnected || !stakingAmount || isStaking}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:cursor-not-allowed"
                >
                  {isStaking ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Gasless Transaction...
                    </span>
                  ) : (
                    'Stake with Gasless Transaction'
                  )}
                </button>
                <p className="text-white/60 text-sm text-center">
                  No gas fees required - transactions sponsored by Quantum Pi Forge
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <AgentStatusWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
