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

      if (!user || !user.uid) {
        throw new Error('Authentication failed - no valid user returned');
      }

      return {
        uid: user.uid,
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
    
    if (!user || !user.uid) {
      return null;
    }
    
    return {
      uid: user.uid,
      username: user.username || user.name || '',
      name: user.name,
      ...user,
    };
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

    // Validate payment data
    if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
      throw new Error('Invalid amount - must be a positive number');
    }

    if (paymentData.amount > 1000000) {
      throw new Error('Amount exceeds maximum limit');
    }

    if (!paymentData.memo || typeof paymentData.memo !== 'string') {
      throw new Error('Memo is required and must be a string');
    }

    if (paymentData.memo.length > 1000) {
      throw new Error('Memo exceeds maximum length of 1000 characters');
    }

    // Sanitize memo to prevent injection
    const sanitizedMemo = paymentData.memo.replace(/[<>]/g, '');

    try {
      const piPaymentData: PiPaymentData = {
        amount: paymentData.amount,
        memo: sanitizedMemo,
        metadata: paymentData.metadata || {},
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
