const User = require('../models/User');
const Order = require('../models/Order');
const fuelConfig = require('../config/fuelPrices');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $in: ['pending', 'accepted', 'on_the_way', 'arrived', 'fueling'] } });
    
    // Calculate total revenue from delivered orders
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const revenue = deliveredOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });

    res.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        revenue,
        totalCustomers,
        totalDrivers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (paginated)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone vehicle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

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

// @desc    Get current fuel prices
// @route   GET /api/admin/fuel-prices
// @access  Private/Admin
const getAdminFuelPrices = async (req, res) => {
  res.json({
    success: true,
    data: {
      products: fuelConfig.getFuelProducts(),
      serviceFee: fuelConfig.getServiceFee(),
    },
  });
};

// @desc    Update a fuel price
// @route   PUT /api/admin/fuel-prices/:fuelType
// @access  Private/Admin
const updateFuelPrice = async (req, res, next) => {
  try {
    const { fuelType } = req.params;
    const { pricePerLiter, name, ron } = req.body;

    const success = fuelConfig.updateFuelProduct(fuelType.toUpperCase(), {
      ...(pricePerLiter && { pricePerLiter: Number(pricePerLiter) }),
      ...(name && { name }),
      ...(ron && { ron }),
    });

    if (!success) {
      res.status(404);
      throw new Error('Fuel type not found');
    }

    res.json({
      success: true,
      data: fuelConfig.getFuelProducts()[fuelType.toUpperCase()],
      message: 'Fuel price updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service fee
// @route   PUT /api/admin/fuel-prices/service-fee
// @access  Private/Admin
const updateServiceFee = async (req, res, next) => {
  try {
    const { fee } = req.body;
    
    if (fee === undefined || isNaN(fee)) {
      res.status(400);
      throw new Error('Invalid fee value');
    }

    fuelConfig.updateServiceFee(Number(fee));

    res.json({
      success: true,
      data: fuelConfig.getServiceFee(),
      message: 'Service fee updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Private/Admin
const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllOrders,
  getAdminFuelPrices,
  updateFuelPrice,
  updateServiceFee,
  getAllDrivers,
};
