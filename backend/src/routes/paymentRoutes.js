const express = require('express');
const {
  initiatePayment,
  confirmPayment,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All payment routes are protected
router.use(protect);

router.post('/:orderId/initiate', initiatePayment);
router.post('/:orderId/confirm', confirmPayment);
router.get('/:orderId/status', getPaymentStatus);

module.exports = router;
