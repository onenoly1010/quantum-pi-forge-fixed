/**
 * Pi Network API Client
 * Wrapper for Pi Platform API interactions
 */

class PiApiClient {
  constructor() {
    this.baseUrl = process.env.PI_API_BASE_URL || "https://api.pi.network";
    this.apiKey = process.env.PI_API_KEY;
    this.appId = process.env.PI_APP_ID;
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "X-App-ID": this.appId,
      },
      timeout: this.timeout,
    };

    const requestOptions = { ...defaultOptions, ...options };

    // Add auth headers if available
    if (options.accessToken) {
      requestOptions.headers.Authorization = `Bearer ${options.accessToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  /**
   * Get user information
   */
  async getUser(username) {
    return this.request(`/v1/user/${username}`);
  }

  /**
   * Get payment information
   */
  async getPayment(paymentId) {
    return this.request(`/v1/payments/${paymentId}`);
  }

  /**
   * Get app information
   */
  async getAppInfo() {
    return this.request("/v1/app");
  }

  /**
   * Verify payment server-side
   */
  async verifyPaymentServerSide(paymentId, accessToken) {
    return this.request(`/v1/payments/${paymentId}/verify`, {
      method: "POST",
      accessToken: accessToken,
    });
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(username, limit = 50) {
    return this.request(`/v1/user/${username}/transactions?limit=${limit}`);
  }

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await this.request("/health");
      return response.status === "ok";
    } catch (error) {
      return false;
    }
  }
}

export default PiApiClient;
