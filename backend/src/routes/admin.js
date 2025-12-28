import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getTopFarmers,
  getPendingVerifications,
  getPendingVerificationsCount,
  approveFarmerVerification,
  rejectFarmerVerification,
  getAuditLogs,
  countAuditLogs,
  logAuditAction,
  getUserStats,
  getSystemHealth,
  getProductAnalytics,
} from '../services/adminService.js';

const router = express.Router();

/**
 * GET /api/v1/admin/dashboard
 * Get dashboard overview
 */
router.get('/dashboard', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { range = 30 } = req.query;
  
  const stats = await getDashboardStats(parseInt(range));
  const health = await getSystemHealth();

  res.json({
    success: true,
    data: {
      stats,
      health,
    },
  });
}));

/**
 * GET /api/v1/admin/revenue
 * Get revenue analytics
 */
router.get('/revenue', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const analytics = await getRevenueAnalytics(parseInt(days));

  res.json({
    success: true,
    data: analytics,
  });
}));

/**
 * GET /api/v1/admin/top-farmers
 * Get top farmers
 */
router.get('/top-farmers', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const farmers = await getTopFarmers(parseInt(limit));

  res.json({
    success: true,
    data: farmers,
    count: farmers.length,
  });
}));

/**
 * GET /api/v1/admin/verifications/pending
 * Get pending verifications
 */
router.get('/verifications/pending', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const verifications = await getPendingVerifications(parseInt(limit), offset);
  const total = await getPendingVerificationsCount();

  res.json({
    success: true,
    data: verifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * POST /api/v1/admin/verifications/:id/approve
 * Approve farmer verification
 */
router.post('/verifications/:id/approve', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { notes = '' } = req.body;

  const verification = await approveFarmerVerification(req.params.id, req.user.user_id, notes);

  // Log action
  await logAuditAction(
    req.user.user_id,
    'APPROVE_VERIFICATION',
    'farmer_verification',
    req.params.id,
    { status: 'pending' },
    { status: 'approved' }
  );

  res.json({
    success: true,
    data: verification,
    message: 'Farmer verification approved',
  });
}));

/**
 * POST /api/v1/admin/verifications/:id/reject
 * Reject farmer verification
 */
router.post('/verifications/:id/reject', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'reason is required',
      },
    });
  }

  const verification = await rejectFarmerVerification(req.params.id, req.user.user_id, reason);

  // Log action
  await logAuditAction(
    req.user.user_id,
    'REJECT_VERIFICATION',
    'farmer_verification',
    req.params.id,
    { status: 'pending' },
    { status: 'rejected', reason }
  );

  res.json({
    success: true,
    data: verification,
    message: 'Farmer verification rejected',
  });
}));

/**
 * GET /api/v1/admin/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { user_id, action, resource_type, startDate, endDate, page = 1, limit = 50 } = req.query;

  const logs = await getAuditLogs(
    { user_id, action, resource_type, startDate, endDate },
    parseInt(page),
    parseInt(limit)
  );

  const total = await countAuditLogs({ user_id, action, resource_type, startDate, endDate });

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/admin/users
 * Get user statistics
 */
router.get('/users', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const userStats = await getUserStats();

  res.json({
    success: true,
    data: userStats,
  });
}));

/**
 * GET /api/v1/admin/products
 * Get product analytics
 */
router.get('/products', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const analytics = await getProductAnalytics();

  res.json({
    success: true,
    data: analytics,
  });
}));

/**
 * GET /api/v1/admin/health
 * Get system health
 */
router.get('/health', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const health = await getSystemHealth();

  res.json({
    success: true,
    data: health,
  });
}));

/**
 * POST /api/v1/admin/seed-products
 * Seed sample products for testing (development only)
 */
