/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Pi Network Authentication', () => {
  const originalPi = (window as any).Pi;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (window as any).Pi = null;
  });

  afterEach(() => {
    (window as any).Pi = originalPi;
    jest.useRealTimers();
  });

  describe('Development Mode (No Pi SDK)', () => {
    it('renders the connect button in development mode', () => {
      render(<App />);
      
      expect(screen.getByText('🌌 Quantum Pi Forge v2')).toBeInTheDocument();
      expect(screen.getByText('Connect with Pi')).toBeInTheDocument();
    });

    it('shows development mode message initially', async () => {
      render(<App />);
      
      // Fire the load event to trigger Pi check
      fireEvent(window, new Event('load'));
      
      await waitFor(() => {
        expect(screen.getByText('🔧 Development mode - Click to see demo simulation')).toBeInTheDocument();
      });
    });

    it('shows demo simulation when connecting without Pi SDK', async () => {
      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      const connectButton = screen.getByText('Connect with Pi');
      fireEvent.click(connectButton);
      
      expect(screen.getByText('🔧 Demo mode: Simulating Pi connection...')).toBeInTheDocument();
      
      // Fast-forward timer for demo simulation
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      
      expect(screen.getByText('✅ [DEMO] Connected as @demo_user - Deploy to Pi Network for real authentication')).toBeInTheDocument();
    });

    it('shows development preview notice when Pi SDK is not available', () => {
      render(<App />);
      
      expect(screen.getByText(/Development Preview/)).toBeInTheDocument();
      expect(screen.getByText(/This demo simulates the Pi connection/)).toBeInTheDocument();
    });
  });

  describe('Pi Browser Mode (With Pi SDK)', () => {
    const mockPi = {
      init: jest.fn(),
      authenticate: jest.fn(),
    };

    beforeEach(() => {
      (window as any).Pi = mockPi;
    });

    it('detects Pi SDK and shows ready status', () => {
      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      expect(screen.getByText('Pi SDK detected. Click to connect.')).toBeInTheDocument();
    });

    it('calls Pi.init and Pi.authenticate when connecting', async () => {
      mockPi.authenticate.mockResolvedValueOnce({
        user: { username: 'real_pi_user' },
      });

      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      const connectButton = screen.getByText('Connect with Pi');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(mockPi.init).toHaveBeenCalledWith({ version: '2.0', sandbox: false });
        expect(mockPi.authenticate).toHaveBeenCalledWith(['username'], expect.any(Function));
      });
    });

    it('shows connected status with username on successful auth', async () => {
      mockPi.authenticate.mockResolvedValueOnce({
        user: { username: 'sovereign_pi_user' },
      });

      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      const connectButton = screen.getByText('Connect with Pi');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText('✅ Connected as @sovereign_pi_user')).toBeInTheDocument();
      });
    });

    it('shows error message when authentication fails', async () => {
      mockPi.authenticate.mockRejectedValueOnce(new Error('User cancelled'));

      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      const connectButton = screen.getByText('Connect with Pi');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText('❌ Auth canceled or failed: User cancelled')).toBeInTheDocument();
      });
    });

    it('handles unknown authentication errors gracefully', async () => {
      mockPi.authenticate.mockRejectedValueOnce({});

      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      const connectButton = screen.getByText('Connect with Pi');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText('❌ Auth canceled or failed: Unknown error')).toBeInTheDocument();
      });
    });

    it('shows connecting status while authenticating', async () => {
      mockPi.authenticate.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<App />);
      
      fireEvent(window, new Event('load'));
      
      const connectButton = screen.getByText('Connect with Pi');
      fireEvent.click(connectButton);
      
      expect(screen.getByText('Connecting to Pi Network...')).toBeInTheDocument();
    });
  });

  describe('UI Styling', () => {
    it('renders with quantum theme colors', () => {
      const { container } = render(<App />);
      
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveStyle({ background: '#1f0033' });
    });

    it('has properly styled connect button', () => {
      render(<App />);
      
      const button = screen.getByText('Connect with Pi');
      expect(button).toHaveStyle({
        background: '#6f42c1',
        borderRadius: '12px',
      });
    });
  });

  describe('Accessibility', () => {
    it('connect button is clickable', () => {
      render(<App />);
      fireEvent(window, new Event('load'));
      
      const button = screen.getByText('Connect with Pi');
      expect(button).not.toBeDisabled();
    });

    it('has descriptive heading', () => {
      render(<App />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quantum Pi Forge v2');
    });
  });
});
