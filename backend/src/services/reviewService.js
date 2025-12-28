import pool from '../config/database.js';

/**
 * Get seller (farmer) rating
 */
export async function getSellerRating(farmerId) {
  const result = await pool.query(
    `SELECT 
      AVG(rating) as average_rating,
      COUNT(*) as total_reviews,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
    FROM seller_ratings
    WHERE farmer_id = $1`,
    [farmerId]
  );

  return result.rows[0] || {
    average_rating: null,
    total_reviews: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
  };
}

/**
 * Add seller review/rating
 */
export async function addSellerReview(farmerId, buyerId, rating, comment) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert or update review
    const result = await client.query(
      `INSERT INTO seller_ratings (farmer_id, buyer_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (farmer_id, buyer_id)
      DO UPDATE SET rating = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [farmerId, buyerId, rating, comment]
    );

    // Update farmer rating
    const ratingResult = await client.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM seller_ratings WHERE farmer_id = $1`,
      [farmerId]
    );

    const { avg_rating, count } = ratingResult.rows[0];

    await client.query(
      `UPDATE farmers SET rating = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [avg_rating, farmerId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get seller reviews
 */
export async function getSellerReviews(farmerId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
      sr.*,
      u.first_name,
      u.last_name,
      u.profile_picture_url
    FROM seller_ratings sr
    JOIN users u ON sr.buyer_id = u.id
    WHERE sr.farmer_id = $1
    ORDER BY sr.created_at DESC
    LIMIT $2 OFFSET $3`,
    [farmerId, limit, offset]
  );

  return result.rows;
}

/**
 * Count seller reviews
 */
export async function countSellerReviews(farmerId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM seller_ratings WHERE farmer_id = $1',
    [farmerId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Check if buyer can review seller
 */
export async function canReviewSeller(farmerId, buyerId) {
  // Check if buyer has purchased from farmer
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE oi.farmer_id = $1 AND o.buyer_id = $2 AND o.status = 'delivered'`,
    [farmerId, buyerId]
  );

  return parseInt(result.rows[0].count) > 0;
}

/**
 * Get helpful reviews (most helpful first)
 */
export async function getHelpfulSellerReviews(farmerId, limit = 5) {
  const result = await pool.query(
    `SELECT 
      sr.*,
      u.first_name,
      u.last_name,
      u.profile_picture_url
    FROM seller_ratings sr
    JOIN users u ON sr.buyer_id = u.id
    WHERE sr.farmer_id = $1 AND sr.comment IS NOT NULL
    ORDER BY sr.helpful_count DESC NULLS LAST, sr.created_at DESC
    LIMIT $2`,
    [farmerId, limit]
  );

  return result.rows;
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId) {
  const result = await pool.query(
    `UPDATE seller_ratings 
    SET helpful_count = COALESCE(helpful_count, 0) + 1
    WHERE id = $1
    RETURNING *`,
    [reviewId]
  );

  if (result.rows.length === 0) {
    throw new Error('Review not found');
  }

  return result.rows[0];
}

/**
 * Get buyer review summary
 */
export async function getBuyerReviewSummary(buyerId) {
  const result = await pool.query(
    `SELECT 
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating
    FROM seller_ratings
    WHERE buyer_id = $1`,
    [buyerId]
  );

  return result.rows[0] || {
    total_reviews: 0,
    average_rating: null,
  };
}

/**
 * Get reviews for verification
 */
export async function getReviewsNeedingApproval(page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
      sr.*,
      u.first_name,
      u.last_name,
      f.farm_name
    FROM seller_ratings sr
    JOIN users u ON sr.buyer_id = u.id
    JOIN farmers f ON sr.farmer_id = f.id
    ORDER BY sr.created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

/**
 * Get farmer review statistics
 */
export async function getFarmerReviewStats(farmerId) {
  const result = await pool.query(
    `SELECT 
      COUNT(*) as total_reviews,
      ROUND(AVG(rating)::numeric, 2) as average_rating,
      MAX(rating) as highest_rating,
      MIN(rating) as lowest_rating,
      COUNT(DISTINCT buyer_id) as unique_reviewers,
      COUNT(CASE WHEN comment IS NOT NULL THEN 1 END) as reviews_with_comments
    FROM seller_ratings
    WHERE farmer_id = $1`,
    [farmerId]
  );

  return result.rows[0] || {
    total_reviews: 0,
    average_rating: null,
    highest_rating: null,
    lowest_rating: null,
    unique_reviewers: 0,
    reviews_with_comments: 0,
  };
}

/**
 * Get recent reviews for dashboard
 */
export async function getRecentReviews(limit = 10) {
  const result = await pool.query(
    `SELECT 
      sr.*,
      u.first_name as buyer_first_name,
      u.last_name as buyer_last_name,
      f.farm_name
    FROM seller_ratings sr
    JOIN users u ON sr.buyer_id = u.id
    JOIN farmers f ON sr.farmer_id = f.id
    ORDER BY sr.created_at DESC
    LIMIT $1`,
    [limit]
  );

  return result.rows;
}

/**
 * Get product rating trend
 */
export async function getProductRatingTrend(productId, days = 30) {
  const result = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as review_count,
      AVG(rating) as avg_rating
    FROM product_reviews
    WHERE product_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC`,
    [productId]
  );

  return result.rows;
}

/**
 * Get seller rating trend
 */
export async function getSellerRatingTrend(farmerId, days = 30) {
  const result = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as review_count,
      AVG(rating) as avg_rating
    FROM seller_ratings
    WHERE farmer_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC`,
    [farmerId]
  );

  return result.rows;
}
