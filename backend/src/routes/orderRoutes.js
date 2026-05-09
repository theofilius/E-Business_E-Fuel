const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFuelPrices,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route GET /api/orders/prices (public)
router.get('/prices', getFuelPrices);

// @route POST /api/orders
router.post(
  '/',
  protect,
  [
    body('fuelType')
      .isIn(['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Solar', 'Dexlite'])
      .withMessage('Invalid fuel type'),
    body('liters')
      .isFloat({ min: 1, max: 200 })
      .withMessage('Liters must be between 1 and 200'),
    body('location.address').notEmpty().withMessage('Delivery address is required'),
    body('location.coordinates.lat').isFloat().withMessage('Valid latitude is required'),
    body('location.coordinates.lng').isFloat().withMessage('Valid longitude is required'),
  ],
  validate,
  createOrder
);

// @route GET /api/orders
router.get('/', protect, getMyOrders);

// @route GET /api/orders/:id
router.get('/:id', protect, getOrderById);

// @route PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
