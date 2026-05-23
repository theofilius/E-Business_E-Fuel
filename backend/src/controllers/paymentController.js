const crypto = require('crypto');
const Order = require('../models/Order');

// Broadcast an order update to everyone watching that order's room
const emitOrderUpdate = (req, order) => {
  const io = req.app.get('io');
  if (io) {
    io.to(`order:${order._id}`).emit('order_status', {
      orderId: order._id.toString(),
      status: order.status,
      order,
    });
  }
};

// @desc    Initiate payment session (simulate payment gateway)
// @route   POST /api/payments/:orderId/initiate
// @access  Private
const initiatePayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }

    if (order.paymentStatus === 'paid') {
      res.status(400);
      throw new Error('Order is already paid');
    }

    // Simulate 15 minutes expiry
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    
    // Generate simulated payment reference
    const ref = `EFUEL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    order.paymentExpiry = expiry;
    order.paymentRef = ref;
    await order.save();

    res.json({
      success: true,
      data: {
        paymentRef: ref,
        paymentExpiry: expiry,
        qrData: `efuel-payment-${ref}`, // Simulated QR data
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/:orderId/confirm
// @access  Private
const confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }

    if (order.paymentStatus === 'paid') {
      res.status(400);
      throw new Error('Order is already paid');
    }

    if (order.paymentExpiry && new Date() > order.paymentExpiry) {
      res.status(400);
      throw new Error('Payment session expired');
    }

    order.paymentStatus = 'paid';
    await order.save();

    // Populate order details for the broadcast
    await order.populate([
      { path: 'userId', select: 'name phone email' },
      { path: 'driverId', select: 'name phone vehicle plateNumber rating' },
    ]);

    emitOrderUpdate(req, order);

    // Notify drivers that a paid order is available
    const io = req.app.get('io');
    if (io && !order.driverId) {
      io.to('drivers').emit('new_order', order);
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:orderId/status
// @access  Private
const getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).select('paymentStatus paymentExpiry paymentRef');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        paymentExpiry: order.paymentExpiry,
        paymentRef: order.paymentRef,
        isExpired: order.paymentExpiry ? new Date() > order.paymentExpiry : false
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePayment,
  confirmPayment,
  getPaymentStatus,
};
