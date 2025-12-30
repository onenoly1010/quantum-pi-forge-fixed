'use client';

/**
 * Protected Route Component
 * 
 * Wraps components that require authentication.
 * Redirects to home or shows login if not authenticated.
 */

import React from 'react';
import { usePiAuth } from '@/contexts/PiAuthContext';
import PiAuthButton from './PiAuthButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { connected, loading } = usePiAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">
            You need to authenticate with Pi Network to access this page.
          </p>
          <PiAuthButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
