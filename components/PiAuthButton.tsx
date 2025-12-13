'use client';

import React from 'react';
import { usePiAuth } from '@/contexts/PiAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

export const PiAuthButton: React.FC = () => {
  const { isAuthenticated, isLoading, user, error, login, logout } = usePiAuth();

  if (isLoading) {
    return (
      <Button disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Initializing...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-purple-300">
            {user.username}
          </span>
          <span className="text-xs text-gray-400">
            Pi UID: {user.uid.slice(0, 8)}...
          </span>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="gap-2 border-red-500/20 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={login}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
      >
        <img src="/pi-logo.svg" alt="Pi" className="h-5 w-5" />
        Connect with Pi Network
      </Button>
      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};
