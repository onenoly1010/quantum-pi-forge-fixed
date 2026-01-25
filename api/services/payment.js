/**
 * Payment Service
 * Handles Pi Network payments and transaction processing
 */

const crypto = require('crypto');
const { dbManager } = require('../config/database');
const { ApiError } = require('../shared/errors');
const { generateId, hashData, retry } = require('../shared/utils');
const { getEnvVar } = require('../config/environment');

class PaymentService {
  constructor() {
    this.piApiKey = getEnvVar('PI_API_KEY');
    this.piAppId = getEnvVar('PI_APP_ID');
    this.piSandbox = getEnvVar('PI_SANDBOX', 'true') === 'true';
    this.webhookSecret = getEnvVar('PI_WEBHOOK_SECRET');
    this.piBaseUrl = this.piSandbox
      ? 'https://api.testnet.minepi.com'
      : 'https://api.mainnet.minepi.com';
  }

  /**
   * Create payment
   */
  async createPayment(userId, amount, currency = 'PI', metadata = {}) {
    try {
      // Validate amount
      if (amount <= 0 || amount > 10000) {
        throw new ApiError('Invalid payment amount. Must be between 0.01 and 10000 PI', 400);
      }

      // Generate payment ID
      const paymentId = generateId();

      // Create payment record
      const payment = {
        paymentId,
        userId,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        metadata: {
          description: metadata.description || `Payment of ${amount} ${currency}`,
          productId: metadata.productId,
          inftId: metadata.inftId,
          soulId: metadata.soulId,
          ...metadata
        },
        piPayment: null, // Will be populated when Pi payment is created
        blockchain: {
          confirmed: false,
          transactionHash: null,
          blockNumber: null
        }
      };

      // Save to database
      const payments = dbManager.getCollection('payments');
      await payments.insertOne(payment);

      // Create Pi Network payment
      const piPayment = await this.createPiPayment(payment);

      // Update payment with Pi payment data
      await payments.updateOne(
        { paymentId },
        {
          $set: {
            piPayment,
            updatedAt: new Date()
          }
        }
      );

      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    const payments = dbManager.getCollection('payments');
    const payment = await payments.findOne({ paymentId });

    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }

    return payment;
  }

