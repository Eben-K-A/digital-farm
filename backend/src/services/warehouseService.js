import pool from '../config/database.js';

/**
 * Create warehouse location
 */
export async function createWarehouse(warehouseData) {
  const {
    name,
    location,
    region,
    capacity,
    manager_id,
  } = warehouseData;

  if (!name || !location || !region) {
    throw new Error('name, location, and region are required');
  }

  const result = await pool.query(
    `INSERT INTO warehouse_locations (
      name,
      location,
      region,
      capacity,
      manager_id
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, location, region, capacity, manager_id]
  );

  return result.rows[0];
}

/**
 * Get all warehouses
 */
export async function getWarehouses(filters = {}) {
  const { region, is_active = true } = filters;

  let query = 'SELECT * FROM warehouse_locations WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (is_active !== null) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(is_active);
    paramIndex++;
  }

  if (region) {
    query += ` AND region = $${paramIndex}`;
    params.push(region);
    paramIndex++;
  }

  query += ' ORDER BY name ASC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get warehouse by ID
 */
export async function getWarehouseById(warehouseId) {
  const result = await pool.query(
    `SELECT 
      wl.*,
      u.first_name as manager_first_name,
      u.last_name as manager_last_name
    FROM warehouse_locations wl
    LEFT JOIN users u ON wl.manager_id = u.id
    WHERE wl.id = $1`,
    [warehouseId]
  );

  if (result.rows.length === 0) {
    throw new Error('Warehouse not found');
  }

  return result.rows[0];
}

/**
 * Update warehouse
 */
export async function updateWarehouse(warehouseId, updates) {
  const allowedFields = ['name', 'location', 'region', 'capacity', 'manager_id', 'is_active'];

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

  const values = [warehouseId, ...Object.values(validUpdates)];

  const result = await pool.query(
    `UPDATE warehouse_locations SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Warehouse not found');
  }

  return result.rows[0];
}

/**
 * Add stock to warehouse inventory
 */
