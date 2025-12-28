import pool from '../config/database.js';

/**
 * Create payment transaction
 */
export async function createPaymentTransaction(transactionData) {
  const {
    order_id,
    user_id,
    amount,
    currency = 'GHS',
    payment_method,
    customer_phone,
    customer_name,
  } = transactionData;

  if (!order_id || !user_id || !amount || !payment_method) {
    throw new Error('Missing required fields');
  }

  const result = await pool.query(
    `INSERT INTO payment_transactions (
      order_id,
      user_id,
      amount,
      currency,
      payment_method,
      customer_phone,
      customer_name,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
    RETURNING *`,
    [order_id, user_id, amount, currency, payment_method, customer_phone, customer_name]
  );

  return result.rows[0];
}

/**
 * Get payment transaction
 */
export async function getPaymentTransaction(transactionId) {
  const result = await pool.query(
    'SELECT * FROM payment_transactions WHERE id = $1',
    [transactionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Payment transaction not found');
  }

  return result.rows[0];
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(transactionId, status, providerTransactionId = null) {
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  let query = 'UPDATE payment_transactions SET status = $1, updated_at = CURRENT_TIMESTAMP';
  const params = [status, transactionId];
  let paramIndex = 3;

  if (providerTransactionId) {
    query += `, provider_transaction_id = $${paramIndex}`;
    params.push(providerTransactionId);
    paramIndex++;
  }

  if (status === 'completed') {
    query += `, completed_at = CURRENT_TIMESTAMP`;
  }

  query += ` WHERE id = $2 RETURNING *`;
  params[1] = transactionId;

  const result = await pool.query(query, [status, transactionId, providerTransactionId]);

  if (result.rows.length === 0) {
    throw new Error('Payment transaction not found');
  }

  return result.rows[0];
}

/**
 * Get payment transactions for order
 */
export async function getOrderPayments(orderId) {
  const result = await pool.query(
    'SELECT * FROM payment_transactions WHERE order_id = $1 ORDER BY created_at DESC',
    [orderId]
  );

  return result.rows;
}

/**
 * Get user payment methods
 */
export async function getUserPaymentMethods(userId) {
  const result = await pool.query(
    `SELECT * FROM payment_methods 
    WHERE user_id = $1 AND is_active = TRUE
    ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * Add payment method
 */
export async function addPaymentMethod(userId, methodData) {
  const {
    payment_type,
    phone_number,
    account_name,
    is_default = false,
  } = methodData;

  if (!payment_type || !phone_number || !account_name) {
    throw new Error('Missing required fields');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If setting as default, unset other defaults
    if (is_default) {
      await client.query(
        'UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const result = await client.query(
      `INSERT INTO payment_methods (
        user_id,
        payment_type,
        phone_number,
        account_name,
        is_default
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, payment_type, phone_number, account_name, is_default]
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
 * Update payment method
 */
export async function updatePaymentMethod(methodId, userId, updates) {
  const allowedFields = ['phone_number', 'account_name', 'is_default', 'is_active'];

  const validUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  if (Object.keys(validUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If setting as default, unset other defaults
    if (validUpdates.is_default === true) {
      await client.query(
        'UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1 AND id != $2',
        [userId, methodId]
      );
    }

    const setClause = Object.keys(validUpdates)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = [methodId, userId, ...Object.values(validUpdates)];

    const result = await client.query(
      `UPDATE payment_methods SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
      values
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      throw new Error('Payment method not found');
    }

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(methodId, userId) {
  const result = await pool.query(
    'UPDATE payment_methods SET is_active = FALSE WHERE id = $1 AND user_id = $2 RETURNING id',
    [methodId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Payment method not found');
  }

  return true;
}

/**
 * Initiate mobile money payment
 */
export async function initiateMobileMoneyPayment(transactionId, provider) {
  const transaction = await getPaymentTransaction(transactionId);

  // This is a simplified implementation
  // In production, integrate with actual payment gateway (Stripe, Paystack, etc)
  const paymentData = {
    amount: transaction.amount,
    currency: transaction.currency,
    customer_phone: transaction.customer_phone,
    customer_name: transaction.customer_name,
    order_id: transaction.order_id,
    provider,
  };

  // Update transaction status to processing
  await updatePaymentStatus(transactionId, 'processing');

  return {
    status: 'initiated',
    payment_reference: `${provider.toUpperCase()}-${transactionId.substring(0, 8)}`,
    data: paymentData,
  };
}

/**
 * Process payment callback
 */
export async function processPaymentCallback(transactionId, status, providerRef) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const transaction = await getPaymentTransaction(transactionId);

    if (status === 'success') {
      // Update payment transaction
      await client.query(
        `UPDATE payment_transactions 
        SET status = 'completed', provider_transaction_id = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [providerRef, transactionId]
      );

      // Update order payment status
      await client.query(
        `UPDATE orders SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [transaction.order_id]
      );
    } else if (status === 'failed') {
      await client.query(
        'UPDATE payment_transactions SET status = \'failed\' WHERE id = $1',
        [transactionId]
      );
    }

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
 * Get payment analytics
 */
export async function getPaymentAnalytics(days = 30) {
  const result = await pool.query(
    `SELECT 
      DATE(completed_at) as date,
      COUNT(*) as transactions,
      SUM(amount) as total_amount,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
    FROM payment_transactions
    WHERE completed_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(completed_at)
    ORDER BY date DESC`
  );

  return result.rows;
}

/**
 * Get payment summary for user
 */
export async function getUserPaymentSummary(userId) {
  const result = await pool.query(
    `SELECT 
      COUNT(*) as total_transactions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'pending' OR status = 'processing' THEN amount ELSE 0 END) as pending_amount
    FROM payment_transactions
    WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || {
    total_transactions: 0,
    successful: 0,
    failed: 0,
    total_paid: 0,
    pending_amount: 0,
  };
}
