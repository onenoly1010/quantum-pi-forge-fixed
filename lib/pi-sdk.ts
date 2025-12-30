/**
 * Pi Network SDK Integration
 * 
 * This module provides a type-safe wrapper around the Pi SDK.
 */

import { PiSdkBase, PaymentData as PiPaymentData } from 'pi-sdk-js';
import type { PiUser, PaymentData } from './pi-types';

// Extend the Window interface to include Pi SDK
declare global {
  interface Window {
    Pi: any;
  }
}

class PiSdk {
  private sdk: PiSdkBase | null = null;
  private initialized = false;

  /**
   * Initialize the Pi SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if we're in a Pi Browser environment
      if (typeof window !== 'undefined' && window.Pi) {
        this.sdk = new PiSdkBase();
        this.initialized = true;
        console.log('[Pi SDK] Initialized successfully');
      } else {
        console.warn('[Pi SDK] Not running in Pi Browser - SDK disabled');
      }
    } catch (error) {
      console.error('[Pi SDK] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with Pi Network
   */
  async authenticate(): Promise<PiUser | null> {
    if (!this.sdk) {
      await this.initialize();
    }

    if (!this.sdk) {
      throw new Error('Pi SDK not available - must run in Pi Browser');
    }

    try {
      await this.sdk.connect();
      
      const user = PiSdkBase.get_user();
      const accessToken = PiSdkBase.accessToken;

      if (!user) {
        throw new Error('Authentication failed - no user returned');
      }

      return {
        uid: user.uid || '',
        username: user.username || user.name || '',
        name: user.name,
        ...user,
      };
    } catch (error) {
      console.error('[Pi SDK] Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get the current user
   */
  getCurrentUser(): PiUser | null {
    const user = PiSdkBase.get_user();
    return user ? {
      uid: user.uid || '',
      username: user.username || user.name || '',
      name: user.name,
      ...user,
    } : null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return PiSdkBase.accessToken;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return PiSdkBase.get_connected();
  }

  /**
   * Create a payment request
   */
  async createPayment(paymentData: PaymentData): Promise<void> {
    if (!this.sdk) {
      throw new Error('Pi SDK not initialized');
    }

    if (!this.isConnected()) {
      throw new Error('Not authenticated - please authenticate first');
    }

    try {
      const piPaymentData: PiPaymentData = {
        amount: paymentData.amount,
        memo: paymentData.memo,
        metadata: paymentData.metadata,
      };

      this.sdk.createPayment(piPaymentData);
    } catch (error) {
      console.error('[Pi SDK] Payment creation error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const piSdk = new PiSdk();

// Export class for testing
export { PiSdk };
