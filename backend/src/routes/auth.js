import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { registerUser, loginUser, getUserById } from '../services/authService.js';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, phone_number, user_type } = req.body;

  // Validate required fields
  if (!email || !password || !first_name || !last_name || !user_type) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Email, password, first_name, last_name, and user_type are required',
      },
    });
  }

  // Default user_type to farmer
  const type = user_type || 'farmer';

  try {
    const user = await registerUser(email, password, first_name, last_name, phone_number, type);

    res.status(201).json({
      success: true,
      data: {
        user_id: user.id,
        email: user.email,
        user_type: user.user_type,
        verification_status: user.verification_status,
        message: type === 'farmer' 
          ? 'Account created. Proceed to farmer verification.' 
          : 'Account created successfully',
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already exists',
        },
      });
    }
    throw error;
  }
}));

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Email and password are required',
      },
    });
  }

  const result = await loginUser(email, password);

  res.json({
    success: true,
    data: {
      user: result.user,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      requires_verification: result.user.user_type === 'farmer' && result.user.verification_status !== 'approved',
    },
  });
}));

/**
 * GET /api/v1/auth/me
 * Get current user details
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.user_id);

  res.json({
    success: true,
    data: user,
  });
}));

export default router;
