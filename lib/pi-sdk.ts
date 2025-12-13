import type { PiAuthResult, PiPayment, PiPaymentData, PiPaymentCallbacks } from './pi-types';

// Pi SDK Configuration
const PI_CONFIG = {
  version: "2.0",
  sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true', // true for testnet, false for mainnet
};

// Initialize Pi SDK
export const initializePiSDK = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.Pi) {
    console.warn('⚠️ Pi SDK not available. Make sure you are running in Pi Browser.');
    return;
  }

  try {
    await window.Pi.init({
      version: PI_CONFIG.version,
      sandbox: PI_CONFIG.sandbox,
    });
    console.log('✅ Pi SDK initialized successfully');
  } catch (error) {
    console.error('❌ Pi SDK initialization failed:', error);
    throw error;
  }
};

// Handle incomplete payments
const onIncompletePaymentFound = (payment: PiPayment) => {
  console.log('Incomplete payment found:', payment);
  // Handle incomplete payment (show UI, etc.)
  if (window.Pi) {
    return window.Pi.openPaymentRequest(payment.identifier);
  }
};

// Authenticate user with Pi Network
export const authenticateWithPi = async (): Promise<PiAuthResult> => {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK not available. Please open this app in Pi Browser.');
  }

  try {
    const scopes = ['username', 'payments', 'wallet_address'];
    const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    return auth;
  } catch (error) {
    console.error('❌ Pi authentication failed:', error);
    throw error;
  }
};

// Create payment
export const createPiPayment = async (
  amount: number,
  memo: string,
  metadata: any
): Promise<PiPayment> => {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK not available. Please open this app in Pi Browser.');
  }

  try {
    const paymentData: PiPaymentData = {
      amount,
      memo,
      metadata,
    };
    
    const callbacks: PiPaymentCallbacks = {
      onReadyForServerApproval: (paymentId) => {
        console.log('Payment ready for approval:', paymentId);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        console.log('Payment ready for completion:', paymentId, txid);
      },
      onCancel: (paymentId) => {
        console.log('Payment cancelled:', paymentId);
      },
      onError: (error, payment) => {
        console.error('Payment error:', error, payment);
      },
    };

    const payment = await window.Pi.createPayment(paymentData, callbacks);
    return payment;
  } catch (error) {
    console.error('❌ Pi payment creation failed:', error);
    throw error;
  }
};

// Check if Pi SDK is available
export const isPiSDKAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.Pi;
};
