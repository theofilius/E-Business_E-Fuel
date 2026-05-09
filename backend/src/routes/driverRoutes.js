const express = require('express');
const { body } = require('express-validator');
const {
  getAvailableDrivers,
  getDriverById,
  createDriver,
  updateDriverLocation,
} = require('../controllers/driverController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route GET /api/drivers
router.get('/', protect, getAvailableDrivers);

// @route GET /api/drivers/:id
router.get('/:id', protect, getDriverById);

// @route POST /api/drivers (admin only)
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Driver name is required'),
    body('vehicle').trim().notEmpty().withMessage('Vehicle type is required'),
    body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  createDriver
);

// @route PUT /api/drivers/:id/location
router.put(
  '/:id/location',
  protect,
  [
    body('longitude').isFloat().withMessage('Valid longitude is required'),
    body('latitude').isFloat().withMessage('Valid latitude is required'),
  ],
  validate,
  updateDriverLocation
);

module.exports = router;
