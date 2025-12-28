'use client';

import React, { useState, useEffect } from 'react';

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
  const [networkName, setNetworkName] = useState<string>('');

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
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
          setNetworkName(getNetworkName(chainId));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      '0x89': 'Polygon',
      '0x1': 'Ethereum',
      '0x4119': '0G Aristotle',
    };
    return networks[chainId] || 'Unknown Network';
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        setIsConnected(true);
        setUserAddress(accounts[0]);
        setError('');
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        setNetworkName(getNetworkName(chainId));
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      setError('MetaMask not detected. Please install MetaMask to continue.');
    }
  };

  const handleStake = async () => {
    if (!stakingAmount || !isConnected || !userAddress) {
      setError('Please connect your wallet and enter an amount.');
      return;
    }

    const amount = parseFloat(stakingAmount);
    if (amount < 0.01 || amount > 10000) {
      setError('Amount must be between 0.01 and 10,000 OINIO.');
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
      } else {
        setError(data.error || 'Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Staking error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsStaking(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <nav className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ω</span>
              </div>
              <span className="text-white font-semibold text-xl tracking-tight">OINIO</span>
            </div>
            
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                  {networkName}
                </span>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
                  {truncateAddress(userAddress)}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </button>
            )}
          </nav>

          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              <span className="text-violet-300 text-sm font-medium">Sovereign Economy Protocol</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Build Your
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> Sovereign </span>
              Future
            </h1>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              Stake OINIO tokens with zero gas fees. Join the Truth Movement and participate in the decentralized economy.
            </p>

            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center text-white/50">
                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Gasless Transactions
              </div>
              <div className="flex items-center text-white/50">
                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Polygon Network
              </div>
              <div className="flex items-center text-white/50">
                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Instant Settlement
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {lastTxHash && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-300 font-medium">Transaction Confirmed</span>
            </div>
            <p className="text-white/50 text-sm font-mono break-all mb-2">{lastTxHash}</p>
            <a
              href={`https://polygonscan.com/tx/${lastTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm"
            >
              View on Explorer
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Balance Card */}
          <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Your Balance</h2>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-4xl font-bold text-white mb-1">
                {isConnected ? balance : '—'}
              </p>
              <p className="text-white/40 text-sm">OINIO Tokens</p>
            </div>

            {!isConnected && (
              <button
                onClick={connectWallet}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
              >
                Connect to View Balance
              </button>
            )}
          </div>

          {/* Staking Card */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Stake OINIO</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Zero Gas Fees
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-sm mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    max="10000"
                    step="0.01"
                    disabled={!isConnected}
                    className="w-full p-4 pr-24 rounded-xl bg-black/30 text-white text-lg placeholder-white/20 border border-white/10 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">
                    OINIO
                  </span>
                </div>
                <p className="text-white/30 text-xs mt-2">Minimum: 0.01 • Maximum: 10,000</p>
              </div>

              <button
                onClick={handleStake}
                disabled={!isConnected || !stakingAmount || isStaking}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStaking ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : !isConnected ? (
                  'Connect Wallet to Stake'
                ) : (
                  'Stake Tokens'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 p-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Instant Staking</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Stake your OINIO tokens instantly without waiting for confirmations. Our gasless system handles everything.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Secure Protocol</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Built on Polygon with battle-tested smart contracts. Your assets remain in your control at all times.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">No Gas Required</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              We sponsor all transaction fees. Stake any amount without worrying about MATIC or gas costs.
            </p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <p className="text-white/30 text-sm mb-2">OINIO Token Contract</p>
          <a 
            href="https://polygonscan.com/address/0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-white/50 hover:text-white/70 font-mono text-sm transition-colors"
          >
            0x07f43E5B1A8a0928B364E40d5885f81A543B05C7
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold">Ω</span>
              </div>
              <span className="text-white/60 text-sm">Quantum Pi Forge • Sovereign Economy Protocol</span>
            </div>
            <div className="flex items-center space-x-6 text-white/40 text-sm">
              <span>Frequency: 1010 Hz</span>
              <span>•</span>
              <span>Truth Movement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
