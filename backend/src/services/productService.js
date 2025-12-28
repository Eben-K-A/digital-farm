import pool from '../config/database.js';
import { generateSlug } from '../utils/validators.js';

/**
 * Get all product categories
 */
export async function getCategories() {
  const result = await pool.query(
    'SELECT id, name, slug, description, icon_url FROM product_categories WHERE is_active = TRUE ORDER BY name'
  );
  return result.rows;
}

/**
 * Get single category by ID
 */
export async function getCategoryById(categoryId) {
  const result = await pool.query(
    'SELECT id, name, slug, description, icon_url FROM product_categories WHERE id = $1 AND is_active = TRUE',
    [categoryId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Category not found');
  }
  
  return result.rows[0];
}

/**
 * Create a new product
 */
export async function createProduct(farmerId, productData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      category_id,
      name,
      description,
      long_description,
      price,
      unit = 'kg',
      quantity_available,
      main_image_url,
      image_urls = [],
    } = productData;
    
    // Validate required fields
    if (!name || !category_id || price === undefined || quantity_available === undefined) {
      throw new Error('Missing required fields: name, category_id, price, quantity_available');
    }
    
    const slug = generateSlug(name);
    
    // Check if slug already exists for this farmer
    const existingProduct = await client.query(
      'SELECT id FROM products WHERE farmer_id = $1 AND slug = $2',
      [farmerId, slug]
    );
    
    if (existingProduct.rows.length > 0) {
      throw new Error('Product with this name already exists for your farm');
    }
    
    const result = await client.query(
      `INSERT INTO products (
        farmer_id,
        category_id,
        name,
        slug,
        description,
        long_description,
        price,
        unit,
        quantity_available,
        main_image_url,
        image_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        farmerId,
        category_id,
        name,
        slug,
        description,
        long_description,
        price,
        unit,
        quantity_available,
        main_image_url,
        JSON.stringify(image_urls),
      ]
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
 * Update product
 */
export async function updateProduct(productId, farmerId, updates) {
  const allowedFields = [
    'name',
    'description',
    'long_description',
    'price',
    'quantity_available',
    'main_image_url',
    'image_urls',
    'is_active',
    'is_featured',
  ];
  
  // Filter only allowed fields
  const validUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});
  
  // Verify product belongs to farmer
  const product = await pool.query(
    'SELECT id FROM products WHERE id = $1 AND farmer_id = $2',
    [productId, farmerId]
  );
  
  if (product.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  const setClause = Object.keys(validUpdates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  if (setClause === '') {
    throw new Error('No valid fields to update');
  }
  
  const values = [productId, ...Object.values(validUpdates)];
  
  const result = await pool.query(
    `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND farmer_id = $2
     RETURNING *`,
    values
  );
  
  return result.rows[0];
}

/**
 * Delete product (soft delete)
 */
export async function deleteProduct(productId, farmerId) {
  const result = await pool.query(
    'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND farmer_id = $2 RETURNING id',
    [productId, farmerId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  return true;
}

/**
 * Get products for a specific farmer
 */
export async function getFarmerProducts(farmerId, filters = {}) {
  const { is_active = true, category_id, limit = 50, offset = 0 } = filters;
  
  let query = `
    SELECT 
      p.*,
      c.name as category_name,
      f.farm_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.farmer_id = $1 AND p.deleted_at IS NULL
  `;
  
  const params = [farmerId];
  let paramIndex = 2;
  
  if (is_active !== null) {
    query += ` AND p.is_active = $${paramIndex}`;
    params.push(is_active);
    paramIndex++;
  }
  
  if (category_id) {
    query += ` AND p.category_id = $${paramIndex}`;
    params.push(category_id);
    paramIndex++;
  }
  
  query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get single product with details
 */
export async function getProductById(productId) {
  const result = await pool.query(
    `SELECT 
      p.*,
      c.name as category_name,
      f.farm_name,
      f.id as farmer_id,
      u.first_name as farmer_first_name,
      u.last_name as farmer_last_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN farmers f ON p.farmer_id = f.id
    JOIN users u ON f.user_id = u.id
    WHERE p.id = $1 AND p.deleted_at IS NULL AND p.is_active = TRUE`,
    [productId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  return result.rows[0];
}

/**
 * Search and filter products with pagination
 */
export async function searchProducts(filters = {}) {
  const {
    search = '',
    category_id,
    farmer_id,
    region,
    min_price,
    max_price,
    is_featured = false,
    sort_by = 'created_at',
    sort_order = 'DESC',
    limit = 20,
    offset = 0,
  } = filters;
  
  let query = `
    SELECT 
      p.*,
      c.name as category_name,
      f.farm_name,
      f.region,
      u.first_name as farmer_first_name,
      u.last_name as farmer_last_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN farmers f ON p.farmer_id = f.id
    JOIN users u ON f.user_id = u.id
    WHERE p.deleted_at IS NULL AND p.is_active = TRUE
  `;
  
  const params = [];
  let paramIndex = 1;
  
  // Search in product name and description
  if (search) {
    query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  if (category_id) {
    query += ` AND p.category_id = $${paramIndex}`;
    params.push(category_id);
    paramIndex++;
  }
  
  if (farmer_id) {
    query += ` AND p.farmer_id = $${paramIndex}`;
    params.push(farmer_id);
    paramIndex++;
  }
  
  if (region) {
    query += ` AND f.region ILIKE $${paramIndex}`;
    params.push(`%${region}%`);
    paramIndex++;
  }
  
  if (min_price !== undefined) {
    query += ` AND p.price >= $${paramIndex}`;
    params.push(min_price);
    paramIndex++;
  }
  
  if (max_price !== undefined) {
    query += ` AND p.price <= $${paramIndex}`;
    params.push(max_price);
    paramIndex++;
  }
  
  if (is_featured) {
    query += ` AND p.is_featured = TRUE`;
  }
  
  // Validate sort_by to prevent SQL injection
  const validSortFields = ['created_at', 'price', 'rating', 'total_sold', 'name'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
  const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY p.${sortField} ${sortDir}`;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get product count for search (for pagination)
 */
export async function getProductsCount(filters = {}) {
  const {
    search = '',
    category_id,
    farmer_id,
    region,
    min_price,
    max_price,
  } = filters;
  
  let query = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.deleted_at IS NULL AND p.is_active = TRUE
  `;
  
  const params = [];
  let paramIndex = 1;
  
  if (search) {
    query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  if (category_id) {
    query += ` AND p.category_id = $${paramIndex}`;
    params.push(category_id);
    paramIndex++;
  }
  
  if (farmer_id) {
    query += ` AND p.farmer_id = $${paramIndex}`;
    params.push(farmer_id);
    paramIndex++;
  }
  
  if (region) {
    query += ` AND f.region ILIKE $${paramIndex}`;
    params.push(`%${region}%`);
    paramIndex++;
  }
  
  if (min_price !== undefined) {
    query += ` AND p.price >= $${paramIndex}`;
    params.push(min_price);
    paramIndex++;
  }
  
  if (max_price !== undefined) {
    query += ` AND p.price <= $${paramIndex}`;
    params.push(max_price);
    paramIndex++;
  }
  
  const result = await pool.query(query, params);
  return parseInt(result.rows[0].total);
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 10) {
  const result = await pool.query(
    `SELECT 
      p.*,
      c.name as category_name,
      f.farm_name,
      f.region,
      u.first_name as farmer_first_name,
      u.last_name as farmer_last_name
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    JOIN farmers f ON p.farmer_id = f.id
    JOIN users u ON f.user_id = u.id
    WHERE p.deleted_at IS NULL AND p.is_active = TRUE AND p.is_featured = TRUE
    ORDER BY p.created_at DESC
    LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

/**
 * Add product review
 */
export async function addProductReview(productId, buyerId, rating, comment) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const result = await pool.query(
    `INSERT INTO product_reviews (product_id, buyer_id, rating, comment, is_verified_purchase)
    VALUES ($1, $2, $3, $4, TRUE)
    ON CONFLICT (product_id, buyer_id)
    DO UPDATE SET rating = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
    [productId, buyerId, rating, comment]
  );
  
  // Update product rating
  const ratingResult = await pool.query(
    `SELECT ROUND(AVG(rating)::numeric, 2) as avg_rating, COUNT(*) as count
    FROM product_reviews WHERE product_id = $1`,
    [productId]
  );
  
  const { avg_rating, count } = ratingResult.rows[0];
  
  await pool.query(
    `UPDATE products SET rating = $1, rating_count = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3`,
    [avg_rating, count, productId]
  );
  
  return result.rows[0];
}

/**
 * Get product reviews
 */
export async function getProductReviews(productId, limit = 10, offset = 0) {
  const result = await pool.query(
    `SELECT 
      pr.*,
      u.first_name,
      u.last_name
    FROM product_reviews pr
    JOIN users u ON pr.buyer_id = u.id
    WHERE pr.product_id = $1
    ORDER BY pr.created_at DESC
    LIMIT $2 OFFSET $3`,
    [productId, limit, offset]
  );
  
  return result.rows;
}
