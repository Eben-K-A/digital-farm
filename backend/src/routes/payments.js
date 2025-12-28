import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createPaymentTransaction,
  getPaymentTransaction,
  updatePaymentStatus,
  getOrderPayments,
  getUserPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  initiateMobileMoneyPayment,
  processPaymentCallback,
  getPaymentAnalytics,
  getUserPaymentSummary,
} from '../services/paymentService.js';

const router = express.Router();

/**
 * POST /api/v1/payments/initiate
 * Initiate payment for order
 */
router.post('/initiate', authenticate, asyncHandler(async (req, res) => {
  const { order_id, payment_method, phone_number, customer_name } = req.body;

  if (!order_id || !payment_method || !phone_number) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'order_id, payment_method, and phone_number are required',
      },
    });
  }

  // Get order to get amount
  const { default: pool } = await import('../config/database.js');
  const orderResult = await pool.query(
    'SELECT total_amount FROM orders WHERE id = $1 AND buyer_id = $2',
    [order_id, req.user.user_id]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      },
    });
  }

  const transaction = await createPaymentTransaction({
    order_id,
    user_id: req.user.user_id,
    amount: orderResult.rows[0].total_amount,
    payment_method,
    customer_phone: phone_number,
    customer_name: customer_name || '',
  });

  const paymentInitiation = await initiateMobileMoneyPayment(transaction.id, payment_method);

  res.json({
    success: true,
    data: {
      transaction,
      payment: paymentInitiation,
    },
    message: 'Payment initiated. Please complete the payment on your phone.',
  });
}));

/**
 * GET /api/v1/payments/:id
 * Get payment transaction details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const transaction = await getPaymentTransaction(req.params.id);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * GET /api/v1/payments/order/:orderId
 * Get payments for order
 */
router.get('/order/:orderId', asyncHandler(async (req, res) => {
  const payments = await getOrderPayments(req.params.orderId);

  res.json({
    success: true,
    data: payments,
    count: payments.length,
  });
}));

/**
 * POST /api/v1/payments/callback
 * Payment gateway callback (webhook)
 */
router.post('/callback', asyncHandler(async (req, res) => {
  const { transaction_id, status, provider_reference } = req.body;

  if (!transaction_id || !status) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'transaction_id and status are required',
      },
    });
  }

  try {
    await processPaymentCallback(transaction_id, status, provider_reference);

    res.json({
      success: true,
      message: 'Payment callback processed',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'CALLBACK_PROCESSING_ERROR',
        message: error.message,
      },
    });
  }
}));

/**
 * GET /api/v1/payments/methods
 * Get user payment methods
 */
router.get('/methods', authenticate, asyncHandler(async (req, res) => {
  const methods = await getUserPaymentMethods(req.user.user_id);

  res.json({
    success: true,
    data: methods,
    count: methods.length,
  });
}));

/**
 * POST /api/v1/payments/methods
 * Add payment method
 */
router.post('/methods', authenticate, asyncHandler(async (req, res) => {
  const { payment_type, phone_number, account_name, is_default } = req.body;

  if (!payment_type || !phone_number || !account_name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'payment_type, phone_number, and account_name are required',
      },
    });
  }

  const method = await addPaymentMethod(req.user.user_id, {
    payment_type,
    phone_number,
    account_name,
    is_default,
  });

  res.status(201).json({
    success: true,
    data: method,
    message: 'Payment method added successfully',
  });
}));

/**
 * PUT /api/v1/payments/methods/:id
 * Update payment method
 */
router.put('/methods/:id', authenticate, asyncHandler(async (req, res) => {
  try {
    const method = await updatePaymentMethod(req.params.id, req.user.user_id, req.body);

    res.json({
      success: true,
      data: method,
      message: 'Payment method updated successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'METHOD_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * DELETE /api/v1/payments/methods/:id
 * Delete payment method
 */
router.delete('/methods/:id', authenticate, asyncHandler(async (req, res) => {
  try {
    await deletePaymentMethod(req.params.id, req.user.user_id);

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'METHOD_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * GET /api/v1/payments/summary
 * Get payment summary for user
 */
router.get('/summary', authenticate, asyncHandler(async (req, res) => {
  const summary = await getUserPaymentSummary(req.user.user_id);

  res.json({
    success: true,
    data: summary,
  });
}));

/**
 * Admin: GET /api/v1/payments/analytics
 * Get payment analytics
 */
router.get('/analytics', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const analytics = await getPaymentAnalytics(parseInt(days));

  res.json({
    success: true,
    data: analytics,
  });
}));

export default router;
