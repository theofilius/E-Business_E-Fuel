const Order = require('../models/Order');

// Fuel prices in IDR (Indonesian Rupiah)
const FUEL_PRICES = {
  Pertalite: 10000,
  Pertamax: 14500,
  'Pertamax Turbo': 15900,
  Solar: 6800,
  Dexlite: 14550,
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { fuelType, liters, location, paymentMethod, notes } = req.body;

    const pricePerLiter = FUEL_PRICES[fuelType];
    if (!pricePerLiter) {
      res.status(400);
      throw new Error('Invalid fuel type');
    }

    const serviceFee = 5000;
    const totalPrice = pricePerLiter * liters + serviceFee;

    const order = await Order.create({
      userId: req.user._id,
      fuelType,
      liters,
      pricePerLiter,
      totalPrice,
      serviceFee,
      location,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
    });

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
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('driverId', 'name phone vehicle plateNumber rating avatar')
      .populate('userId', 'name email phone');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if order belongs to user
    if (order.userId._id.toString() !== req.user._id.toString()) {
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
  res.json({
    success: true,
    data: Object.entries(FUEL_PRICES).map(([type, price]) => ({
      fuelType: type,
      pricePerLiter: price,
      currency: 'IDR',
    })),
  });
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getFuelPrices };
