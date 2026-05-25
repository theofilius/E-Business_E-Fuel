const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { getMessages, sendMessage, uploadImage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Multer: store chat images on disk ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/chat'),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Hanya file gambar yang diizinkan'));
  },
});

// GET  /api/chat/orders/:orderId/messages
router.get('/orders/:orderId/messages', protect, getMessages);

// POST /api/chat/orders/:orderId/messages
router.post('/orders/:orderId/messages', protect, sendMessage);

// POST /api/chat/orders/:orderId/upload
router.post('/orders/:orderId/upload', protect, upload.single('image'), uploadImage);

module.exports = router;
