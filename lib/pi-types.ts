// Type definitions for Pi Browser SDK
export interface PiUser {
  uid: string;
  username: string;
}

export interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: any;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

export interface PiPayment {
  identifier: string;
  [key: string]: any;
}

export interface PiSDK {
  init: (config: { version: string; sandbox: boolean }) => Promise<void>;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPayment) => void
  ) => Promise<PiAuthResult>;
  createPayment: (
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ) => Promise<PiPayment>;
  openPaymentRequest: (paymentId: string) => Promise<void>;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

export {};
