'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface DashboardProps {
  userAddress?: string;
  balance?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAddress, balance }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [stakingAmount, setStakingAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  useEffect(() => {
    // Check if wallet is connected
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsConnected(accounts.length > 0);
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const handleStake = async () => {
    if (!stakingAmount || !isConnected) return;
    
    setIsStaking(true);
    try {
      // This will be replaced with actual staking logic
      console.log('Staking amount:', stakingAmount);
      // Call backend API for gasless transaction
      const response = await fetch('/api/sponsor-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: stakingAmount }),
      });
      
      if (response.ok) {
        alert('Staking successful!');
        setStakingAmount('');
      } else {
        alert('Staking failed. Please try again.');
      }
    } catch (error) {
      console.error('Staking error:', error);
      alert('Staking failed. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Quantum Pi Forge Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Wallet Connection */}
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
                <p className="text-sm opacity-75">{userAddress || 'Address not available'}</p>
              </div>
            )}
          </div>

          {/* Balance Display */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">OINIO Balance</h2>
            <p className="text-3xl font-bold text-yellow-400">
              {balance || '0'} OINIO
            </p>
          </div>

          {/* Staking Interface */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 md:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-4">Stake OINIO Tokens</h2>
            <div className="space-y-4">
              <input
                type="number"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                placeholder="Enter amount to stake"
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                onClick={handleStake}
                disabled={!isConnected || !stakingAmount || isStaking}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                {isStaking ? 'Staking...' : 'Stake with Gasless Transaction'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;