import pool from '../config/database.js';

/**
 * Get user profile with full details
 */
export async function getUserProfile(userId) {
  const result = await pool.query(
    `SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.phone_number,
      u.profile_picture_url,
      u.user_type,
      u.is_verified,
      u.verification_status,
      u.email_verified,
      u.phone_verified,
      u.last_login,
      u.is_active,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return result.rows[0];
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  const allowedFields = [
    'first_name',
    'last_name',
    'phone_number',
    'profile_picture_url',
  ];
  
  // Filter only allowed fields
  const validUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});
  
  if (Object.keys(validUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const setClause = Object.keys(validUpdates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  const values = [userId, ...Object.values(validUpdates)];
  
  const result = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, email, first_name, last_name, phone_number, profile_picture_url, user_type, updated_at`,
    values
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return result.rows[0];
}

/**
 * Create new address for user
 */
export async function createAddress(userId, addressData) {
  const {
    address_type = 'residential',
    street_address,
    city,
    region,
    postal_code,
    gps_address,
    recipient_name,
    recipient_phone,
    is_default = false,
  } = addressData;
  
  // Validate required fields
  if (!street_address || !city || !region || !recipient_name || !recipient_phone) {
    throw new Error('Missing required fields');
  }
  
  // If setting as default, unset other defaults
  if (is_default) {
    await pool.query(
      'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );
  }
  
  const result = await pool.query(
    `INSERT INTO user_addresses (
      user_id,
      address_type,
      street_address,
      city,
      region,
      postal_code,
      gps_address,
      recipient_name,
      recipient_phone,
      is_default
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      userId,
      address_type,
      street_address,
      city,
      region,
      postal_code,
      gps_address,
      recipient_name,
      recipient_phone,
      is_default,
    ]
  );
  
  return result.rows[0];
}

/**
 * Get all addresses for user
 */
export async function getUserAddresses(userId) {
  const result = await pool.query(
    `SELECT *
    FROM user_addresses
    WHERE user_id = $1 AND is_active = TRUE
    ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

/**
 * Get single address
 */
export async function getAddressById(addressId, userId) {
  const result = await pool.query(
    `SELECT *
    FROM user_addresses
    WHERE id = $1 AND user_id = $2`,
    [addressId, userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Address not found');
  }
  
  return result.rows[0];
}

/**
 * Update address
 */
export async function updateAddress(addressId, userId, updates) {
  // Verify address belongs to user
  const address = await pool.query(
    'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
    [addressId, userId]
  );
  
  if (address.rows.length === 0) {
    throw new Error('Address not found');
  }
  
  const allowedFields = [
    'address_type',
    'street_address',
    'city',
    'region',
    'postal_code',
    'gps_address',
    'recipient_name',
    'recipient_phone',
    'is_default',
  ];
  
  const validUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});
  
  if (Object.keys(validUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  // If setting as default, unset other defaults
  if (validUpdates.is_default === true) {
    await pool.query(
      'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2',
      [userId, addressId]
    );
  }
  
  const setClause = Object.keys(validUpdates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  const values = [addressId, userId, ...Object.values(validUpdates)];
  
  const result = await pool.query(
    `UPDATE user_addresses SET ${setClause}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    values
  );
  
  return result.rows[0];
}

/**
 * Delete address (soft delete)
 */
export async function deleteAddress(addressId, userId) {
  const result = await pool.query(
    'UPDATE user_addresses SET is_active = FALSE WHERE id = $1 AND user_id = $2 RETURNING id',
    [addressId, userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Address not found');
  }
  
  return true;
}

/**
 * Get default address for user
 */
export async function getDefaultAddress(userId) {
  const result = await pool.query(
    `SELECT *
    FROM user_addresses
    WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE`,
    [userId]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Add product to favorites
 */
export async function addToFavorites(userId, productId) {
  const result = await pool.query(
    `INSERT INTO user_favorites (user_id, product_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING *`,
    [userId, productId]
  );
  
  return result.rows.length > 0 ? result.rows[0] : { user_id: userId, product_id: productId };
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(userId, productId) {
  const result = await pool.query(
    'DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2 RETURNING id',
    [userId, productId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Favorite not found');
  }
  
  return true;
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId, limit = 50, offset = 0) {
  const result = await pool.query(
    `SELECT 
      p.*,
      c.name as category_name,
      f.farm_name,
      f.region,
      u.first_name as farmer_first_name,
      u.last_name as farmer_last_name
    FROM user_favorites uf
    JOIN products p ON uf.product_id = p.id
    JOIN product_categories c ON p.category_id = c.id
    JOIN farmers f ON p.farmer_id = f.id
    JOIN users u ON f.user_id = u.id
    WHERE uf.user_id = $1 AND p.deleted_at IS NULL AND p.is_active = TRUE
    ORDER BY uf.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  
  return result.rows;
}

/**
 * Check if product is favorited
 */
export async function isFavorited(userId, productId) {
  const result = await pool.query(
    'SELECT id FROM user_favorites WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  
  return result.rows.length > 0;
}