router.post('/seed-products', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const pool = req.app.locals.pool || (await import('../config/database.js')).default;

  try {
    // Get farmer ID for product creation
    const farmerResult = await pool.query('SELECT id FROM users WHERE email = $1', ['farmer@test.com']);

    if (farmerResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FARMER_NOT_FOUND',
          message: 'No farmer@test.com account found. Please create it first.',
        },
      });
    }

    const farmerId = farmerResult.rows[0].id;

    // Sample products
    const products = [
      // Vegetables
      {
        categorySlug: 'vegetables',
        name: 'Fresh Tomatoes',
        description: 'Ripe, juicy tomatoes picked fresh from the farm',
        price: 8.50,
        unit: 'kg',
        quantity: 100,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'vegetables',
        name: 'Organic Lettuce',
        description: 'Crisp, organic lettuce grown without pesticides',
        price: 5.00,
        unit: 'bundle',
        quantity: 50,
        image: 'https://images.unsplash.com/photo-1559181286-d3fee14d55cc?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'vegetables',
        name: 'Bell Peppers (Mixed)',
        description: 'Colorful bell peppers - red, yellow, and green',
        price: 12.00,
        unit: 'kg',
        quantity: 75,
        image: 'https://images.unsplash.com/photo-1599599810694-b5ac9b1b6fca?w=500&h=500&fit=crop',
      },
      // Fruits
      {
        categorySlug: 'fruits',
        name: 'Organic Bananas',
        description: 'Sweet and nutritious bananas, freshly harvested',
        price: 4.50,
        unit: 'bunch',
        quantity: 80,
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'fruits',
        name: 'Mangoes (Alphonso)',
        description: 'Premium Alphonso mangoes - sweet and creamy',
        price: 15.00,
        unit: 'kg',
        quantity: 40,
        image: 'https://images.unsplash.com/photo-1585518419759-20f5e3baa4b6?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'fruits',
        name: 'Fresh Pineapples',
        description: 'Tropical pineapples, ripe and ready to eat',
        price: 6.00,
        unit: 'each',
        quantity: 35,
        image: 'https://images.unsplash.com/photo-1599599810694-b5ac9b1b6fca?w=500&h=500&fit=crop',
      },
      // Grains
      {
        categorySlug: 'grains',
        name: 'Maize (Corn)',
        description: 'Premium grade maize suitable for various uses',
        price: 3.50,
        unit: 'kg',
        quantity: 200,
        image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'grains',
        name: 'Brown Rice',
        description: 'Nutritious brown rice with a nutty flavor',
        price: 7.00,
        unit: 'kg',
        quantity: 120,
        image: 'https://images.unsplash.com/photo-1596040299218-5e8f3ce0b069?w=500&h=500&fit=crop',
      },
      // Dairy
      {
        categorySlug: 'dairy',
        name: 'Fresh Milk (1L)',
        description: 'Pure, fresh dairy milk from local farms',
        price: 2.50,
        unit: 'bottle',
        quantity: 150,
        image: 'https://images.unsplash.com/photo-1553531088-df340cf313ce?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'dairy',
        name: 'Farm Fresh Eggs (Dozen)',
        description: 'Free-range eggs from happy hens',
        price: 3.50,
        unit: 'dozen',
        quantity: 100,
        image: 'https://images.unsplash.com/photo-1585966975990-7003a3699a17?w=500&h=500&fit=crop',
      },
      // Meat & Poultry
      {
        categorySlug: 'meat-poultry',
        name: 'Fresh Chicken Breast',
        description: 'Lean, fresh chicken breast - premium quality',
        price: 14.00,
        unit: 'kg',
        quantity: 60,
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop',
      },
      {
        categorySlug: 'meat-poultry',
        name: 'Free-range Eggs (30ct)',
        description: 'Large free-range eggs, hormone-free',
        price: 8.50,
        unit: 'carton',
        quantity: 50,
        image: 'https://images.unsplash.com/photo-1508737267454-77a47e855e0d?w=500&h=500&fit=crop',
      },
    ];

    let createdCount = 0;
    const errors = [];

    for (const product of products) {
      try {
        // Check if product already exists
        const existingProduct = await pool.query(
          'SELECT id FROM products WHERE farmer_id = $1 AND name = $2',
          [farmerId, product.name]
        );

        if (existingProduct.rows.length > 0) {
          continue; // Skip if already exists
        }

        // Get category ID by slug
        const categoryResult = await pool.query(
          'SELECT id FROM product_categories WHERE slug = $1',
          [product.categorySlug]
        );

        if (categoryResult.rows.length === 0) {
          errors.push(`Category not found: ${product.categorySlug}`);
          continue;
        }

        const categoryId = categoryResult.rows[0].id;
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

        await pool.query(
          `INSERT INTO products (farmer_id, category_id, name, slug, description, long_description, price, unit, quantity_available, main_image_url, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            farmerId,
            categoryId,
            product.name,
            slug,
            product.description,
            product.description,
            product.price,
            product.unit,
            product.quantity,
            product.image,
            true,
          ]
        );

        createdCount++;
      } catch (error) {
        errors.push(`Error creating "${product.name}": ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        created: createdCount,
        skipped: products.length - createdCount - errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Successfully seeded ${createdCount} products`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SEEDING_ERROR',
        message: error.message,
      },
    });
  }
}));

/**
 * POST /api/v1/admin/clear-data
 * Clear all system data (admin only, requires password)
 */
router.post('/clear-data', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PASSWORD',
        message: 'Password is required',
      },
    });
  }

  const { default: pool } = await import('../config/database.js');
  const bcrypt = await import('bcryptjs');

  try {
    // Verify admin password
    const adminResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.user_id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin user not found',
        },
      });
    }

    const isPasswordValid = await bcrypt.default.compare(password, adminResult.rows[0].password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Invalid password',
        },
      });
    }

    // Get current admin ID
    const adminId = req.user.user_id;

    // Clear data in order of dependencies (foreign keys first)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete in order of dependencies (only from tables that exist)
      const tables = [
        'order_items',
        'orders',
        'cart_items',
        'shopping_carts',
        'products',
        'farmer_verifications',
        'farmers',
        'user_addresses',
        'otp_verifications',
        'order_tracking',
        'notifications',
      ];

      for (const table of tables) {
        try {
          await client.query(`DELETE FROM ${table}`);
        } catch (error) {
          // Skip tables that don't exist
          if (!error.message.includes('does not exist')) {
            throw error;
          }
        }
      }

      // Delete all users except current admin
      await client.query(
        'DELETE FROM users WHERE id != $1',
        [adminId]
      );

      await client.query('COMMIT');

      // Log the action
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          adminId,
          'CLEAR_ALL_DATA',
          'system',
          'all',
          JSON.stringify({ cleared_at: new Date().toISOString() }),
          req.ip || 'unknown',
        ]
      );

      res.json({
        success: true,
        data: {
          message: 'All system data cleared successfully',
          cleared_at: new Date().toISOString(),
          admin_preserved: true,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CLEAR_DATA_ERROR',
        message: error.message,
      },
    });
  }
}));

export default router;
