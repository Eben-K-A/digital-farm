import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getSellerRating,
  addSellerReview,
  getSellerReviews,
  countSellerReviews,
  canReviewSeller,
  getHelpfulSellerReviews,
  markReviewHelpful,
  getBuyerReviewSummary,
  getFarmerReviewStats,
  getRecentReviews,
  getSellerRatingTrend,
} from '../services/reviewService.js';

const router = express.Router();

/**
 * GET /api/v1/reviews/sellers/:farmerId
 * Get seller rating
 */
router.get('/sellers/:farmerId', asyncHandler(async (req, res) => {
  const rating = await getSellerRating(req.params.farmerId);

  res.json({
    success: true,
    data: rating,
  });
}));

/**
 * POST /api/v1/reviews/sellers/:farmerId
 * Add seller review
 */
router.post('/sellers/:farmerId', authenticate, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'rating is required',
      },
    });
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_RATING',
        message: 'Rating must be an integer between 1 and 5',
      },
    });
  }

  // Check if buyer can review this seller
  const canReview = await canReviewSeller(req.params.farmerId, req.user.user_id);

  if (!canReview) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CANNOT_REVIEW',
        message: 'You must have completed a purchase from this seller to leave a review',
      },
    });
  }

  const review = await addSellerReview(
    req.params.farmerId,
    req.user.user_id,
    parseInt(rating),
    comment || null
  );

  res.status(201).json({
    success: true,
    data: review,
    message: 'Review submitted successfully',
  });
}));

/**
 * GET /api/v1/reviews/sellers/:farmerId/list
 * Get seller reviews
 */
router.get('/sellers/:farmerId/list', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await getSellerReviews(req.params.farmerId, parseInt(page), parseInt(limit));
  const total = await countSellerReviews(req.params.farmerId);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/reviews/sellers/:farmerId/helpful
 * Get helpful reviews
 */
router.get('/sellers/:farmerId/helpful', asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const reviews = await getHelpfulSellerReviews(req.params.farmerId, parseInt(limit));

  res.json({
    success: true,
    data: reviews,
    count: reviews.length,
  });
}));

/**
 * POST /api/v1/reviews/:id/helpful
 * Mark review as helpful
 */
router.post('/:id/helpful', asyncHandler(async (req, res) => {
  try {
    const review = await markReviewHelpful(req.params.id);

    res.json({
      success: true,
      data: review,
      message: 'Review marked as helpful',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * GET /api/v1/reviews/buyer/summary
 * Get buyer review summary
 */
router.get('/buyer/summary', authenticate, asyncHandler(async (req, res) => {
  const summary = await getBuyerReviewSummary(req.user.user_id);

  res.json({
    success: true,
    data: summary,
  });
}));

/**
 * GET /api/v1/reviews/farmer/stats
 * Get farmer review statistics
 */
router.get('/farmer/stats', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { default: pool } = await import('../config/database.js');
  
  const farmerResult = await pool.query(
    'SELECT id FROM farmers WHERE user_id = $1',
    [req.user.user_id]
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

  const stats = await getFarmerReviewStats(farmerResult.rows[0].id);

  res.json({
    success: true,
    data: stats,
  });
}));

/**
 * GET /api/v1/reviews/farmer/trend
 * Get farmer rating trend
 */
router.get('/farmer/trend', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const { default: pool } = await import('../config/database.js');
  
  const farmerResult = await pool.query(
    'SELECT id FROM farmers WHERE user_id = $1',
    [req.user.user_id]
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

  const { getSellerRatingTrend } = await import('../services/reviewService.js');
  const trend = await getSellerRatingTrend(farmerResult.rows[0].id, parseInt(days));

  res.json({
    success: true,
    data: trend,
  });
}));

/**
 * Admin: GET /api/v1/reviews/recent
 * Get recent reviews
 */
router.get('/recent', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const reviews = await getRecentReviews(parseInt(limit));

  res.json({
    success: true,
    data: reviews,
    count: reviews.length,
  });
}));

export default router;
