// Lightweight shim for Pi SDK hooks used in the mobile preview
// Replace the implementation below with real imports from the Pi SDK when available

type ConnectResult = {
  connected: boolean;
  status: string;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export function usePiConnection(): ConnectResult {
  // Simple mock for local dev
  const [connected, setConnected] = require('react').useState(false);
  const [status, setStatus] = require('react').useState('disconnected');

  async function connect() {
    setStatus('connecting');
    // Simulate async handshake (replace with usePiConnection hook)
    await new Promise(res => setTimeout(res, 800));
    setConnected(true);
    setStatus('connected');
  }

  function disconnect() {
    setConnected(false);
    setStatus('disconnected');
  }

  return { connected, status, connect, disconnect } as unknown as ConnectResult;
}

export function usePiPurchase() {
  const [purchasing, setPurchasing] = require('react').useState(false);
  const [lastReceipt, setLastReceipt] = require('react').useState<any | null>(null);

  async function purchase(_opts: { amount: string; currency: string }) {
    setPurchasing(true);
    await new Promise(res => setTimeout(res, 1200));
    const receipt = { id: `rcpt_${Math.random().toString(36).slice(2, 9)}` };
    setLastReceipt(receipt);
    setPurchasing(false);
    return receipt;
  }

  return { purchase, purchasing, lastReceipt };
}