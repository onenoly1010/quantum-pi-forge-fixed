'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==================== TYPES ====================
interface DashboardProps {
  userAddress?: string;
  balance?: string;
}

interface TransactionStatus {
  status: 'idle' | 'pending' | 'confirming' | 'success' | 'error';
  message: string;
  txHash?: string;
  retryCount?: number;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

// ==================== CONSTANTS ====================
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// ==================== UTILITY FUNCTIONS ====================
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithExponentialBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        onRetry?.(attempt + 1, lastError);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
};

// ==================== TOAST COMPONENT ====================
const Toast: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);
    
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-cyan-500/10 border-cyan-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
  };

  const textColors = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-cyan-400',
    warning: 'text-amber-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${bgColors[toast.type]} animate-in slide-in-from-top-2 duration-200`}>
      <div className="flex items-start">
        <span className={`font-medium ${textColors[toast.type]}`}>{toast.title}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-auto text-white/40 hover:text-white/60"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-white/60 text-sm mt-1">{toast.message}</p>
    </div>
  );
};

// ==================== ERROR BOUNDARY ====================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/60 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==================== TRANSACTION STATUS COMPONENT ====================
const TransactionStatusBanner: React.FC<{
  status: TransactionStatus;
  onDismiss: () => void;
  onRetry?: () => void;
}> = ({ status, onDismiss, onRetry }) => {
  if (status.status === 'idle') return null;

  const statusConfig = {
    pending: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: (
        <svg className="w-5 h-5 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      textColor: 'text-amber-300',
    },
    confirming: {
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      icon: (
        <svg className="w-5 h-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      textColor: 'text-cyan-300',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      textColor: 'text-emerald-300',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/20',
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      textColor: 'text-red-300',
    },
  };

  const config = statusConfig[status.status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border ${config.bg}`}>
      <div className="flex items-center">
        {config.icon}
        <span className={`ml-3 font-medium ${config.textColor}`}>{status.message}</span>
        <button onClick={onDismiss} className="ml-auto text-white/40 hover:text-white/60">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {status.txHash && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-white/50 text-sm font-mono break-all mb-2">{status.txHash}</p>
          <a
            href={`https://polygonscan.com/tx/${status.txHash}`}
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
      
      {status.status === 'error' && onRetry && status.retryCount !== undefined && status.retryCount < MAX_RETRIES && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors"
        >
          Retry Transaction ({MAX_RETRIES - status.retryCount} attempts remaining)
        </button>
      )}
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard: React.FC<DashboardProps> = ({ userAddress: propUserAddress, balance: propBalance }) => {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [stakingAmount, setStakingAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [networkName, setNetworkName] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: 'idle',
    message: '',
  });

  // Refs
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastStakeAmountRef = useRef<string>('');

  // Toast management
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Network detection
  const getNetworkName = useCallback((chainId: string): string => {
    const networks: { [key: string]: string } = {
      '0x89': 'Polygon',
      '0x1': 'Ethereum',
      '0x4119': '0G Aristotle',
    };
    return networks[chainId] || 'Unknown Network';
  }, []);

  // Address truncation
  const truncateAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Connection check with resilience
  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setIsConnected(true);
        setUserAddress(accounts[0]);
        setBalance(propBalance || '0');
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        setNetworkName(getNetworkName(chainId));
      } else {
        setIsConnected(false);
        setUserAddress('');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, [getNetworkName, propBalance]);

  // Wallet connection with enhanced error handling
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      addToast({
        type: 'error',
        title: 'MetaMask Not Found',
        message: 'Please install MetaMask browser extension to continue.',
        duration: 8000,
      });
      return;
    }

    try {
      setTransactionStatus({ status: 'pending', message: 'Connecting wallet...' });
      
      const accounts = await retryWithExponentialBackoff(
        async () => window.ethereum!.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
        2,
        500,
        (attempt) => {
          setTransactionStatus({
            status: 'pending',
            message: `Connecting wallet (attempt ${attempt})...`,
          });
        }
      );

      setIsConnected(true);
      setUserAddress(accounts[0]);
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      setNetworkName(getNetworkName(chainId));
      
      setTransactionStatus({ status: 'idle', message: '' });
      addToast({
        type: 'success',
        title: 'Wallet Connected',
        message: `Connected to ${truncateAddress(accounts[0])}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setTransactionStatus({ status: 'idle', message: '' });
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.',
        duration: 6000,
      });
    }
  }, [addToast, getNetworkName, truncateAddress]);

  // Execute gasless transaction with full retry support
  const executeGaslessTransaction = useCallback(async (amount: string): Promise<{ success: boolean; txHash?: string; message?: string }> => {
    const response = await fetch('/api/sponsor-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        userAddress,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Transaction failed');
    }

    return {
      success: true,
      txHash: data.txHash,
      message: `Successfully staked ${amount} OINIO`,
    };
  }, [userAddress]);

  // Main staking handler with comprehensive error handling and retry
  const handleStake = useCallback(async () => {
    if (!stakingAmount || !isConnected || !userAddress) {
      addToast({
        type: 'warning',
        title: 'Action Required',
        message: 'Please connect your wallet and enter an amount.',
      });
      return;
    }

    const amount = parseFloat(stakingAmount);
    if (isNaN(amount) || amount < 0.01 || amount > 10000) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Amount must be between 0.01 and 10,000 OINIO.',
      });
      return;
    }

    if (!isOnline) {
      addToast({
        type: 'error',
        title: 'No Connection',
        message: 'You appear to be offline. Please check your internet connection.',
      });
      return;
    }

    setIsStaking(true);
    lastStakeAmountRef.current = stakingAmount;
    retryCountRef.current = 0;

    try {
      setTransactionStatus({
        status: 'pending',
        message: 'Submitting transaction...',
      });

      const result = await retryWithExponentialBackoff(
        () => executeGaslessTransaction(stakingAmount),
        MAX_RETRIES,
        INITIAL_RETRY_DELAY,
        (attempt, error) => {
          retryCountRef.current = attempt;
          setTransactionStatus({
            status: 'pending',
            message: `Retrying transaction (attempt ${attempt}/${MAX_RETRIES})...`,
            retryCount: attempt,
          });
          console.warn(`Retry attempt ${attempt}: ${error.message}`);
        }
      );

      setTransactionStatus({
        status: 'confirming',
        message: 'Waiting for confirmation...',
        txHash: result.txHash,
      });

      // Simulate confirmation delay (blockchain already confirmed via tx.wait())
      await sleep(1500);

      setTransactionStatus({
        status: 'success',
        message: result.message || 'Transaction confirmed!',
        txHash: result.txHash,
      });

      addToast({
        type: 'success',
        title: 'Staking Successful',
        message: `Successfully staked ${stakingAmount} OINIO`,
      });

      setStakingAmount('');
      retryCountRef.current = 0;

    } catch (error) {
      console.error('Staking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setTransactionStatus({
        status: 'error',
        message: errorMessage,
        retryCount: retryCountRef.current,
      });

      addToast({
        type: 'error',
        title: 'Transaction Failed',
        message: errorMessage,
        duration: 8000,
      });
    } finally {
      setIsStaking(false);
    }
  }, [stakingAmount, isConnected, userAddress, isOnline, addToast, executeGaslessTransaction]);

  // Manual retry handler
  const handleRetry = useCallback(() => {
    if (lastStakeAmountRef.current) {
      setStakingAmount(lastStakeAmountRef.current);
      handleStake();
    }
  }, [handleStake]);

  // Initialize connection and listeners
  useEffect(() => {
    checkConnection();

    // Set up periodic connection check
    connectionCheckRef.current = setInterval(checkConnection, CONNECTION_CHECK_INTERVAL);

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      addToast({
        type: 'success',
        title: 'Connection Restored',
        message: 'You are back online.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast({
        type: 'warning',
        title: 'Connection Lost',
        message: 'You appear to be offline.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Account change listener - set up MetaMask event handlers
    const setupEthereumListeners = () => {
      const eth = window.ethereum;
      if (!eth || !eth.on) return;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setUserAddress('');
          addToast({
            type: 'info',
            title: 'Wallet Disconnected',
            message: 'Your wallet has been disconnected.',
          });
        } else {
          setUserAddress(accounts[0]);
          addToast({
            type: 'info',
            title: 'Account Changed',
            message: `Switched to ${truncateAddress(accounts[0])}`,
          });
        }
      };

      const handleChainChanged = (chainId: string) => {
        setNetworkName(getNetworkName(chainId));
        addToast({
          type: 'info',
          title: 'Network Changed',
          message: `Switched to ${getNetworkName(chainId)}`,
        });
      };

      // Use the checked `on` method
      const onMethod = eth.on;
      onMethod.call(eth, 'accountsChanged', handleAccountsChanged as (...args: unknown[]) => void);
      onMethod.call(eth, 'chainChanged', handleChainChanged as (...args: unknown[]) => void);
    };

    setupEthereumListeners();

    return () => {
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection, addToast, truncateAddress, getNetworkName]);

  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Dashboard error boundary caught:', error);
      }}
    >
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-amber-500/90 text-white text-center py-2 text-sm z-40">
            You are currently offline. Some features may not work.
          </div>
        )}

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
                  disabled={transactionStatus.status === 'pending'}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {transactionStatus.status === 'pending' ? 'Connecting...' : 'Connect Wallet'}
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
          <TransactionStatusBanner
            status={transactionStatus}
            onDismiss={() => setTransactionStatus({ status: 'idle', message: '' })}
            onRetry={handleRetry}
          />
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
                      disabled={!isConnected || isStaking}
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
                  disabled={!isConnected || !stakingAmount || isStaking || !isOnline}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStaking ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {transactionStatus.message || 'Processing...'}
                    </span>
                  ) : !isConnected ? (
                    'Connect Wallet to Stake'
                  ) : !isOnline ? (
                    'Waiting for Connection...'
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
                <span className="text-white/60 text-sm">OINIO • Sovereign Staking Protocol</span>
              </div>
              <div className="flex items-center space-x-6 text-white/40 text-sm">
                <span>Frequency: 1010 Hz</span>
                <span>•</span>
                <span>Built for the Truth Movement</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
