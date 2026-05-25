const express = require('express');
const { body } = require('express-validator');
const { createRefund, getMyRefunds } = require('../controllers/refundController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/refunds
router.post(
  '/',
  protect,
  [
    body('orderId').notEmpty().withMessage('orderId wajib diisi'),
    body('reason')
      .isIn([
        'Bensin Tidak Datang Lebih dari 15 Menit',
        'Volume Tidak Sesuai',
        'Jenis BBM Tidak Sesuai',
        'Lainnya',
      ])
      .withMessage('Alasan refund tidak valid'),
    body('description').optional().isString(),
  ],
  validate,
  createRefund
);

// GET /api/refunds/my
router.get('/my', protect, getMyRefunds);

module.exports = router;
