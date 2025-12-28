import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  registerDeliveryPartner,
  getDeliveryPartnerProfile,
  updateDeliveryPartnerStatus,
  getAvailableDeliveryPartners,
  assignOrderToPartner,
  createDeliveryRoute,
  getDeliveryRoutes,
  getRouteWaypoints,
  updateWaypointStatus,
  updatePartnerLocation,
  completeDelivery,
  getPartnerStats,
  getPendingDeliveries,
} from '../services/deliveryService.js';

const router = express.Router();

/**
 * POST /api/v1/delivery/register
 * Register as delivery partner
 */
router.post('/register', authenticate, asyncHandler(async (req, res) => {
  const { vehicle_type, vehicle_registration, license_number } = req.body;

  if (!vehicle_type || !vehicle_registration || !license_number) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'vehicle_type, vehicle_registration, and license_number are required',
      },
    });
  }

  const partner = await registerDeliveryPartner(req.user.user_id, {
    vehicle_type,
    vehicle_registration,
    license_number,
  });

  res.status(201).json({
    success: true,
    data: partner,
    message: 'Registered as delivery partner. Awaiting verification.',
  });
}));

/**
 * GET /api/v1/delivery/profile
 * Get delivery partner profile
 */
router.get('/profile', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const profile = await getDeliveryPartnerProfile(req.user.user_id);

  res.json({
    success: true,
    data: profile,
  });
}));

/**
 * PUT /api/v1/delivery/status
 * Update availability status
 */
router.put('/status', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const { is_available } = req.body;

  if (is_available === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'is_available is required',
      },
    });
  }

  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const updated = await updateDeliveryPartnerStatus(partner.id, is_available);

  res.json({
    success: true,
    data: updated,
    message: `Status updated to ${is_available ? 'available' : 'unavailable'}`,
  });
}));

/**
 * GET /api/v1/delivery/available
 * Get available delivery partners
 */
router.get('/available', asyncHandler(async (req, res) => {
  const partners = await getAvailableDeliveryPartners();

  res.json({
    success: true,
    data: partners,
    count: partners.length,
  });
}));

/**
 * POST /api/v1/delivery/assign
 * Assign order to delivery partner (admin)
 */
router.post('/assign', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { order_id, partner_id } = req.body;

  if (!order_id || !partner_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'order_id and partner_id are required',
      },
    });
  }

  const tracking = await assignOrderToPartner(order_id, partner_id);

  res.json({
    success: true,
    data: tracking,
    message: 'Order assigned to delivery partner',
  });
}));

/**
 * POST /api/v1/delivery/routes
 * Create delivery route
 */
router.post('/routes', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const { route_name, start_location, end_location, estimated_distance, estimated_duration_minutes } = req.body;

  if (!route_name || !start_location || !end_location) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'route_name, start_location, and end_location are required',
      },
    });
  }

  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const route = await createDeliveryRoute(partner.id, {
    route_name,
    start_location,
    end_location,
    estimated_distance: parseFloat(estimated_distance),
    estimated_duration_minutes: parseInt(estimated_duration_minutes),
  });

  res.status(201).json({
    success: true,
    data: route,
    message: 'Route created successfully',
  });
}));

/**
 * GET /api/v1/delivery/routes
 * Get delivery routes
 */
router.get('/routes', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const { status } = req.query;

  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const routes = await getDeliveryRoutes(partner.id, status);

  res.json({
    success: true,
    data: routes,
    count: routes.length,
  });
}));

/**
 * GET /api/v1/delivery/routes/:id/waypoints
 * Get route waypoints
 */
router.get('/routes/:id/waypoints', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const waypoints = await getRouteWaypoints(req.params.id);

  res.json({
    success: true,
    data: waypoints,
    count: waypoints.length,
  });
}));

/**
 * PUT /api/v1/delivery/waypoints/:id
 * Update waypoint status
 */
router.put('/waypoints/:id', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const { arrived, departed } = req.body;

  const waypoint = await updateWaypointStatus(req.params.id, arrived, departed);

  res.json({
    success: true,
    data: waypoint,
    message: 'Waypoint updated',
  });
}));

/**
 * PUT /api/v1/delivery/location
 * Update delivery partner location
 */
router.put('/location', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'latitude and longitude are required',
      },
    });
  }

  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const updated = await updatePartnerLocation(partner.id, latitude, longitude);

  res.json({
    success: true,
    data: updated,
    message: 'Location updated',
  });
}));

/**
 * POST /api/v1/delivery/complete/:orderId
 * Complete delivery
 */
router.post('/complete/:orderId', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const tracking = await completeDelivery(req.params.orderId, partner.id);

  res.json({
    success: true,
    data: tracking,
    message: 'Delivery completed',
  });
}));

/**
 * GET /api/v1/delivery/stats
 * Get partner statistics
 */
router.get('/stats', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const stats = await getPartnerStats(partner.id);

  res.json({
    success: true,
    data: stats,
  });
}));

/**
 * GET /api/v1/delivery/pending
 * Get pending deliveries
 */
router.get('/pending', authenticate, requireRole(['delivery']), asyncHandler(async (req, res) => {
  const partner = await getDeliveryPartnerProfile(req.user.user_id);
  const deliveries = await getPendingDeliveries(partner.id);

  res.json({
    success: true,
    data: deliveries,
    count: deliveries.length,
  });
}));

export default router;
