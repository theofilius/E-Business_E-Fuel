const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFuelPrices,
  getAvailableOrders,
  getDriverOrders,
  acceptOrder,
  updateOrderStatus,
  rateOrder,
} = require('../controllers/orderController');
const { protect, driverOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ===== Public =====
router.get('/prices', getFuelPrices);

// ===== Driver-only (must come before /:id routes) =====
router.get('/available', protect, driverOnly, getAvailableOrders);
router.get('/driver', protect, driverOnly, getDriverOrders);
router.put('/:id/accept', protect, driverOnly, acceptOrder);
router.put(
  '/:id/status',
  protect,
  driverOnly,
  [
    body('status')
      .isIn(['accepted', 'on_the_way', 'arrived', 'fueling', 'delivered'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateOrderStatus
);

// ===== Customer =====
router.post(
  '/',
  protect,
  [
    body('fuelType')
      .isIn(['IGNITE', 'BLAZE', 'QUANTUM', 'DIESEL'])
      .withMessage('Invalid fuel type'),
    body('liters')
      .isFloat({ min: 1, max: 200 })
      .withMessage('Liters must be between 1 and 200'),
    body('location.address').notEmpty().withMessage('Delivery address is required'),
    body('location.coordinates.lat').isFloat().withMessage('Valid latitude is required'),
    body('location.coordinates.lng').isFloat().withMessage('Valid longitude is required'),
    body('paymentMethod').optional().isIn(['cash', 'dana', 'ovo', 'gopay', 'shopeepay', 'qris', 'bca', 'bni', 'mandiri', 'bri']).withMessage('Invalid payment method'),
  ],
  validate,
  createOrder
);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.post(
  '/:id/rating',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1 dan 5'),
    body('comment').optional().isString().isLength({ max: 200 }),
  ],
  validate,
  rateOrder
);

module.exports = router;
