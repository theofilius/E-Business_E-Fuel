const express = require('express');
const {
  getStats,
  getAllOrders,
  getAdminFuelPrices,
  updateFuelPrice,
  updateServiceFee,
  getAllDrivers,
} = require('../controllers/adminController');
const { getAllRefunds, processRefund } = require('../controllers/refundController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.get('/fuel-prices', getAdminFuelPrices);
router.put('/fuel-prices/service-fee', updateServiceFee); // Important: put this before /:fuelType
router.put('/fuel-prices/:fuelType', updateFuelPrice);
router.get('/drivers', getAllDrivers);
router.get('/refunds', getAllRefunds);
router.patch('/refunds/:id', processRefund);

module.exports = router;
