'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authenticateWithPi, initializePiSDK } from '@/lib/pi-sdk';

interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: PiUser | null;
  jwtToken: string | null;
  error: string | null;
}

interface PiAuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pi-forge-backend.up.railway.app';

export const PiAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    jwtToken: null,
    error: null,
  });

  // Initialize Pi SDK on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializePiSDK();
        // Check for existing session
        const storedToken = localStorage.getItem('oinio_jwt');
        const storedUser = localStorage.getItem('oinio_user');
        
        if (storedToken && storedUser) {
          // Verify token is still valid
          const isValid = await verifyToken(storedToken);
          if (isValid) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: JSON.parse(storedUser),
              jwtToken: storedToken,
              error: null,
            });
            return;
          }
        }
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Initialization error:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize Pi SDK',
        }));
      }
    };

    init();
  }, []);

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const login = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Authenticate with Pi SDK
      const piAuth = await authenticateWithPi();
      
      if (!piAuth || !piAuth.accessToken) {
        throw new Error('Pi authentication failed: No access token received');
      }

      const piUser: PiUser = {
        uid: piAuth.user.uid,
        username: piAuth.user.username,
        accessToken: piAuth.accessToken,
      };

      // Step 2: Send to backend for verification and JWT issuance
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          piUid: piUser.uid,
          username: piUser.username,
          accessToken: piUser.accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Backend authentication failed');
      }

      const { jwtToken, user } = await response.json();

      // Step 3: Store credentials
      localStorage.setItem('oinio_jwt', jwtToken);
      localStorage.setItem('oinio_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: piUser,
        jwtToken,
        error: null,
      });

      console.log('✅ Authentication successful:', user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('❌ Login error:', errorMessage);
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        jwtToken: null,
        error: errorMessage,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('oinio_jwt');
    localStorage.removeItem('oinio_user');
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      jwtToken: null,
      error: null,
    });

    console.log('✅ Logged out successfully');
  };

  const refreshAuth = async () => {
    if (!authState.jwtToken) return;
    
    try {
      const isValid = await verifyToken(authState.jwtToken);
      if (!isValid) {
        logout();
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout();
    }
  };

  const value: PiAuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
  };

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>;
};

export const usePiAuth = () => {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error('usePiAuth must be used within a PiAuthProvider');
  }
  return context;
};
