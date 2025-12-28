import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  getUserNotifications,
  countUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const notifications = await getUserNotifications(req.user.user_id, parseInt(page), parseInt(limit));
  const total = await countUserNotifications(req.user.user_id);

  res.json({
    success: true,
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', authenticate, asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user.user_id);

  res.json({
    success: true,
    data: {
      unread_count: count,
    },
  });
}));

/**
 * PUT /api/v1/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticate, asyncHandler(async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.user.user_id);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.user_id);

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
}));

/**
 * DELETE /api/v1/notifications/:id
 * Delete notification
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.user_id);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

export default router;
