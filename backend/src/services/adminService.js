import pool from '../config/database.js';

/**
 * Get dashboard overview statistics
 */
export async function getDashboardStats(dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);

  const statsResult = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM farmers) as total_farmers,
      (SELECT COUNT(*) FROM users WHERE user_type = 'buyer') as total_buyers,
      (SELECT COUNT(*) FROM orders WHERE ordered_at >= $1) as orders_period,
      (SELECT SUM(total_amount) FROM orders WHERE ordered_at >= $1) as revenue_period,
      (SELECT AVG(total_amount) FROM orders WHERE ordered_at >= $1) as avg_order_value,
      (SELECT COUNT(*) FROM products) as total_products,
      (SELECT AVG(rating) FROM farmers WHERE rating > 0) as avg_farmer_rating
    `,
    [startDate]
  );

  return statsResult.rows[0];
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(days = 30) {
  const result = await pool.query(
    `SELECT 
      DATE(ordered_at) as date,
      COUNT(*) as orders,
      SUM(total_amount) as revenue,
      SUM(delivery_fee) as delivery_revenue
    FROM orders
    WHERE ordered_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(ordered_at)
    ORDER BY date DESC`,
  );

  return result.rows;
}

/**
 * Get top farmers by sales
 */
export async function getTopFarmers(limit = 10) {
  const result = await pool.query(
    `SELECT 
      f.id,
      f.farm_name,
      f.rating,
      f.total_sales,
      u.first_name,
      u.last_name,
      u.email,
      SUM(oi.subtotal) as total_revenue,
      COUNT(DISTINCT o.id) as total_orders
    FROM farmers f
    JOIN users u ON f.user_id = u.id
    LEFT JOIN order_items oi ON f.id = oi.farmer_id
    LEFT JOIN orders o ON oi.order_id = o.id
    GROUP BY f.id, f.farm_name, f.rating, f.total_sales, u.first_name, u.last_name, u.email
    ORDER BY total_revenue DESC NULLS LAST
    LIMIT $1`,
    [limit]
  );

  return result.rows;
}

/**
 * Get pending verifications
 */
export async function getPendingVerifications(limit = 50, offset = 0) {
  const result = await pool.query(
    `SELECT 
      fv.*,
      u.first_name,
      u.last_name,
      u.email
    FROM farmer_verifications fv
    JOIN users u ON fv.user_id = u.id
    WHERE fv.status = 'pending'
    ORDER BY fv.created_at ASC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

/**
 * Get pending verifications count
 */
export async function getPendingVerificationsCount() {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM farmer_verifications WHERE status = \'pending\''
  );

  return parseInt(result.rows[0].count);
}

/**
 * Approve farmer verification
 */
export async function approveFarmerVerification(verificationId, approverId, notes = '') {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update verification status
    const verResult = await client.query(
      `UPDATE farmer_verifications 
      SET status = 'approved', 
          level_2_status = 'approved',
          approved_at = CURRENT_TIMESTAMP,
          reviewed_by_admin_id = $1,
          admin_notes = $2
      WHERE id = $3
      RETURNING farmer_id, user_id`,
      [approverId, notes, verificationId]
    );

    if (verResult.rows.length === 0) {
      throw new Error('Verification not found');
    }

    const { farmer_id, user_id } = verResult.rows[0];

    // Update farmer to approved
    await client.query(
      `UPDATE farmers SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [farmer_id]
    );

    // Update user verification status
    await client.query(
      `UPDATE users SET is_verified = TRUE, verification_status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [user_id]
    );

    // Create approval record
    await client.query(
      `INSERT INTO admin_approvals (resource_type, resource_id, approver_id, status, reason)
      VALUES ('farmer_verification', $1, $2, 'approved', $3)`,
      [verificationId, approverId, notes]
    );

    await client.query('COMMIT');
    return verResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reject farmer verification
 */
export async function rejectFarmerVerification(verificationId, approverId, rejectionReason) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update verification status
    const verResult = await client.query(
      `UPDATE farmer_verifications 
      SET status = 'rejected', 
          level_2_status = 'rejected',
          rejected_at = CURRENT_TIMESTAMP,
          rejection_reason = $1,
          reviewed_by_admin_id = $2
      WHERE id = $3
      RETURNING farmer_id, user_id`,
      [rejectionReason, approverId, verificationId]
    );

    if (verResult.rows.length === 0) {
      throw new Error('Verification not found');
    }

    const { farmer_id, user_id } = verResult.rows[0];

    // Update user verification status
    await client.query(
      `UPDATE users SET verification_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [user_id]
    );

    // Create approval record
    await client.query(
      `INSERT INTO admin_approvals (resource_type, resource_id, approver_id, status, reason)
      VALUES ('farmer_verification', $1, $2, 'rejected', $3)`,
      [verificationId, approverId, rejectionReason]
    );

    await client.query('COMMIT');
    return verResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters = {}, page = 1, limit = 50) {
  const { user_id, action, resource_type, startDate, endDate } = filters;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (user_id) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(user_id);
    paramIndex++;
  }

  if (action) {
    query += ` AND action ILIKE $${paramIndex}`;
    params.push(`%${action}%`);
    paramIndex++;
  }

  if (resource_type) {
    query += ` AND resource_type = $${paramIndex}`;
    params.push(resource_type);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Count audit logs
 */
export async function countAuditLogs(filters = {}) {
  const { user_id, action, resource_type, startDate, endDate } = filters;

  let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (user_id) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(user_id);
    paramIndex++;
  }

  if (action) {
    query += ` AND action ILIKE $${paramIndex}`;
    params.push(`%${action}%`);
    paramIndex++;
  }

  if (resource_type) {
    query += ` AND resource_type = $${paramIndex}`;
    params.push(resource_type);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count);
}

/**
 * Log audit action
 */
export async function logAuditAction(userId, action, resourceType, resourceId, oldValues, newValues) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, action, resourceType, resourceId, JSON.stringify(oldValues), JSON.stringify(newValues)]
  );

  return true;
}

/**
 * Get user management stats
 */
export async function getUserStats() {
  const result = await pool.query(
    `SELECT 
      u.user_type,
      COUNT(*) as count,
      COUNT(CASE WHEN u.is_active THEN 1 END) as active,
      COUNT(CASE WHEN u.is_active = FALSE THEN 1 END) as inactive,
      COUNT(CASE WHEN u.is_verified THEN 1 END) as verified
    FROM users u
    GROUP BY u.user_type`
  );

  return result.rows;
}

/**
 * Get system health metrics
 */
export async function getSystemHealth() {
  const result = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
      (SELECT COUNT(*) FROM orders WHERE status = 'processing') as processing_orders,
      (SELECT COUNT(*) FROM farmer_verifications WHERE status = 'pending') as pending_verifications,
      (SELECT COUNT(*) FROM payment_transactions WHERE status = 'pending') as pending_payments,
      (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE) as unread_notifications`
  );

  return result.rows[0];
}

/**
 * Get product analytics
 */
export async function getProductAnalytics() {
  const result = await pool.query(
    `SELECT 
      c.name as category,
      COUNT(DISTINCT p.id) as total_products,
      COUNT(DISTINCT p.farmer_id) as farmer_count,
      AVG(p.rating) as avg_rating,
      SUM(p.total_sold) as total_sold
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.deleted_at IS NULL
    GROUP BY c.name
    ORDER BY total_sold DESC NULLS LAST`
  );

  return result.rows;
}
