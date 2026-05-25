const RefundRequest = require('../models/RefundRequest');
const Order = require('../models/Order');

// ─── POST /api/refunds ───────────────────────────────────────────────────────
// Customer submits a refund request for one of their orders.
const createRefund = async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;
    const userId = req.user._id;

    // 1. Order must exist and belong to this user
    const order = await Order.findById(orderId).populate('driverId', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Bukan order Anda' });
    }

    // 2. Prevent duplicate
    const existing = await RefundRequest.findOne({ orderId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Refund untuk order ini sudah pernah diajukan',
        data: existing,
      });
    }

    // 3. Build snapshot
    const driverName = order.driverId?.name || null;

    const refund = await RefundRequest.create({
      orderId,
      userId,
      reason,
      description: description || '',
      amount: order.totalPrice,
      driverName,
      fuelType: order.fuelType,
      liters: order.liters,
    });

    res.status(201).json({ success: true, data: refund });
  } catch (err) {
    console.error('createRefund error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/refunds/my ─────────────────────────────────────────────────────
// Returns all refund requests for the logged-in user.
const getMyRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderId', 'fuelType liters totalPrice createdAt');

    res.json({ success: true, data: refunds });
  } catch (err) {
    console.error('getMyRefunds error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/refunds ──────────────────────────────────────────────────
// Admin: list all refund requests (lightweight – just the list, no management).
const getAllRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('orderId', 'fuelType liters totalPrice');

    res.json({ success: true, count: refunds.length, data: refunds });
  } catch (err) {
    console.error('getAllRefunds error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRefund, getMyRefunds, getAllRefunds };
