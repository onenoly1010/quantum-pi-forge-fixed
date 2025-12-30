'use client';

/**
 * Pi Authentication Button Component
 * 
 * A button that handles Pi Network authentication.
 */

import React from 'react';
import { usePiAuth } from '@/contexts/PiAuthContext';

interface PiAuthButtonProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function PiAuthButton({ className = '', onSuccess, onError }: PiAuthButtonProps) {
  const { connected, loading, user, authenticate, logout } = usePiAuth();

  const handleAuth = async () => {
    try {
      await authenticate();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Authentication failed'));
    }
  };

  if (connected && user) {
    return (
      <button
        onClick={logout}
        className={`px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        disabled={loading}
      >
        {loading ? 'Loading...' : `Disconnect (${user.username})`}
      </button>
    );
  }

  return (
    <button
      onClick={handleAuth}
      className={`px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={loading}
    >
      {loading ? 'Connecting...' : 'Connect with Pi'}
    </button>
  );
}
