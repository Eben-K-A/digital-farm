import pool from '../config/database.js';

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create order from cart
 */
export async function createOrder(userId, addressId, paymentMethod = 'mobile_money', specialInstructions = '') {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get cart items
    const cartResult = await client.query(
      `SELECT 
        ci.*,
        p.id as product_id,
        p.name,
        p.quantity_available,
        f.id as farmer_id
      FROM cart_items ci
      JOIN shopping_carts sc ON ci.cart_id = sc.id
      JOIN products p ON ci.product_id = p.id
      JOIN farmers f ON p.farmer_id = f.id
      WHERE sc.user_id = $1`,
      [userId]
    );
    
    const items = cartResult.rows;
    
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Verify address belongs to user
    const addressCheck = await client.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2 AND is_active = TRUE',
      [addressId, userId]
    );
    
    if (addressCheck.rows.length === 0) {
      throw new Error('Invalid delivery address');
    }
    
    // Validate stock and calculate total
    let subtotal = 0;
    for (const item of items) {
      if (item.quantity_available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
      subtotal += item.quantity * item.unit_price;
    }
    
    // Calculate delivery fee (simplified - can be enhanced with location-based pricing)
    const deliveryFee = 5.00;
    const totalAmount = subtotal + deliveryFee;
    
    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number,
        buyer_id,
        delivery_address_id,
        subtotal,
        delivery_fee,
        total_amount,
        payment_method,
        special_instructions,
        status,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'pending')
      RETURNING *`,
      [
        orderNumber,
        userId,
        addressId,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod,
        specialInstructions,
      ]
    );
    
    const order = orderResult.rows[0];
    
    // Create order items and reduce product stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          farmer_id,
          product_name,
          quantity,
          unit_price,
          subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          item.product_id,
          item.farmer_id,
          item.name,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price,
        ]
      );
      
      // Update product stock
      await client.query(
        `UPDATE products 
        SET quantity_available = quantity_available - $1,
            total_sold = total_sold + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [item.quantity, item.product_id]
      );
      
      // Update farmer stats
      await client.query(
        `UPDATE farmers
        SET total_sales = total_sales + $1
        WHERE id = $2`,
        [item.quantity, item.farmer_id]
      );
    }
    
    // Create order tracking record
    await client.query(
      `INSERT INTO order_tracking (order_id, last_update)
      VALUES ($1, CURRENT_TIMESTAMP)`,
      [order.id]
    );
    
    // Clear cart
    const cartIdResult = await client.query(
      'SELECT id FROM shopping_carts WHERE user_id = $1',
      [userId]
    );
    
    if (cartIdResult.rows.length > 0) {
      await client.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cartIdResult.rows[0].id]
      );
    }
    
    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId, userId = null) {
  let query = `
    SELECT 
      o.*,
      u.first_name,
      u.last_name,
      u.email,
      ua.street_address,
      ua.city,
      ua.region,
      ua.gps_address,
      ua.recipient_name,
      ua.recipient_phone
    FROM orders o
    JOIN users u ON o.buyer_id = u.id
    LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
    WHERE o.id = $1
  `;
  
  const params = [orderId];
  
  if (userId) {
    query += ' AND o.buyer_id = $2';
    params.push(userId);
  }
  
  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    throw new Error('Order not found');
  }
  
  const order = result.rows[0];
  
  // Get order items
  const itemsResult = await pool.query(
    `SELECT 
      oi.*,
      f.farm_name
    FROM order_items oi
    LEFT JOIN farmers f ON oi.farmer_id = f.id
    WHERE oi.order_id = $1`,
    [orderId]
  );
  
  // Get tracking info
  const trackingResult = await pool.query(
    `SELECT * FROM order_tracking WHERE order_id = $1`,
    [orderId]
  );
  
  return {
    ...order,
    items: itemsResult.rows,
    tracking: trackingResult.rows[0] || null,
  };
}

/**
 * Get user orders
 */
