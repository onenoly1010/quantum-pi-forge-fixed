/**
 * Pi Network Payments - Create Payment
 * Initiates Pi payment transactions
 */

class PiPaymentCreator {
  constructor() {
    this.isPiBrowser = typeof window !== "undefined" && window.Pi;
  }

  /**
   * Create a Pi payment
   */
  async createPayment(paymentData) {
    if (!this.isPiBrowser) {
      // Development mode simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            identifier: `demo_payment_${Date.now()}`,
            amount: paymentData.amount,
            memo: paymentData.memo,
            status: "pending",
          });
        }, 1000);
      });
    }

    try {
      const payment = await window.Pi.createPayment({
        amount: paymentData.amount,
        memo: paymentData.memo,
        metadata: paymentData.metadata || {},
      });

      return {
        identifier: payment.identifier,
        amount: payment.amount,
        memo: payment.memo,
        status: payment.status,
      };
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  /**
   * Create payment for OINIO staking
   */
  async createStakingPayment(amount, userAddress) {
    return this.createPayment({
      amount: amount,
      memo: `OINIO Staking: ${amount} tokens`,
      metadata: {
        type: "staking",
        userAddress: userAddress,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Create payment for oracle reading
   */
  async createOraclePayment(amount, readingType) {
    return this.createPayment({
      amount: amount,
      memo: `Oracle Reading: ${readingType}`,
      metadata: {
        type: "oracle",
        readingType: readingType,
        timestamp: Date.now(),
      },
    });
  }
}

export default PiPaymentCreator;
