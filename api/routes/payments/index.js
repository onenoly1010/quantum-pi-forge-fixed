/**
 * Payments Routes
 * Handles Pi Network payment processing
 */

const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { auditLogger, businessLogger } = require('../middleware/logger');
const { ApiError } = require('../shared/errors');

// Import payment service
const paymentService = require('../services/payments');

/**
 * POST /api/payments/create
 * Create payment request for Pi Network
 */
router.post('/create',
  validate('createPayment'),
  auditLogger('payment_create'),
  businessLogger('payment_initiated'),
  async (req, res, next) => {
    try {
      const { amount, currency, description, metadata } = req.body;
      const user = req.user;

      // Verify user has Pi access
      if (!user.piUser) {
        throw new ApiError('Pi Network access required for payments', 403);
      }

      const paymentRequest = await paymentService.createPayment({
        amount,
        currency,
        description,
        metadata: {
          ...metadata,
          userId: user.id,
          soulId: user.soul?.id,
          requestId: req.requestId
        },
        userId: user.id
      });

      res.json({
        success: true,
        payment: {
          id: paymentRequest.id,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          description: paymentRequest.description,
          status: paymentRequest.status,
          expiresAt: paymentRequest.expiresAt,
          metadata: paymentRequest.metadata
        },
        paymentUrl: paymentRequest.paymentUrl,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/payments/verify
 * Verify payment completion from Pi Network
 */
router.post('/verify',
  auditLogger('payment_verify'),
  businessLogger('payment_verified'),
  async (req, res, next) => {
    try {
      const { paymentId, txHash } = req.body;
      const user = req.user;

      const verification = await paymentService.verifyPayment(paymentId, txHash, user.id);

      res.json({
        success: true,
        payment: {
          id: verification.payment.id,
          amount: verification.payment.amount,
          currency: verification.payment.currency,
          status: verification.payment.status,
          verifiedAt: verification.payment.verifiedAt,
          txHash: verification.payment.txHash
        },
        verified: verification.verified,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/payments/:paymentId
 * Get payment status
 */
router.get('/:paymentId', async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const user = req.user;

    const payment = await paymentService.getPayment(paymentId);

    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }

    // Check ownership
    if (payment.userId !== user.id && !user.permissions?.isAdmin) {
      throw new ApiError('Unauthorized to access this payment', 403);
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        status: payment.status,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
        verifiedAt: payment.verifiedAt,
        txHash: payment.txHash,
        metadata: payment.metadata
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments
 * Get user's payment history
 */
router.get('/', async (req, res, next) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20, status } = req.query;

    const payments = await paymentService.getUserPayments(user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json({
      success: true,
      payments: payments.items.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        status: payment.status,
        createdAt: payment.createdAt,
        verifiedAt: payment.verifiedAt,
        txHash: payment.txHash ? payment.txHash.substring(0, 10) + '...' : null
      })),
      pagination: {
        page: payments.page,
        limit: payments.limit,
        total: payments.total,
        pages: Math.ceil(payments.total / payments.limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/webhook
 * Pi Network payment webhook (no auth required)
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const webhookData = req.body;

    // Verify webhook signature (Pi Network specific)
    const isValid = await paymentService.verifyWebhookSignature(webhookData);

    if (!isValid) {
      throw new ApiError('Invalid webhook signature', 401);
    }

    const result = await paymentService.processWebhook(webhookData);

    res.json({
      success: true,
      processed: true,
      paymentId: result.paymentId,
      status: result.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/cancel/:paymentId
 * Cancel pending payment
 */
router.post('/cancel/:paymentId',
  auditLogger('payment_cancel'),
  async (req, res, next) => {
    try {
      const { paymentId } = req.params;
      const user = req.user;

      const result = await paymentService.cancelPayment(paymentId, user.id);

      res.json({
        success: true,
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          cancelledAt: result.payment.cancelledAt
        },
        cancelled: true,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
    next(error);
    }
  }
);

/**
 * GET /api/payments/stats
 * Get payment statistics (admin only)
 */
router.get('/stats/admin', async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.permissions?.isAdmin) {
      throw new ApiError('Admin access required', 403);
    }

    const stats = await paymentService.getPaymentStats();

    res.json({
      success: true,
      stats: {
        totalPayments: stats.totalPayments,
        totalVolume: stats.totalVolume,
        successRate: stats.successRate,
        averagePayment: stats.averagePayment,
        paymentsByStatus: stats.paymentsByStatus,
        recentPayments: stats.recentPayments
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
);

module.exports = router;