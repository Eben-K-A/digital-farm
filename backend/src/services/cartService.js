import pool from '../config/database.js';

/**
 * Get or create cart for user
 */
export async function getOrCreateCart(userId) {
  let result = await pool.query(
    'SELECT * FROM shopping_carts WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  
  // Create new cart
  result = await pool.query(
    'INSERT INTO shopping_carts (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  
  return result.rows[0];
}

/**
 * Get cart with items details
 */
export async function getCartDetails(userId) {
  // Ensure cart exists
  await getOrCreateCart(userId);
  
  const result = await pool.query(
    `SELECT 
      sc.*,
      json_agg(
        json_build_object(
          'id', ci.id,
          'product_id', ci.product_id,
          'quantity', ci.quantity,
          'unit_price', ci.unit_price,
          'subtotal', ci.quantity * ci.unit_price,
          'product_name', p.name,
          'main_image_url', p.main_image_url,
          'category_name', c.name,
          'farmer_id', f.id,
          'farm_name', f.farm_name,
          'farmer_name', CONCAT(u.first_name, ' ', u.last_name)
        )
      ) FILTER (WHERE ci.id IS NOT NULL) as items
    FROM shopping_carts sc
    LEFT JOIN cart_items ci ON sc.id = ci.cart_id
    LEFT JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_categories c ON p.category_id = c.id
    LEFT JOIN farmers f ON p.farmer_id = f.id
    LEFT JOIN users u ON f.user_id = u.id
    WHERE sc.user_id = $1
    GROUP BY sc.id`,
    [userId]
  );
  
  const cart = result.rows[0];
  
  // Calculate totals
  let subtotal = 0;
  if (cart.items && cart.items.length > 0) {
    subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  
  return {
    ...cart,
    items: cart.items || [],
    subtotal: parseFloat(subtotal.toFixed(2)),
    item_count: cart.items ? cart.items.length : 0,
  };
}

/**
 * Add item to cart
 */
export async function addToCart(userId, productId, quantity = 1) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get or create cart
    let cartResult = await client.query(
      'SELECT id FROM shopping_carts WHERE user_id = $1',
      [userId]
    );
    
    let cartId;
    if (cartResult.rows.length === 0) {
      const newCart = await client.query(
        'INSERT INTO shopping_carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }
    
    // Get product and verify it's active
    const productResult = await client.query(
      'SELECT price, quantity_available FROM products WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL',
      [productId]
    );
    
    if (productResult.rows.length === 0) {
      throw new Error('Product not found or is inactive');
    }
    
    const { price, quantity_available } = productResult.rows[0];
    
    if (quantity_available < quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Add or update cart item
    const result = await client.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (cart_id, product_id) DO UPDATE SET
        quantity = cart_items.quantity + $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [cartId, productId, quantity, price]
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
 * Update cart item quantity
 */
export async function updateCartItem(userId, cartItemId, quantity) {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify item belongs to user's cart
    const cartCheck = await client.query(
      `SELECT ci.*, sc.user_id, p.quantity_available
      FROM cart_items ci
      JOIN shopping_carts sc ON ci.cart_id = sc.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = $1 AND sc.user_id = $2`,
      [cartItemId, userId]
    );
    
    if (cartCheck.rows.length === 0) {
      throw new Error('Cart item not found');
    }
    
    const { quantity_available } = cartCheck.rows[0];
    
    if (quantity_available < quantity) {
      throw new Error('Insufficient stock');
    }
    
    const result = await client.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, cartItemId]
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
 * Remove item from cart
 */
export async function removeFromCart(userId, cartItemId) {
  // Verify item belongs to user
  const verify = await pool.query(
    `SELECT ci.id FROM cart_items ci
    JOIN shopping_carts sc ON ci.cart_id = sc.id
    WHERE ci.id = $1 AND sc.user_id = $2`,
    [cartItemId, userId]
  );
  
  if (verify.rows.length === 0) {
    throw new Error('Cart item not found');
  }
  
  const result = await pool.query(
    'DELETE FROM cart_items WHERE id = $1 RETURNING id',
    [cartItemId]
  );
  
  return true;
}

/**
 * Clear entire cart
 */
export async function clearCart(userId) {
  const result = await pool.query(
    `DELETE FROM cart_items
    WHERE cart_id = (SELECT id FROM shopping_carts WHERE user_id = $1)
    RETURNING id`,
    [userId]
  );
  
  return true;
}

/**
 * Get cart item count
 */
export async function getCartItemCount(userId) {
  const result = await pool.query(
    `SELECT COUNT(ci.id) as count
    FROM cart_items ci
    JOIN shopping_carts sc ON ci.cart_id = sc.id
    WHERE sc.user_id = $1`,
    [userId]
  );
  
  return parseInt(result.rows[0].count);
}

/**
 * Validate cart items (check stock, prices)
 */
export async function validateCart(userId) {
  const result = await pool.query(
    `SELECT 
      ci.id,
      ci.product_id,
      ci.quantity,
      ci.unit_price,
      p.price as current_price,
      p.quantity_available,
      p.is_active
    FROM cart_items ci
    JOIN shopping_carts sc ON ci.cart_id = sc.id
    JOIN products p ON ci.product_id = p.id
    WHERE sc.user_id = $1`,
    [userId]
  );
  
  const issues = [];
  
  for (const item of result.rows) {
    if (!item.is_active) {
      issues.push({
        type: 'PRODUCT_INACTIVE',
        item_id: item.id,
        product_id: item.product_id,
        message: 'Product is no longer available',
      });
    }
    
    if (item.quantity > item.quantity_available) {
      issues.push({
        type: 'INSUFFICIENT_STOCK',
        item_id: item.id,
        product_id: item.product_id,
        requested: item.quantity,
        available: item.quantity_available,
        message: `Only ${item.quantity_available} units available`,
      });
    }
    
    if (item.unit_price !== item.current_price) {
      issues.push({
        type: 'PRICE_CHANGED',
        item_id: item.id,
        product_id: item.product_id,
        old_price: item.unit_price,
        new_price: item.current_price,
        message: `Price changed from ₵${item.unit_price} to ₵${item.current_price}`,
      });
    }
  }
  
  return {
    is_valid: issues.length === 0,
    issues,
  };
}