export async function getUserOrders(userId, filters = {}) {
  const { status, payment_status, page = 1, limit = 20 } = filters;
  
  let query = `
    SELECT 
      o.id,
      o.order_number,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.status,
      o.payment_status,
      o.ordered_at,
      COUNT(oi.id) as item_count,
      STRING_AGG(DISTINCT oi.product_name, ', ') as product_names
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = $1
  `;
  
  const params = [userId];
  let paramIndex = 2;
  
  if (status) {
    query += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  if (payment_status) {
    query += ` AND o.payment_status = $${paramIndex}`;
    params.push(payment_status);
    paramIndex++;
  }
  
  query += ` GROUP BY o.id ORDER BY o.ordered_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get user orders count
 */
export async function getUserOrdersCount(userId, filters = {}) {
  const { status, payment_status } = filters;
  
  let query = 'SELECT COUNT(DISTINCT o.id) as total FROM orders o WHERE o.buyer_id = $1';
  const params = [userId];
  let paramIndex = 2;
  
  if (status) {
    query += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  if (payment_status) {
    query += ` AND o.payment_status = $${paramIndex}`;
    params.push(payment_status);
    paramIndex++;
  }
  
  const result = await pool.query(query, params);
  return parseInt(result.rows[0].total);
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, newStatus, updatedBy = null) {
  const validStatuses = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled', 'returned'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  const statusChangeData = {};
  
  if (newStatus === 'delivered') {
    statusChangeData.delivered_at = new Date();
  } else if (newStatus === 'dispatched') {
    statusChangeData.dispatched_at = new Date();
  } else if (newStatus === 'cancelled') {
    statusChangeData.cancelled_at = new Date();
  }
  
  const updateFields = Object.keys(statusChangeData)
    .map((key, index) => `${key} = $${index + 3}`)
    .join(', ');
  
  const query = updateFields 
    ? `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP, ${updateFields} WHERE id = $2 RETURNING *`
    : `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
  
  const params = [newStatus, orderId, ...Object.values(statusChangeData)];
  
  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    throw new Error('Order not found');
  }
  
  return result.rows[0];
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId, paymentStatus) {
  const validPaymentStatuses = ['pending', 'processing', 'paid', 'failed', 'refunded'];
  
  if (!validPaymentStatuses.includes(paymentStatus)) {
    throw new Error(`Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`);
  }
  
  let query = 'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP';
  const params = [paymentStatus];
  let paramIndex = 2;
  
  if (paymentStatus === 'paid') {
    query += ` , paid_at = CURRENT_TIMESTAMP`;
  }
  
  query += ` WHERE id = $${paramIndex} RETURNING *`;
  params.push(orderId);
  
  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    throw new Error('Order not found');
  }
  
  return result.rows[0];
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId, userId, cancellationReason = '') {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get order and verify it belongs to user
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
      [orderId, userId]
    );
    
    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    const order = orderResult.rows[0];
    
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Can only cancel pending or confirmed orders');
    }
    
    // Get order items
    const itemsResult = await client.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );
    
    // Restore product stock
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE products 
        SET quantity_available = quantity_available + $1,
            total_sold = GREATEST(0, total_sold - $1),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [item.quantity, item.product_id]
      );
      
      await client.query(
        `UPDATE farmers
        SET total_sales = GREATEST(0, total_sales - $1)
        WHERE id = $2`,
        [item.quantity, item.farmer_id]
      );
    }
    
    // Update order status
    const cancelledOrder = await client.query(
      `UPDATE orders 
      SET status = 'cancelled', 
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *`,
      [orderId]
    );
    
    await client.query('COMMIT');
    return cancelledOrder.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update order tracking
 */
export async function updateOrderTracking(orderId, trackingData) {
  const { current_location, estimated_delivery, delivery_partner_id } = trackingData;
  
  let query = 'UPDATE order_tracking SET last_update = CURRENT_TIMESTAMP';
  const params = [];
  let paramIndex = 1;
  
  if (current_location) {
    query += `, current_location = $${paramIndex}`;
    params.push(current_location);
    paramIndex++;
  }
  
  if (estimated_delivery) {
    query += `, estimated_delivery = $${paramIndex}`;
    params.push(estimated_delivery);
    paramIndex++;
  }
  
  if (delivery_partner_id) {
    query += `, delivery_partner_id = $${paramIndex}`;
    params.push(delivery_partner_id);
    paramIndex++;
  }
  
  query += ` WHERE order_id = $${paramIndex} RETURNING *`;
  params.push(orderId);
  
  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    throw new Error('Order tracking not found');
  }
  
  return result.rows[0];
}

/**
 * Get orders by farmer (for items they sold)
 */
export async function getFarmerOrders(farmerId, filters = {}) {
  const { status, page = 1, limit = 20 } = filters;
  
  let query = `
    SELECT DISTINCT
      o.id,
      o.order_number,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.status,
      o.payment_status,
      o.ordered_at,
      u.first_name,
      u.last_name,
      u.email
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN users u ON o.buyer_id = u.id
    WHERE oi.farmer_id = $1
  `;
  
  const params = [farmerId];
  let paramIndex = 2;
  
  if (status) {
    query += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  query += ` ORDER BY o.ordered_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);
  
  const result = await pool.query(query, params);
  return result.rows;
}
