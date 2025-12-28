import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getCategories,
  getCategoryById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
  getProductById,
  searchProducts,
  getProductsCount,
  getFeaturedProducts,
  addProductReview,
  getProductReviews,
} from '../services/productService.js';

const router = express.Router();

/**
 * GET /api/v1/products/categories
 * Get all product categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await getCategories();
  
  res.json({
    success: true,
    data: categories,
  });
}));

/**
 * GET /api/v1/products/categories/:id
 * Get single category
 */
router.get('/categories/:id', asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);
  
  res.json({
    success: true,
    data: category,
  });
}));

/**
 * GET /api/v1/products/featured
 * Get featured products
 */
router.get('/featured', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await getFeaturedProducts(limit);
  
  res.json({
    success: true,
    data: products,
    count: products.length,
  });
}));

/**
 * GET /api/v1/products/search
 * Search and filter products
 */
router.get('/search', asyncHandler(async (req, res) => {
  const {
    search = '',
    category_id,
    farmer_id,
    region,
    min_price,
    max_price,
    sort_by = 'created_at',
    sort_order = 'DESC',
    page = 1,
    limit = 20,
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const products = await searchProducts({
    search,
    category_id,
    farmer_id,
    region,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    sort_by,
    sort_order,
    limit: parseInt(limit),
    offset,
  });
  
  const total = await getProductsCount({
    search,
    category_id,
    farmer_id,
    region,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
  });
  
  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/products/:id
 * Get single product
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  const reviews = await getProductReviews(req.params.id, 5);
  
  res.json({
    success: true,
    data: {
      ...product,
      recent_reviews: reviews,
    },
  });
}));

/**
 * POST /api/v1/products
 * Create new product (farmer only)
 */
router.post('/', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { category_id, name, description, long_description, price, unit, quantity_available, main_image_url, image_urls } = req.body;
  
  // Get farmer ID for this user
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
        message: 'Only verified farmers can create products',
      },
    });
  }
  
  const farmerId = farmerResult.rows[0].id;
  
  // Validate required fields
  if (!category_id || !name || price === undefined || quantity_available === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'category_id, name, price, and quantity_available are required',
      },
    });
  }
  
  if (price <= 0 || quantity_available < 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_VALUES',
        message: 'Price must be positive, quantity_available must be non-negative',
      },
    });
  }
  
  const product = await createProduct(farmerId, {
    category_id,
    name,
    description,
    long_description,
    price: parseFloat(price),
    unit: unit || 'kg',
    quantity_available: parseInt(quantity_available),
    main_image_url,
    image_urls: image_urls || [],
  });
  
  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully',
  });
}));

/**
 * GET /api/v1/products/farmer/my-products
 * Get products for current farmer
 */
router.get('/farmer/my-products', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { category_id, is_active = true, page = 1, limit = 50 } = req.query;
  
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
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const products = await getFarmerProducts(farmerId, {
    category_id,
    is_active: is_active === 'false' ? false : true,
    limit: parseInt(limit),
    offset,
  });
  
  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
  });
}));

/**
 * PUT /api/v1/products/:id
 * Update product (farmer owner only)
 */
router.put('/:id', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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
        message: 'Only farmers can update products',
      },
    });
  }
  
  const farmerId = farmerResult.rows[0].id;
  
  const product = await updateProduct(id, farmerId, req.body);
  
  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully',
  });
}));

/**
 * DELETE /api/v1/products/:id
 * Delete product (farmer owner only)
 */
router.delete('/:id', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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
        message: 'Only farmers can delete products',
      },
    });
  }
  
  const farmerId = farmerResult.rows[0].id;
  
  await deleteProduct(id, farmerId);
  
  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
}));

/**
 * POST /api/v1/products/:id/reviews
 * Add product review
 */
router.post('/:id/reviews', authenticate, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  if (!rating) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Rating is required',
      },
    });
  }
  
  const review = await addProductReview(
    req.params.id,
    req.user.user_id,
    parseInt(rating),
    comment || null
  );
  
  res.status(201).json({
    success: true,
    data: review,
    message: 'Review added successfully',
  });
}));

/**
 * GET /api/v1/products/:id/reviews
 * Get product reviews
 */
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const reviews = await getProductReviews(
    req.params.id,
    parseInt(limit),
    offset
  );
  
  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
  });
}));

export default router;
