import pool from '../config/database.js';

/**
 * Register delivery partner
 */
export async function registerDeliveryPartner(userId, partnerData) {
  const {
    vehicle_type,
    vehicle_registration,
    license_number,
  } = partnerData;

  const result = await pool.query(
    `INSERT INTO delivery_partners (
      user_id,
      vehicle_type,
      vehicle_registration,
      license_number
    ) VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [userId, vehicle_type, vehicle_registration, license_number]
  );

  return result.rows[0];
}

/**
 * Get delivery partner profile
 */
export async function getDeliveryPartnerProfile(userId) {
  const result = await pool.query(
    `SELECT 
      dp.*,
      u.first_name,
      u.last_name,
      u.email,
      u.phone_number
    FROM delivery_partners dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Delivery partner not found');
  }

  return result.rows[0];
}

/**
 * Update delivery partner status
 */
export async function updateDeliveryPartnerStatus(partnerId, isAvailable) {
  const result = await pool.query(
    `UPDATE delivery_partners 
    SET is_available = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *`,
    [isAvailable, partnerId]
  );

  return result.rows[0];
}

/**
 * Get available delivery partners
 */
export async function getAvailableDeliveryPartners() {
  const result = await pool.query(
    `SELECT 
      dp.*,
      u.first_name,
      u.last_name,
      u.phone_number
    FROM delivery_partners dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.is_available = TRUE AND dp.is_active = TRUE AND dp.is_verified = TRUE
    ORDER BY dp.rating DESC`
  );

  return result.rows;
}

/**
 * Assign order to delivery partner
 */
export async function assignOrderToPartner(orderId, partnerId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get order details
    const orderResult = await client.query(
      `SELECT o.*, ua.street_address, ua.city, ua.region, ua.gps_address
      FROM orders o
      LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
      WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult.rows[0];

    // Update order tracking with delivery partner
    const trackingResult = await client.query(
      `UPDATE order_tracking 
      SET delivery_partner_id = $1, estimated_delivery = CURRENT_TIMESTAMP + INTERVAL '4 hours'
      WHERE order_id = $2
      RETURNING *`,
      [partnerId, orderId]
    );

    // Update order status to dispatched
    await client.query(
      `UPDATE orders SET status = 'dispatched', dispatched_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [orderId]
    );

    // Create a route waypoint for this order
    const routeResult = await client.query(
      `INSERT INTO route_waypoints (route_id, order_id, sequence_number, location, gps_coordinates)
      VALUES (
        (SELECT id FROM delivery_routes WHERE delivery_partner_id = $1 LIMIT 1),
        $2,
        (SELECT COALESCE(MAX(sequence_number), 0) + 1 FROM route_waypoints WHERE order_id = $2),
        $3,
        $4::jsonb
      )
      RETURNING *`,
      [
        partnerId,
        orderId,
        order.gps_address || `${order.city}, ${order.region}`,
        JSON.stringify({ city: order.city, region: order.region }),
      ]
    );

    await client.query('COMMIT');
    return trackingResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create delivery route
 */
export async function createDeliveryRoute(partnerId, routeData) {
  const {
    route_name,
    start_location,
    end_location,
    estimated_distance,
    estimated_duration_minutes,
  } = routeData;

  const result = await pool.query(
    `INSERT INTO delivery_routes (
      delivery_partner_id,
      route_name,
      start_location,
      end_location,
      estimated_distance,
      estimated_duration_minutes
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      partnerId,
      route_name,
      start_location,
      end_location,
      estimated_distance,
      estimated_duration_minutes,
    ]
  );

  return result.rows[0];
}

/**
 * Get delivery routes for partner
 */
export async function getDeliveryRoutes(partnerId, status = null) {
  let query = 'SELECT * FROM delivery_routes WHERE delivery_partner_id = $1';
  const params = [partnerId];

  if (status) {
    query += ' AND status = $2';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get route waypoints
 */
export async function getRouteWaypoints(routeId) {
  const result = await pool.query(
    `SELECT 
      rw.*,
      o.order_number
    FROM route_waypoints rw
    LEFT JOIN orders o ON rw.order_id = o.id
    WHERE rw.route_id = $1
    ORDER BY rw.sequence_number ASC`,
    [routeId]
  );

  return result.rows;
}

/**
 * Update waypoint status
 */
export async function updateWaypointStatus(waypointId, arrivedAt = false, departedAt = false) {
  let query = 'UPDATE route_waypoints SET';
  const params = [waypointId];
  let paramIndex = 2;

  if (arrivedAt) {
    query += ` arrival_time = CURRENT_TIMESTAMP`;
  }

  if (departedAt) {
    if (arrivedAt) query += ',';
    query += ` departure_time = CURRENT_TIMESTAMP`;
  }

  query += ` WHERE id = $1 RETURNING *`;

  const result = await pool.query(query, params);
  return result.rows[0];
}

/**
 * Update delivery partner location
 */
export async function updatePartnerLocation(partnerId, latitude, longitude) {
  const result = await pool.query(
    `UPDATE delivery_partners 
    SET current_location = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *`,
    [JSON.stringify({ lat: latitude, lon: longitude }), partnerId]
  );

  return result.rows[0];
}

/**
 * Complete delivery
 */
export async function completeDelivery(orderId, partnerId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update order status to delivered
    await client.query(
      `UPDATE orders 
      SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [orderId]
    );

    // Update order tracking
    const trackingResult = await client.query(
      `UPDATE order_tracking 
      SET actual_delivery = CURRENT_TIMESTAMP, last_update = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING *`,
      [orderId]
    );

    // Update delivery partner stats
    await client.query(
      `UPDATE delivery_partners 
      SET completed_deliveries = completed_deliveries + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [partnerId]
    );

    await client.query('COMMIT');
    return trackingResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get partner statistics
 */
export async function getPartnerStats(partnerId) {
  const result = await pool.query(
    `SELECT 
      dp.id,
      dp.total_deliveries,
      dp.completed_deliveries,
      dp.rating,
      COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as this_month_completed,
      COUNT(DISTINCT o.id) as this_month_total
    FROM delivery_partners dp
    LEFT JOIN order_tracking ot ON dp.id = ot.delivery_partner_id
    LEFT JOIN orders o ON ot.order_id = o.id 
      AND o.delivered_at >= DATE_TRUNC('month', CURRENT_DATE)
    WHERE dp.id = $1
    GROUP BY dp.id, dp.total_deliveries, dp.completed_deliveries, dp.rating`,
    [partnerId]
  );

  return result.rows[0] || null;
}

/**
 * Get pending deliveries for partner
 */
export async function getPendingDeliveries(partnerId) {
  const result = await pool.query(
    `SELECT 
      o.*,
      u.first_name,
      u.last_name,
      u.phone_number,
      ua.street_address,
      ua.city,
      ua.region,
      ua.gps_address,
      ot.current_location
    FROM orders o
    JOIN order_tracking ot ON o.id = ot.order_id
    JOIN users u ON o.buyer_id = u.id
    LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
    WHERE ot.delivery_partner_id = $1 AND o.status IN ('confirmed', 'processing', 'dispatched')
    ORDER BY o.ordered_at ASC`,
    [partnerId]
  );

  return result.rows;
}