  /**
   * Get payments for user
   */
  async getPaymentsForUser(userId, page = 1, limit = 20) {
    const payments = dbManager.getCollection('payments');
    const skip = (page - 1) * limit;

    const [total, paymentsList] = await Promise.all([
      payments.countDocuments({ userId }),
      payments.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    return {
      payments: paymentsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentId) {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (payment.status === 'completed') {
        return { verified: true, payment };
      }

      if (payment.status === 'failed') {
        throw new ApiError('Payment has failed', 400);
      }

      if (payment.status === 'expired') {
        throw new ApiError('Payment has expired', 400);
      }

      // Check with Pi Network
      const piVerification = await this.verifyPiPayment(payment.piPayment.id);

      if (piVerification.status === 'completed') {
        // Update payment status
        await this.updatePaymentStatus(paymentId, 'completed', {
          transactionHash: piVerification.transactionHash,
          blockNumber: piVerification.blockNumber
        });

        return { verified: true, payment: await this.getPaymentById(paymentId) };
      } else if (piVerification.status === 'failed') {
        await this.updatePaymentStatus(paymentId, 'failed');
        throw new ApiError('Payment verification failed', 400);
      }

      return { verified: false, payment };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Handle Pi Network webhook
   */
  async handleWebhook(webhookData, signature) {
    try {
      // Verify webhook signature
      const isValidSignature = this.verifyWebhookSignature(webhookData, signature);
      if (!isValidSignature) {
        throw new ApiError('Invalid webhook signature', 401);
      }

      const { paymentId, status, transactionHash, blockNumber } = webhookData;

      // Find payment by Pi payment ID
      const payments = dbManager.getCollection('payments');
      const payment = await payments.findOne({
        'piPayment.id': paymentId
      });

      if (!payment) {
        console.warn(`Payment not found for Pi payment ID: ${paymentId}`);
        return { acknowledged: true };
      }

      // Update payment status
      const updateData = { status };
      if (status === 'completed') {
        updateData.blockchain = {
          confirmed: true,
          transactionHash,
          blockNumber
        };
      }

      await payments.updateOne(
        { paymentId: payment.paymentId },
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      // Trigger post-payment actions
      if (status === 'completed') {
        await this.handlePaymentCompletion(payment);
      }

      return { acknowledged: true, paymentId: payment.paymentId };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Create Pi Network payment
   */
  async createPiPayment(payment) {
    try {
      const piPaymentData = {
        amount: payment.amount,
        currency: payment.currency,
        app_id: this.piAppId,
        user_id: payment.userId,
        metadata: {
          paymentId: payment.paymentId,
          description: payment.metadata.description,
          productId: payment.metadata.productId
        }
      };

      // In production, this would make an HTTP request to Pi Network API
      // For now, simulate Pi payment creation
      const piPayment = {
        id: generateId(),
        amount: payment.amount,
        currency: payment.currency,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: payment.expiresAt.toISOString(),
        metadata: piPaymentData.metadata
      };

      return piPayment;
    } catch (error) {
      console.error('Pi payment creation error:', error);
      throw new ApiError('Failed to create Pi Network payment', 500);
    }
  }

  /**
   * Verify Pi Network payment
   */
  async verifyPiPayment(piPaymentId) {
    try {
      // In production, this would query Pi Network API
      // For now, simulate verification
      const mockVerification = {
        status: 'completed',
        transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
        blockNumber: Math.floor(Math.random() * 1000000)
      };

      return mockVerification;
    } catch (error) {
      console.error('Pi payment verification error:', error);
      throw new ApiError('Failed to verify Pi Network payment', 500);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(webhookData, signature) {
    try {
      if (!this.webhookSecret) {
        console.warn('PI_WEBHOOK_SECRET not configured - skipping signature verification');
        return true;
      }

      const payload = JSON.stringify(webhookData);
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, status, blockchainData = {}) {
    const payments = dbManager.getCollection('payments');

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (Object.keys(blockchainData).length > 0) {
      updateData.blockchain = blockchainData;
    }

    await payments.updateOne(
      { paymentId },
      { $set: updateData }
    );
  }

  /**
   * Handle payment completion
   */
  async handlePaymentCompletion(payment) {
    try {
      // Trigger post-payment actions based on payment metadata
      const { productId, inftId, soulId } = payment.metadata;

      if (productId === 'gasless_staking') {
        // Handle gasless staking payment completion
        await this.handleGaslessStakingPayment(payment);
      } else if (inftId) {
        // Handle iNFT related payment
        await this.handleINFTMintingPayment(payment, inftId);
      } else if (soulId) {
        // Handle soul-related payment
        await this.handleSoulEvolutionPayment(payment, soulId);
      }

      console.log(`Payment completion handled for payment ${payment.paymentId}`);
    } catch (error) {
      console.error('Payment completion handling error:', error);
      // Don't throw - payment is still completed
    }
  }

  /**
   * Handle gasless staking payment
   */
  async handleGaslessStakingPayment(payment) {
    // This would integrate with the gasless staking API
    // For now, just log the completion
    console.log(`Gasless staking payment completed: ${payment.amount} PI`);
  }

  /**
   * Handle iNFT minting payment
   */
  async handleINFTMintingPayment(payment, inftId) {
    // Update iNFT status or trigger minting process
    console.log(`iNFT minting payment completed for iNFT ${inftId}: ${payment.amount} PI`);
  }

  /**
   * Handle soul evolution payment
   */
  async handleSoulEvolutionPayment(payment, soulId) {
    // Update soul status or trigger evolution process
    console.log(`Soul evolution payment completed for soul ${soulId}: ${payment.amount} PI`);
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId, reason = 'User cancelled') {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (payment.status !== 'pending') {
        throw new ApiError(`Cannot cancel payment with status: ${payment.status}`, 400);
      }

      await this.updatePaymentStatus(paymentId, 'cancelled');

      // Cancel Pi payment if it exists
      if (payment.piPayment?.id) {
        await this.cancelPiPayment(payment.piPayment.id);
      }

      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Payment cancellation error:', error);
      throw error;
    }
  }

  /**
   * Cancel Pi Network payment
   */
  async cancelPiPayment(piPaymentId) {
    try {
      // In production, this would call Pi Network API to cancel
      console.log(`Pi payment cancelled: ${piPaymentId}`);
    } catch (error) {
      console.error('Pi payment cancellation error:', error);
    }
  }

  /**
   * Clean expired payments
   */
  async cleanExpiredPayments() {
    const payments = dbManager.getCollection('payments');

    const result = await payments.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: {
          status: 'expired',
          updatedAt: new Date()
        }
      }
    );

    console.log(`Cleaned ${result.modifiedCount} expired payments`);
    return result.modifiedCount;
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    const payments = dbManager.getCollection('payments');

    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalVolume
    ] = await Promise.all([
      payments.countDocuments(),
      payments.countDocuments({ status: 'completed' }),
      payments.countDocuments({ status: 'pending' }),
      payments.countDocuments({ status: 'failed' }),
      payments.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).next()
    ]);

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalVolume: totalVolume?.total || 0,
      successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount, currency = 'PI') {
    const limits = {
      PI: { min: 0.01, max: 10000 },
      USD: { min: 0.01, max: 1000 }
    };

    const limit = limits[currency];
    if (!limit) {
      throw new ApiError(`Unsupported currency: ${currency}`, 400);
    }

    if (amount < limit.min || amount > limit.max) {
      throw new ApiError(
        `Amount must be between ${limit.min} and ${limit.max} ${currency}`,
        400
      );
    }

    return true;
  }
}

module.exports = {
  PaymentService,
  paymentService: new PaymentService()
};