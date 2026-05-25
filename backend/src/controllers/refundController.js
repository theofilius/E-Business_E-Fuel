const RefundRequest = require('../models/RefundRequest');
const Order = require('../models/Order');

// ─── POST /api/refunds ────────────────────────────────────────────────────────
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

    // 2. Prevent duplicate (skip if previously rejected — allow re-submit)
    const existing = await RefundRequest.findOne({ orderId });
    if (existing && existing.status !== 'rejected') {
      return res.status(409).json({
        success: false,
        message: 'Refund untuk order ini sudah pernah diajukan',
        data: existing,
      });
    }

    // 3. If previously rejected, delete old record so user can re-submit
    if (existing && existing.status === 'rejected') {
      await RefundRequest.deleteOne({ _id: existing._id });
    }

    // 4. Build snapshot
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

// ─── GET /api/refunds/my ──────────────────────────────────────────────────────
// Returns all refund requests for the logged-in user.
const getMyRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderId', 'fuelType liters totalPrice createdAt status');

    res.json({ success: true, data: refunds });
  } catch (err) {
    console.error('getMyRefunds error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/refunds ───────────────────────────────────────────────────
// Admin: list all refund requests.
const getAllRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('orderId', 'fuelType liters totalPrice status createdAt')
      .populate('processedBy', 'name');

    res.json({ success: true, count: refunds.length, data: refunds });
  } catch (err) {
    console.error('getAllRefunds error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/admin/refunds/:id ────────────────────────────────────────────
// Admin approves or rejects a refund request.
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus approved atau rejected',
      });
    }

    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request tidak ditemukan' });
    }
    if (refund.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Refund sudah diproses (status: ${refund.status})`,
      });
    }

    // Update refund
    refund.status = status;
    refund.adminNote = adminNote || null;
    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    await refund.save();

    // Re-populate for response
    await refund.populate('userId', 'name email');
    await refund.populate('orderId', 'fuelType liters totalPrice status');
    await refund.populate('processedBy', 'name');

    res.json({ success: true, data: refund });
  } catch (err) {
    console.error('processRefund error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRefund, getMyRefunds, getAllRefunds, processRefund };
