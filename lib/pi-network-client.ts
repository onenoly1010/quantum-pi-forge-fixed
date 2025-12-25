// lib/pi-network-client.ts - Pi Network API client

const PI_NETWORK_API_ENDPOINT = process.env.PI_NETWORK_API_ENDPOINT || "https://api.minepi.com";
const PI_NETWORK_API_KEY = process.env.PI_NETWORK_API_KEY!;
const PI_NETWORK_APP_ID = process.env.PI_NETWORK_APP_ID!;

interface PiPaymentRequest {
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
}

interface PiPaymentResponse {
  payment_id: string;
  created_at: string;
  amount: number;
  memo: string;
  status: string;
}

export class PiNetworkClient {
  private apiKey: string;
  private appId: string;
  private endpoint: string;

  constructor(
    apiKey: string = PI_NETWORK_API_KEY,
    appId: string = PI_NETWORK_APP_ID,
    endpoint: string = PI_NETWORK_API_ENDPOINT
  ) {
    this.apiKey = apiKey;
    this.appId = appId;
    this.endpoint = endpoint;
  }

  async createPayment(paymentRequest: PiPaymentRequest): Promise<PiPaymentResponse> {
    const response = await fetch(`${this.endpoint}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        ...paymentRequest,
        app_id: this.appId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Pi Network API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async completePayment(paymentId: string, txid: string) {
    const response = await fetch(
      `${this.endpoint}/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ txid }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Pi Network API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async getPaymentStatus(paymentId: string) {
    const response = await fetch(
      `${this.endpoint}/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Pi Network API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async validateWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return signature === expectedSignature;
  }
}

// Export singleton instance
export const piNetworkClient = new PiNetworkClient();
