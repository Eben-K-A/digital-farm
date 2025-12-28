import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  addInventory,
  removeInventory,
  getWarehouseInventory,
  getWarehouseInventoryCount,
  getLowStockItems,
  getStockMovements,
  countStockMovements,
  getWarehouseStats,
  searchInventory,
} from '../services/warehouseService.js';

const router = express.Router();

/**
 * POST /api/v1/warehouse/locations
 * Create warehouse location
 */
router.post('/locations', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { name, location, region, capacity, manager_id } = req.body;

  if (!name || !location || !region) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'name, location, and region are required',
      },
    });
  }

  const warehouse = await createWarehouse({
    name,
    location,
    region,
    capacity: capacity ? parseInt(capacity) : null,
    manager_id,
  });

  res.status(201).json({
    success: true,
    data: warehouse,
    message: 'Warehouse created successfully',
  });
}));

/**
 * GET /api/v1/warehouse/locations
 * Get all warehouses
 */
router.get('/locations', asyncHandler(async (req, res) => {
  const { region, is_active } = req.query;

  const warehouses = await getWarehouses({
    region,
    is_active: is_active === 'false' ? false : true,
  });

  res.json({
    success: true,
    data: warehouses,
    count: warehouses.length,
  });
}));

/**
 * GET /api/v1/warehouse/locations/:id
 * Get warehouse details
 */
router.get('/locations/:id', asyncHandler(async (req, res) => {
  const warehouse = await getWarehouseById(req.params.id);

  res.json({
    success: true,
    data: warehouse,
  });
}));

/**
 * PUT /api/v1/warehouse/locations/:id
 * Update warehouse
 */
router.put('/locations/:id', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
  const warehouse = await updateWarehouse(req.params.id, req.body);

  res.json({
    success: true,
    data: warehouse,
    message: 'Warehouse updated successfully',
  });
}));

/**
 * POST /api/v1/warehouse/inventory/add
 * Add inventory
 */
router.post('/inventory/add', authenticate, requireRole(['admin', 'warehouse']), asyncHandler(async (req, res) => {
  const { warehouse_id, product_id, quantity } = req.body;

  if (!warehouse_id || !product_id || !quantity) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'warehouse_id, product_id, and quantity are required',
      },
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be greater than 0',
      },
    });
  }

  try {
    await addInventory(warehouse_id, product_id, parseInt(quantity));

    res.json({
      success: true,
      message: `Added ${quantity} units to inventory`,
    });
  } catch (error) {
    throw error;
  }
}));

/**
 * POST /api/v1/warehouse/inventory/remove
 * Remove inventory
 */
router.post('/inventory/remove', authenticate, requireRole(['admin', 'warehouse']), asyncHandler(async (req, res) => {
  const { warehouse_id, product_id, quantity, reason } = req.body;

  if (!warehouse_id || !product_id || !quantity) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'warehouse_id, product_id, and quantity are required',
      },
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be greater than 0',
      },
    });
  }

  try {
    await removeInventory(warehouse_id, product_id, parseInt(quantity), reason);

    res.json({
      success: true,
      message: `Removed ${quantity} units from inventory`,
    });
  } catch (error) {
    if (error.message.includes('Insufficient')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_INVENTORY',
          message: error.message,
        },
      });
    }
    throw error;
  }
}));

/**
 * GET /api/v1/warehouse/:id/inventory
 * Get warehouse inventory
 */
router.get('/:id/inventory', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const inventory = await getWarehouseInventory(req.params.id, parseInt(page), parseInt(limit));
  const total = await getWarehouseInventoryCount(req.params.id);

  res.json({
    success: true,
    data: inventory,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/warehouse/:id/low-stock
 * Get low stock items
 */
router.get('/:id/low-stock', asyncHandler(async (req, res) => {
  const items = await getLowStockItems(req.params.id);

  res.json({
    success: true,
    data: items,
    count: items.length,
  });
}));

/**
 * GET /api/v1/warehouse/:id/movements
 * Get stock movements
 */
router.get('/:id/movements', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const movements = await getStockMovements(req.params.id, parseInt(page), parseInt(limit));
  const total = await countStockMovements(req.params.id);

  res.json({
    success: true,
    data: movements,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

/**
 * GET /api/v1/warehouse/:id/stats
 * Get warehouse statistics
 */
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const stats = await getWarehouseStats(req.params.id);

  res.json({
    success: true,
    data: stats,
  });
}));

/**
 * GET /api/v1/warehouse/:id/inventory/search
 * Search inventory
 */
router.get('/:id/inventory/search', asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Search query (q) is required',
      },
    });
  }

  const results = await searchInventory(req.params.id, q, parseInt(limit));

  res.json({
    success: true,
    data: results,
    count: results.length,
  });
}));

export default router;
