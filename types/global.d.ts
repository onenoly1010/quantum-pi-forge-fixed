// Ethereum provider types for MetaMask and other Web3 wallets
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<string[] | string | null>;
  on?: (eventName: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, callback: (...args: unknown[]) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
