const Order = require('../models/Order');
const User  = require('../models/User');

const fuelConfig = require('../config/fuelPrices');

// Valid driver-driven status transitions
const DRIVER_STATUSES = ['accepted', 'on_the_way', 'arrived', 'fueling', 'delivered'];

// Populate customer + driver info on an order document
const ORDER_POPULATE = [
  { path: 'userId', select: 'name phone email' },
  { path: 'driverId', select: 'name phone vehicle plateNumber rating' },
];

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

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { fuelType, liters, location, paymentMethod, notes } = req.body;

    const product = fuelConfig.getFuelProducts()[fuelType];
    if (!product) {
      res.status(400);
      throw new Error('Invalid fuel type');
    }

    const pricePerLiter = product.pricePerLiter;
    const serviceFee = fuelConfig.getServiceFee();
    const totalPrice = pricePerLiter * liters + serviceFee;

    const order = await Order.create({
      userId: req.user._id,
      fuelType,
      liters,
      pricePerLiter,
      totalPrice,
      serviceFee: serviceFee,
      location,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
    });

    // Notify all online drivers of the new order (only if cash)
    if (order.paymentMethod === 'cash') {
      await order.populate('userId', 'name phone email');
      const io = req.app.get('io');
      if (io) io.to('drivers').emit('new_order', order);
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user._id })
      .populate('driverId', 'name phone vehicle plateNumber rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (order owner or assigned driver)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(ORDER_POPULATE);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const isOwner = order.userId?._id?.toString() === req.user._id.toString();
    const isAssignedDriver =
      order.driverId?._id?.toString() === req.user._id.toString();

    if (!isOwner && !isAssignedDriver) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (!['pending', 'accepted'].includes(order.status)) {
      res.status(400);
      throw new Error('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    await order.save();
    await order.populate(ORDER_POPULATE);

    emitOrderUpdate(req, order);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fuel prices
// @route   GET /api/orders/prices
// @access  Public
const getFuelPrices = async (req, res) => {
  const products = fuelConfig.getFuelProducts();
  const serviceFee = fuelConfig.getServiceFee();
  
  res.json({
    success: true,
    data: Object.entries(products).map(([type, info]) => ({
      fuelType: type,
      name: info.name,
      ron: info.ron,
      pricePerLiter: info.pricePerLiter,
      serviceFee: serviceFee,
      currency: 'IDR',
    })),
  });
};

// ===================== DRIVER ENDPOINTS =====================

// @desc    Get available orders (pending & unassigned)
// @route   GET /api/orders/available
// @access  Private/Driver
const getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 
      status: 'pending', 
      driverId: null,
      $or: [
        { paymentMethod: 'cash' },
        { paymentStatus: 'paid' }
      ]
    })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders assigned to the logged-in driver
// @route   GET /api/orders/driver
// @access  Private/Driver
const getDriverOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ driverId: req.user._id })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Driver accepts an order
// @route   PUT /api/orders/:id/accept
// @access  Private/Driver
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.driverId) {
      res.status(400);
      throw new Error('Order already taken by another driver');
    }
    if (order.status !== 'pending') {
      res.status(400);
      throw new Error('Order is no longer available');
    }

    order.driverId = req.user._id;
    order.status = 'accepted';
    await order.save();
    await order.populate(ORDER_POPULATE);

    emitOrderUpdate(req, order);

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Driver updates an order's status
// @route   PUT /api/orders/:id/status
// @access  Private/Driver
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!DRIVER_STATUSES.includes(status)) {
      res.status(400);
      throw new Error('Invalid order status');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (!order.driverId || order.driverId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }
    if (['delivered', 'cancelled'].includes(order.status)) {
      res.status(400);
      throw new Error('Order is already finished');
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }
    await order.save();
    await order.populate(ORDER_POPULATE);

    emitOrderUpdate(req, order);

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer rates a delivered order (1–5 stars + optional comment)
// @route   POST /api/orders/:id/rating
// @access  Private/Customer
const rateOrder = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const stars = parseInt(rating);

    if (!stars || stars < 1 || stars > 5) {
      res.status(400);
      throw new Error('Rating harus antara 1 dan 5');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order tidak ditemukan');
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Bukan pesanan Anda');
    }
    if (order.status !== 'delivered') {
      res.status(400);
      throw new Error('Hanya pesanan selesai yang dapat diberi rating');
    }
    if (order.rating !== null && order.rating !== undefined) {
      res.status(400);
      throw new Error('Anda sudah memberi rating untuk pesanan ini');
    }
    if (!order.driverId) {
      res.status(400);
      throw new Error('Pesanan tidak memiliki driver');
    }

    // Save rating on order
    order.rating = stars;
    order.ratingComment = comment?.trim() || null;
    order.ratedAt = new Date();
    await order.save();

    // Recalculate driver's average rating
    const driver = await User.findById(order.driverId);
    if (driver) {
      const oldCount = driver.ratingCount || 0;
      const oldAvg   = driver.rating || 5;
      const newCount = oldCount + 1;
      // Weighted average: keep at most 2 decimals
      const newAvg   = Math.round(((oldAvg * oldCount) + stars) / newCount * 10) / 10;
      driver.rating      = Math.min(5, Math.max(0, newAvg));
      driver.ratingCount = newCount;
      await driver.save();
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        rating: order.rating,
        ratingComment: order.ratingComment,
        ratedAt: order.ratedAt,
        driverRating: driver?.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFuelPrices,
  getAvailableOrders,
  getDriverOrders,
  acceptOrder,
  updateOrderStatus,
  rateOrder,
};
