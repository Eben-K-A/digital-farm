import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  getCartDetails,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  validateCart,
} from '../services/cartService.js';

const router = express.Router();

/**
 * GET /api/v1/cart
 * Get cart details
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const cart = await getCartDetails(req.user.user_id);
  
  res.json({
    success: true,
    data: cart,
  });
}));

/**
 * POST /api/v1/cart/items
 * Add item to cart
 */
router.post('/items', authenticate, asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  
  if (!product_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'product_id is required',
      },
    });
  }
  
  if (quantity < 1 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be a positive integer',
      },
    });
  }
  
  try {
    const item = await addToCart(req.user.user_id, product_id, parseInt(quantity));
    const cart = await getCartDetails(req.user.user_id);
    
    res.status(201).json({
      success: true,
      data: {
        item,
        cart,
      },
      message: 'Item added to cart',
    });
  } catch (error) {
    if (error.message.includes('Product not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
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
 * PUT /api/v1/cart/items/:id
 * Update cart item quantity
 */
router.put('/items/:id', authenticate, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'quantity is required',
      },
    });
  }
  
  if (quantity < 1 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be a positive integer',
      },
    });
  }
  
  try {
    const item = await updateCartItem(req.user.user_id, req.params.id, quantity);
    const cart = await getCartDetails(req.user.user_id);
    
    res.json({
      success: true,
      data: {
        item,
        cart,
      },
      message: 'Cart item updated',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
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
 * DELETE /api/v1/cart/items/:id
 * Remove item from cart
 */
router.delete('/items/:id', authenticate, asyncHandler(async (req, res) => {
  try {
    await removeFromCart(req.user.user_id, req.params.id);
    const cart = await getCartDetails(req.user.user_id);
    
    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * DELETE /api/v1/cart
 * Clear entire cart
 */
router.delete('/', authenticate, asyncHandler(async (req, res) => {
  await clearCart(req.user.user_id);
  
  res.json({
    success: true,
    message: 'Cart cleared',
  });
}));

/**
 * GET /api/v1/cart/count
 * Get cart item count
 */
router.get('/count', authenticate, asyncHandler(async (req, res) => {
  const count = await getCartItemCount(req.user.user_id);
  
  res.json({
    success: true,
    data: {
      count,
    },
  });
}));

/**
 * POST /api/v1/cart/validate
 * Validate cart items
 */
router.post('/validate', authenticate, asyncHandler(async (req, res) => {
  const validation = await validateCart(req.user.user_id);
  
  res.json({
    success: true,
    data: validation,
  });
}));

export default router;
