import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  getDefaultAddress,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorited,
} from '../services/userService.js';

const router = express.Router();

/**
 * GET /api/v1/users/profile
 * Get current user profile
 */
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const profile = await getUserProfile(req.user.user_id);
  
  res.json({
    success: true,
    data: profile,
  });
}));

/**
 * PUT /api/v1/users/profile
 * Update current user profile
 */
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const updatedProfile = await updateUserProfile(req.user.user_id, req.body);
  
  res.json({
    success: true,
    data: updatedProfile,
    message: 'Profile updated successfully',
  });
}));

/**
 * GET /api/v1/users/addresses
 * Get all addresses for current user
 */
router.get('/addresses', authenticate, asyncHandler(async (req, res) => {
  const addresses = await getUserAddresses(req.user.user_id);
  
  res.json({
    success: true,
    data: addresses,
    count: addresses.length,
  });
}));

/**
 * POST /api/v1/users/addresses
 * Create new address for current user
 */
router.post('/addresses', authenticate, asyncHandler(async (req, res) => {
  const {
    address_type,
    street_address,
    city,
    region,
    postal_code,
    gps_address,
    recipient_name,
    recipient_phone,
    is_default,
  } = req.body;
  
  // Validate required fields
  if (!street_address || !city || !region || !recipient_name || !recipient_phone) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'street_address, city, region, recipient_name, and recipient_phone are required',
      },
    });
  }
  
  const address = await createAddress(req.user.user_id, {
    address_type,
    street_address,
    city,
    region,
    postal_code,
    gps_address,
    recipient_name,
    recipient_phone,
    is_default,
  });
  
  res.status(201).json({
    success: true,
    data: address,
    message: 'Address created successfully',
  });
}));

/**
 * GET /api/v1/users/addresses/:id
 * Get single address
 */
router.get('/addresses/:id', authenticate, asyncHandler(async (req, res) => {
  const address = await getAddressById(req.params.id, req.user.user_id);
  
  res.json({
    success: true,
    data: address,
  });
}));

/**
 * PUT /api/v1/users/addresses/:id
 * Update address
 */
router.put('/addresses/:id', authenticate, asyncHandler(async (req, res) => {
  const address = await updateAddress(req.params.id, req.user.user_id, req.body);
  
  res.json({
    success: true,
    data: address,
    message: 'Address updated successfully',
  });
}));

/**
 * DELETE /api/v1/users/addresses/:id
 * Delete address
 */
router.delete('/addresses/:id', authenticate, asyncHandler(async (req, res) => {
  await deleteAddress(req.params.id, req.user.user_id);
  
  res.json({
    success: true,
    message: 'Address deleted successfully',
  });
}));

/**
 * GET /api/v1/users/addresses/default
 * Get default address
 */
router.get('/addresses/default', authenticate, asyncHandler(async (req, res) => {
  const address = await getDefaultAddress(req.user.user_id);
  
  if (!address) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'No default address found',
      },
    });
  }
  
  res.json({
    success: true,
    data: address,
  });
}));

/**
 * POST /api/v1/users/favorites/:productId
 * Add product to favorites
 */
router.post('/favorites/:productId', authenticate, asyncHandler(async (req, res) => {
  const favorite = await addToFavorites(req.user.user_id, req.params.productId);
  
  res.status(201).json({
    success: true,
    data: favorite,
    message: 'Added to favorites',
  });
}));

/**
 * DELETE /api/v1/users/favorites/:productId
 * Remove from favorites
 */
router.delete('/favorites/:productId', authenticate, asyncHandler(async (req, res) => {
  await removeFromFavorites(req.user.user_id, req.params.productId);
  
  res.json({
    success: true,
    message: 'Removed from favorites',
  });
}));

/**
 * GET /api/v1/users/favorites
 * Get user favorites
 */
router.get('/favorites', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const favorites = await getUserFavorites(req.user.user_id, parseInt(limit), offset);
  
  res.json({
    success: true,
    data: favorites,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      count: favorites.length,
    },
  });
}));

/**
 * GET /api/v1/users/favorites/:productId/check
 * Check if product is favorited
 */
router.get('/favorites/:productId/check', authenticate, asyncHandler(async (req, res) => {
  const favorited = await isFavorited(req.user.user_id, req.params.productId);
  
  res.json({
    success: true,
    data: {
      product_id: req.params.productId,
      is_favorited: favorited,
    },
  });
}));

export default router;
