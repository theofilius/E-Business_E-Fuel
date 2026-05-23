const { body } = require('express-validator');

// Validation rules for creating an order
const createOrderRules = [
  body('fuelType')
    .isString()
    .isIn(['IGNITE', 'BLAZE', 'QUANTUM', 'DIESEL'])
    .withMessage('Jenis bensin tidak valid. Pilih: IGNITE, BLAZE, QUANTUM, atau DIESEL'),
  body('liters')
    .isInt({ min: 1, max: 200 })
    .withMessage('Jumlah liter harus antara 1 sampai 200'),
  body('location.address')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Alamat pengiriman wajib diisi'),
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude tidak valid'),
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude tidak valid'),
  body('paymentMethod')
    .optional()
    .isString()
    .isIn(['cash', 'dana', 'ovo', 'gopay', 'shopeepay', 'qris', 'bca', 'bni', 'mandiri', 'bri'])
    .withMessage('Metode pembayaran tidak valid'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Catatan maksimal 500 karakter'),
];

// Validation rules for register
const registerRules = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2 sampai 100 karakter'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password minimal 6 karakter'),
  body('phone')
    .optional()
    .isString()
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Nomor telepon tidak valid'),
];

// Validation rules for login
const loginRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi'),
];

// Validation rules for updating fuel price
const updateFuelPriceRules = [
  body('pricePerLiter')
    .optional()
    .isFloat({ min: 1000, max: 50000 })
    .withMessage('Harga per liter harus antara Rp 1.000 sampai Rp 50.000'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nama produk harus antara 2 sampai 50 karakter'),
];

// Validation rules for updating order status
const updateStatusRules = [
  body('status')
    .isString()
    .isIn(['accepted', 'on_the_way', 'arrived', 'fueling', 'delivered'])
    .withMessage('Status pesanan tidak valid'),
];

module.exports = {
  createOrderRules,
  registerRules,
  loginRules,
  updateFuelPriceRules,
  updateStatusRules,
};
