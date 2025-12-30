/**
 * Type definitions for pi-sdk-js
 * Based on the Pi SDK library structure
 */

declare module 'pi-sdk-js' {
  import { Mutex } from 'async-mutex';

  export interface PiUser {
    uid?: string;
    username?: string;
    name?: string;
    [key: string]: any;
  }

  export interface PaymentData {
    amount: number;
    memo: string;
    metadata: Record<string, unknown>;
  }

  export class PiSdkBase {
    static user: PiUser | null;
    static connected: boolean;
    static accessToken: string | null;
    static paymentBasePath: string;
    static logPrefix: string;
    static version: string;
    static connectMutex: Mutex;

    onConnection?: () => void;

    constructor();

    static get_connected(): boolean;
    static get_user(): PiUser | null;
    static log(...args: unknown[]): void;
    static error(...args: unknown[]): void;
    static postToServer(path: string, body: object): Promise<any>;
    static onReadyForServerApproval(paymentId: string, accessToken: string): Promise<void>;
    static onReadyForServerCompletion(paymentId: string, transactionId: string): Promise<void>;
    static onCancel(paymentId: string): Promise<void>;
    static onError(error: string, paymentDTO: any): Promise<void>;
    static onIncompletePaymentFound(paymentDTO: any): Promise<void>;

    initializePiSdkBase(): void;
    connect(): Promise<void>;
    createPayment(paymentData: PaymentData): void;
  }

  declare global {
    interface Window {
      Pi: any;
    }
  }
}