export async function addInventory(warehouseId, productId, quantity) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get or create inventory record
    let invResult = await client.query(
      `SELECT id FROM warehouse_inventory
      WHERE warehouse_id = $1 AND product_id = $2`,
      [warehouseId, productId]
    );

    if (invResult.rows.length === 0) {
      await client.query(
        `INSERT INTO warehouse_inventory (warehouse_id, product_id, quantity_on_hand)
        VALUES ($1, $2, $3)`,
        [warehouseId, productId, quantity]
      );
    } else {
      await client.query(
        `UPDATE warehouse_inventory 
        SET quantity_on_hand = quantity_on_hand + $1, updated_at = CURRENT_TIMESTAMP
        WHERE warehouse_id = $2 AND product_id = $3`,
        [quantity, warehouseId, productId]
      );
    }

    // Record stock movement
    await client.query(
      `INSERT INTO stock_movements (warehouse_id, product_id, movement_type, quantity)
      VALUES ($1, $2, 'inbound', $3)`,
      [warehouseId, productId, quantity]
    );

    // Update warehouse stock value
    const valueResult = await client.query(
      `SELECT SUM(wi.quantity_on_hand * p.price) as total_value
      FROM warehouse_inventory wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.warehouse_id = $1`,
      [warehouseId]
    );

    const stockValue = valueResult.rows[0].total_value || 0;

    await client.query(
      `UPDATE warehouse_locations 
      SET current_stock_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [stockValue, warehouseId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Remove stock from warehouse
 */
export async function removeInventory(warehouseId, productId, quantity, reason = 'outbound') {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check available quantity
    const invResult = await client.query(
      `SELECT quantity_on_hand FROM warehouse_inventory
      WHERE warehouse_id = $1 AND product_id = $2`,
      [warehouseId, productId]
    );

    if (invResult.rows.length === 0) {
      throw new Error('Inventory record not found');
    }

    if (invResult.rows[0].quantity_on_hand < quantity) {
      throw new Error('Insufficient inventory');
    }

    // Update inventory
    await client.query(
      `UPDATE warehouse_inventory 
      SET quantity_on_hand = quantity_on_hand - $1, updated_at = CURRENT_TIMESTAMP
      WHERE warehouse_id = $2 AND product_id = $3`,
      [quantity, warehouseId, productId]
    );

    // Record stock movement
    await client.query(
      `INSERT INTO stock_movements (warehouse_id, product_id, movement_type, quantity, notes)
      VALUES ($1, $2, $3, $4, $5)`,
      [warehouseId, productId, reason, quantity, `${reason}: ${quantity} units`]
    );

    // Update warehouse stock value
    const valueResult = await client.query(
      `SELECT SUM(wi.quantity_on_hand * p.price) as total_value
      FROM warehouse_inventory wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.warehouse_id = $1`,
      [warehouseId]
    );

    const stockValue = valueResult.rows[0].total_value || 0;

    await client.query(
      `UPDATE warehouse_locations 
      SET current_stock_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [stockValue, warehouseId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get warehouse inventory
 */
export async function getWarehouseInventory(warehouseId, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
      wi.*,
      p.name as product_name,
      p.price,
      c.name as category_name,
      (wi.quantity_on_hand * p.price) as inventory_value
    FROM warehouse_inventory wi
    JOIN products p ON wi.product_id = p.id
    JOIN product_categories c ON p.category_id = c.id
    WHERE wi.warehouse_id = $1
    ORDER BY p.name ASC
    LIMIT $2 OFFSET $3`,
    [warehouseId, limit, offset]
  );

  return result.rows;
}

/**
 * Get inventory count for warehouse
 */
export async function getWarehouseInventoryCount(warehouseId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM warehouse_inventory WHERE warehouse_id = $1',
    [warehouseId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Get low stock items
 */
export async function getLowStockItems(warehouseId) {
  const result = await pool.query(
    `SELECT 
      wi.*,
      p.name as product_name,
      p.price,
      c.name as category_name,
      (wi.quantity_on_hand * p.price) as inventory_value
    FROM warehouse_inventory wi
    JOIN products p ON wi.product_id = p.id
    JOIN product_categories c ON p.category_id = c.id
    WHERE wi.warehouse_id = $1 AND wi.quantity_on_hand <= wi.reorder_level
    ORDER BY wi.quantity_on_hand ASC`,
    [warehouseId]
  );

  return result.rows;
}

/**
 * Get stock movements
 */
export async function getStockMovements(warehouseId, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
      sm.*,
      p.name as product_name,
      u.first_name,
      u.last_name
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    LEFT JOIN users u ON sm.created_by = u.id
    WHERE sm.warehouse_id = $1
    ORDER BY sm.created_at DESC
    LIMIT $2 OFFSET $3`,
    [warehouseId, limit, offset]
  );

  return result.rows;
}

/**
 * Count stock movements
 */
export async function countStockMovements(warehouseId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM stock_movements WHERE warehouse_id = $1',
    [warehouseId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Get warehouse statistics
 */
export async function getWarehouseStats(warehouseId) {
  const result = await pool.query(
    `SELECT 
      wl.id,
      wl.name,
      wl.capacity,
      wl.current_stock_value,
      COUNT(DISTINCT wi.product_id) as total_products,
      SUM(wi.quantity_on_hand) as total_quantity,
      SUM(CASE WHEN wi.quantity_on_hand <= wi.reorder_level THEN 1 ELSE 0 END) as low_stock_items,
      COUNT(DISTINCT sm.id) as recent_movements
    FROM warehouse_locations wl
    LEFT JOIN warehouse_inventory wi ON wl.id = wi.warehouse_id
    LEFT JOIN stock_movements sm ON wl.id = sm.warehouse_id 
      AND sm.created_at >= CURRENT_DATE - INTERVAL '7 days'
    WHERE wl.id = $1
    GROUP BY wl.id, wl.name, wl.capacity, wl.current_stock_value`,
    [warehouseId]
  );

  return result.rows[0] || null;
}

/**
 * Search inventory by product name
 */
export async function searchInventory(warehouseId, searchTerm, limit = 20) {
  const result = await pool.query(
    `SELECT 
      wi.*,
      p.name as product_name,
      p.price,
      c.name as category_name,
      (wi.quantity_on_hand * p.price) as inventory_value
    FROM warehouse_inventory wi
    JOIN products p ON wi.product_id = p.id
    JOIN product_categories c ON p.category_id = c.id
    WHERE wi.warehouse_id = $1 AND p.name ILIKE $2
    ORDER BY p.name ASC
    LIMIT $3`,
    [warehouseId, `%${searchTerm}%`, limit]
  );

  return result.rows;
}
