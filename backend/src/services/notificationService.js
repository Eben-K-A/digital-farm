import pool from '../config/database.js';

/**
 * Send notification to user
 */
export async function sendNotification(userId, notificationData) {
  const {
    type,
    title,
    message,
    related_resource_type,
    related_resource_id,
  } = notificationData;

  if (!type || !title) {
    throw new Error('type and title are required');
  }

  const result = await pool.query(
    `INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_resource_type,
      related_resource_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [userId, type, title, message, related_resource_type, related_resource_id]
  );

  return result.rows[0];
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(userIds, notificationData) {
  const notifications = [];

  for (const userId of userIds) {
    const notification = await sendNotification(userId, notificationData);
    notifications.push(notification);
  }

  return notifications;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
}

/**
 * Count user notifications
 */
export async function countUserNotifications(userId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1',
    [userId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, userId) {
  const result = await pool.query(
    `UPDATE notifications 
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Notification not found');
  }

  return result.rows[0];
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId) {
  await pool.query(
    `UPDATE notifications 
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );

  return true;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId, userId) {
  const result = await pool.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Notification not found');
  }

  return true;
}

/**
 * Notification templates
 */
const notificationTemplates = {
  ORDER_PLACED: {
    type: 'order',
    title: 'Order Placed',
    message: 'Your order #{orderNumber} has been placed successfully',
  },
  ORDER_CONFIRMED: {
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #{orderNumber} has been confirmed by the farmers',
  },
  ORDER_PROCESSING: {
    type: 'order',
    title: 'Order Processing',
    message: 'Your order #{orderNumber} is being prepared',
  },
  ORDER_DISPATCHED: {
    type: 'delivery',
    title: 'Order Dispatched',
    message: 'Your order #{orderNumber} is on the way',
  },
  ORDER_DELIVERED: {
    type: 'delivery',
    title: 'Order Delivered',
    message: 'Your order #{orderNumber} has been delivered',
  },
  PAYMENT_RECEIVED: {
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of ₵{amount} for order #{orderNumber} has been received',
  },
  PAYMENT_FAILED: {
    type: 'payment',
    title: 'Payment Failed',
    message: 'Payment for order #{orderNumber} failed. Please try again',
  },
  VERIFICATION_APPROVED: {
    type: 'verification',
    title: 'Verification Approved',
    message: 'Your farmer account verification has been approved',
  },
  VERIFICATION_REJECTED: {
    type: 'verification',
    title: 'Verification Rejected',
    message: 'Your farmer account verification was rejected: {reason}',
  },
  PRODUCT_REVIEW: {
    type: 'review',
    title: 'New Review',
    message: 'Someone left a review on your product: {productName}',
  },
  LOW_STOCK_ALERT: {
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'Your product {productName} is running low on stock',
  },
};

/**
 * Send order notification
 */
export async function sendOrderNotification(orderId, status, userId, additionalData = {}) {
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1',
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    throw new Error('Order not found');
  }

  const order = orderResult.rows[0];
  const templateKey = `ORDER_${status.toUpperCase()}`;
  const template = notificationTemplates[templateKey];

  if (!template) {
    throw new Error(`Unknown order status: ${status}`);
  }

  let message = template.message.replace('{orderNumber}', order.order_number);
  message = message.replace('{amount}', additionalData.amount || '');

  return sendNotification(userId, {
    type: template.type,
    title: template.title,
    message,
    related_resource_type: 'order',
    related_resource_id: orderId,
  });
}

/**
 * Send email notification
 */
export async function sendEmailNotification(email, subject, templateName, templateData = {}) {
  const result = await pool.query(
    `INSERT INTO email_logs (
      recipient_email,
      template,
      subject,
      status
    ) VALUES ($1, $2, $3, 'pending')
    RETURNING *`,
    [email, templateName, subject]
  );

  // In a real implementation, this would queue the email for processing
  // For now, we just log the intent

  return result.rows[0];
}

/**
 * Mark email as sent
 */
export async function markEmailSent(emailLogId) {
  const result = await pool.query(
    `UPDATE email_logs 
    SET status = 'sent', sent_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`,
    [emailLogId]
  );

  return result.rows[0];
}

/**
 * Get pending emails
 */
export async function getPendingEmails(limit = 100) {
  const result = await pool.query(
    `SELECT * FROM email_logs 
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT $1`,
    [limit]
  );

  return result.rows;
}

/**
 * Notify farmers about new review
 */
export async function notifyFarmerReview(productId, reviewRating, reviewComment) {
  const productResult = await pool.query(
    'SELECT farmer_id FROM products WHERE id = $1',
    [productId]
  );

  if (productResult.rows.length === 0) {
    return;
  }

  const farmerResult = await pool.query(
    'SELECT user_id FROM farmers WHERE id = $1',
    [productResult.rows[0].farmer_id]
  );

  if (farmerResult.rows.length === 0) {
    return;
  }

  const template = notificationTemplates.PRODUCT_REVIEW;

  await sendNotification(farmerResult.rows[0].user_id, {
    type: template.type,
    title: template.title,
    message: template.message,
    related_resource_type: 'product',
    related_resource_id: productId,
  });
}

/**
 * Notify on low stock
 */
export async function notifyLowStock(productId, warehouseId) {
  const productResult = await pool.query(
    'SELECT farmer_id, name FROM products WHERE id = $1',
    [productId]
  );

  if (productResult.rows.length === 0) {
    return;
  }

  const farmerResult = await pool.query(
    'SELECT user_id FROM farmers WHERE id = $1',
    [productResult.rows[0].farmer_id]
  );

  if (farmerResult.rows.length === 0) {
    return;
  }

  const template = notificationTemplates.LOW_STOCK_ALERT;
  let message = template.message.replace('{productName}', productResult.rows[0].name);

  await sendNotification(farmerResult.rows[0].user_id, {
    type: template.type,
    title: template.title,
    message,
    related_resource_type: 'product',
    related_resource_id: productId,
  });
}
