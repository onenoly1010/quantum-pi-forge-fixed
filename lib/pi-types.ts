/**
 * Pi Network SDK Type Definitions
 * 
 * These types align with the Pi SDK and backend API.
 */

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

export interface PaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: object;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
  created_at: string;
  network: 'Pi Network' | 'Pi Testnet';
}

export interface PiAuthState {
  user: PiUser | null;
  accessToken: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export interface PiAuthContextValue extends PiAuthState {
  authenticate: () => Promise<void>;
  logout: () => void;
  createPayment: (paymentData: PaymentData) => Promise<void>;
}
