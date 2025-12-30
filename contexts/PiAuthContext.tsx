'use client';

/**
 * Pi Authentication Context
 * 
 * Provides authentication state and methods to the entire application.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { piSdk } from '@/lib/pi-sdk';
import type { PiAuthContextValue, PiUser, PaymentData } from '@/lib/pi-types';

const PiAuthContext = createContext<PiAuthContextValue | undefined>(undefined);

interface PiAuthProviderProps {
  children: React.ReactNode;
}

export function PiAuthProvider({ children }: PiAuthProviderProps) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize and check for existing session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize the SDK
        await piSdk.initialize();

        // Check if already connected
        if (piSdk.isConnected()) {
          const currentUser = piSdk.getCurrentUser();
          const token = piSdk.getAccessToken();

          if (currentUser && token) {
            setUser(currentUser);
            setAccessToken(token);
            setConnected(true);
          }
        }
      } catch (err) {
        console.error('[PiAuthContext] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Pi SDK');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Authenticate with Pi Network
   */
  const authenticate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authenticatedUser = await piSdk.authenticate();
      const token = piSdk.getAccessToken();

      if (authenticatedUser && token) {
        setUser(authenticatedUser);
        setAccessToken(token);
        setConnected(true);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error('[PiAuthContext] Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setConnected(false);
    setError(null);
  }, []);

  /**
   * Create a payment
   */
  const createPayment = useCallback(async (paymentData: PaymentData) => {
    try {
      setError(null);
      await piSdk.createPayment(paymentData);
    } catch (err) {
      console.error('[PiAuthContext] Payment creation error:', err);
      setError(err instanceof Error ? err.message : 'Payment creation failed');
      throw err;
    }
  }, []);

  const value: PiAuthContextValue = {
    user,
    accessToken,
    connected,
    loading,
    error,
    authenticate,
    logout,
    createPayment,
  };

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>;
}

/**
 * Hook to use Pi authentication context
 */
export function usePiAuth(): PiAuthContextValue {
  const context = useContext(PiAuthContext);
  
  if (context === undefined) {
    throw new Error('usePiAuth must be used within a PiAuthProvider');
  }
  
  return context;
}
