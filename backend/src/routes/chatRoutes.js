const express = require('express');
const fs      = require('fs');
const multer  = require('multer');
const path    = require('path');
const { getMessages, sendMessage, uploadImage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const chatUploadDir = path.join(__dirname, '../../uploads/chat');

fs.mkdirSync(chatUploadDir, { recursive: true });

// ─── Multer: store chat images on disk ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: chatUploadDir,
  filename: (req, file, cb) => {
    const originalName = path.basename(file.originalname || 'image');
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
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

const uploadChatImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();

    const message =
      err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran gambar maksimal 5 MB'
        : err.message || 'Gagal upload gambar';

    return res.status(400).json({ success: false, message });
  });
};

// GET  /api/chat/orders/:orderId/messages
router.get('/orders/:orderId/messages', protect, getMessages);

// POST /api/chat/orders/:orderId/messages
router.post('/orders/:orderId/messages', protect, sendMessage);

// POST /api/chat/orders/:orderId/upload
router.post('/orders/:orderId/upload', protect, uploadChatImage, uploadImage);

module.exports = router;
