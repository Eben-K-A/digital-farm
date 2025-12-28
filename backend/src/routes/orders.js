import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getUserOrdersCount,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  updateOrderTracking,
  getFarmerOrders,
} from '../services/orderService.js';

const router = express.Router();

/**
 * POST /api/v1/orders
 * Create new order
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { delivery_address_id, payment_method = 'mobile_money', special_instructions = '' } = req.body;
  
  if (!delivery_address_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'delivery_address_id is required',
      },
    });
  }
  
  try {
    const order = await createOrder(
      req.user.user_id,
      delivery_address_id,
      payment_method,
      special_instructions
    );
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully. Proceed to payment.',
    });
  } catch (error) {
    if (error.message.includes('Cart is empty')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CART',
          message: error.message,
        },
      });
    }
    if (error.message.includes('Invalid delivery address')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: error.message,
        },
      });
    }
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * GET /api/v1/orders
 * Get user's orders
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { status, payment_status, page = 1, limit = 20 } = req.query;
  
  const orders = await getUserOrders(req.user.user_id, {
    status,
    payment_status,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  
  const total = await getUserOrdersCount(req.user.user_id, { status, payment_status });
  
  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/orders/:id
 * Get order details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  try {
    const order = await getOrderById(req.params.id, req.user.user_id);
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * POST /api/v1/orders/:id/cancel
 * Cancel order
 */
router.post('/:id/cancel', authenticate, asyncHandler(async (req, res) => {
  const { reason = '' } = req.body;
  
  try {
    const order = await cancelOrder(req.params.id, req.user.user_id, reason);
    
    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: error.message,
        },
      });
    }
    if (error.message.includes('Can only cancel')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_STATUS',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * Admin: POST /api/v1/orders/:id/status
 * Update order status
 */
router.post('/:id/status', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'status is required',
      },
    });
  }
  
  try {
    const order = await updateOrderStatus(req.params.id, status, req.user.user_id);
    
    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * Admin: POST /api/v1/orders/:id/payment-status
 * Update payment status
 */
router.post('/:id/payment-status', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { payment_status } = req.body;
  
  if (!payment_status) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'payment_status is required',
      },
    });
  }
  
  try {
    const order = await updatePaymentStatus(req.params.id, payment_status);
    
    res.json({
      success: true,
      data: order,
      message: `Payment status updated to ${payment_status}`,
    });
  } catch (error) {
    if (error.message.includes('Invalid payment status')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYMENT_STATUS',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * POST /api/v1/orders/:id/tracking
 * Update order tracking
 */
router.post('/:id/tracking', authenticate, asyncHandler(async (req, res) => {
  const { current_location, estimated_delivery, delivery_partner_id } = req.body;
  
  try {
    const tracking = await updateOrderTracking(req.params.id, {
      current_location,
      estimated_delivery,
      delivery_partner_id,
    });
    
    res.json({
      success: true,
      data: tracking,
      message: 'Order tracking updated',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * GET /api/v1/orders/farmer/my-orders
 * Get farmer's orders (items they sold)
 */
router.get('/farmer/my-orders', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  // Get farmer ID
  const farmerResult = await import('../config/database.js').then(db => 
    db.default.query(
      'SELECT id FROM farmers WHERE user_id = $1',
      [req.user.user_id]
    )
  );
  
  if (farmerResult.rows.length === 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'NOT_A_FARMER',
        message: 'Only farmers can access this endpoint',
      },
    });
  }
  
  const farmerId = farmerResult.rows[0].id;
  
  const orders = await getFarmerOrders(farmerId, {
    status,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  
  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
  });
}));

export default router;
