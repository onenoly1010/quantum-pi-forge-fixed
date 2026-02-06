import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../src/components/Dashboard';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn(),
    BrowserProvider: jest.fn(),
    Contract: jest.fn(),
  },
}));

describe('Dashboard - MetaMask Wallet Connection', () => {
  const mockEthereum = {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).ethereum = mockEthereum;
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('renders the dashboard with connect button when not connected', () => {
      mockEthereum.request.mockResolvedValueOnce([]);
      
      render(<Dashboard />);
      
      expect(screen.getByText('Quantum Pi Forge Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
    });

    it('shows wallet connection section', () => {
      mockEthereum.request.mockResolvedValueOnce([]);
      
      render(<Dashboard />);
      
      expect(screen.getByText('Wallet Connection')).toBeInTheDocument();
    });

    it('shows OINIO balance section', () => {
      mockEthereum.request.mockResolvedValueOnce([]);
      
      render(<Dashboard />);
      
      expect(screen.getByText('OINIO Balance')).toBeInTheDocument();
      expect(screen.getByText('0 OINIO')).toBeInTheDocument();
    });

    it('shows staking section', () => {
      mockEthereum.request.mockResolvedValueOnce([]);
      
      render(<Dashboard />);
      
      expect(screen.getByText('Stake OINIO Tokens')).toBeInTheDocument();
    });
  });

  describe('Wallet Connection Flow', () => {
    it('connects wallet successfully when MetaMask is available', async () => {
      const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
      mockEthereum.request
        .mockResolvedValueOnce([]) // Initial eth_accounts check
        .mockResolvedValueOnce([mockAddress]); // eth_requestAccounts

      render(<Dashboard />);

      const connectButton = screen.getByText('Connect MetaMask');
      await userEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      expect(screen.getByText(mockAddress)).toBeInTheDocument();
    });

    it('shows error when MetaMask connection fails', async () => {
      mockEthereum.request
        .mockResolvedValueOnce([]) // Initial eth_accounts check
        .mockRejectedValueOnce(new Error('User rejected')); // eth_requestAccounts fails

      render(<Dashboard />);

      const connectButton = screen.getByText('Connect MetaMask');
      await userEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to connect wallet. Please try again.')).toBeInTheDocument();
      });
    });

    it('shows error when MetaMask is not installed', async () => {
      (window as any).ethereum = undefined;

      render(<Dashboard />);

      // Since MetaMask is not installed, clicking connect should show error
      const connectButton = screen.getByText('Connect MetaMask');
      await userEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('MetaMask not detected. Please install MetaMask.')).toBeInTheDocument();
      });
    });

    it('auto-connects if wallet is already connected', async () => {
      const mockAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
      mockEthereum.request.mockResolvedValueOnce([mockAddress]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });
    });
  });

  describe('Staking Flow', () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';

    beforeEach(() => {
      mockEthereum.request.mockResolvedValue([mockAddress]);
    });

    it('disables stake button when not connected', async () => {
      mockEthereum.request.mockResolvedValueOnce([]);

      render(<Dashboard />);

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      expect(stakeButton).toBeDisabled();
    });

    it('allows entering staking amount when connected', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      expect(input).not.toBeDisabled();

      await userEvent.type(input, '100');
      expect(input).toHaveValue(100);
    });

    it('calls API endpoint when staking', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          txHash: '0xabcdef123456789',
        }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      await userEvent.type(input, '10');

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      await userEvent.click(stakeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/sponsor-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: '10',
            userAddress: mockAddress,
          }),
        });
      });
    });

    it('shows success message and transaction hash after staking', async () => {
      const txHash = '0xabcdef123456789testTransactionHash';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          txHash,
        }),
      });

      // Mock alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      await userEvent.type(input, '10');

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      await userEvent.click(stakeButton);

      await waitFor(() => {
        expect(screen.getByText('Transaction Successful!')).toBeInTheDocument();
        expect(screen.getByText(`Hash: ${txHash}`)).toBeInTheDocument();
      });

      alertMock.mockRestore();
    });

    it('shows error message when staking fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Insufficient balance',
        }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      await userEvent.type(input, '10');

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      await userEvent.click(stakeButton);

      await waitFor(() => {
        expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
      });
    });

    it('shows loading state during staking transaction', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, txHash: '0x123' }),
        }), 1000))
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      await userEvent.type(input, '10');

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      await userEvent.click(stakeButton);

      expect(screen.getByText('Processing Gasless Transaction...')).toBeInTheDocument();
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      await userEvent.type(input, '10');

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      await userEvent.click(stakeButton);

      await waitFor(() => {
        expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
      });
    });
  });

  describe('UI Elements', () => {
    it('shows gasless transaction info message', () => {
      mockEthereum.request.mockResolvedValueOnce([]);

      render(<Dashboard />);

      expect(screen.getByText('No gas fees required - transactions sponsored by Quantum Pi Forge')).toBeInTheDocument();
    });

    it('includes link to PolygonScan after successful transaction', async () => {
      const txHash = '0xabcdef123456789';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, txHash }),
      });

      jest.spyOn(window, 'alert').mockImplementation(() => {});

      mockEthereum.request.mockResolvedValue(['0x1234567890abcdef1234567890abcdef12345678']);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('✅ Connected')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter amount (0.01 - 10000)');
      await userEvent.type(input, '10');

      const stakeButton = screen.getByText('Stake with Gasless Transaction');
      await userEvent.click(stakeButton);

      await waitFor(() => {
        const link = screen.getByText('View on PolygonScan');
        expect(link).toHaveAttribute('href', `https://polygonscan.com/tx/${txHash}`);
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });
});
