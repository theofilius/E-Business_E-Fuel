const Driver = require('../models/Driver');

// @desc    Get all available drivers
// @route   GET /api/drivers
// @access  Private
const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ status: 'available' }).select(
      'name vehicle plateNumber currentLocation rating totalDeliveries avatar'
    );

    res.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver by ID
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new driver (admin only)
// @route   POST /api/drivers
// @access  Private/Admin
const createDriver = async (req, res, next) => {
  try {
    const { name, vehicle, plateNumber, phone } = req.body;

    const driverExists = await Driver.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (driverExists) {
      res.status(400);
      throw new Error('Driver with this plate number already exists');
    }

    const driver = await Driver.create({
      name,
      vehicle,
      plateNumber,
      phone,
    });

    res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver location
// @route   PUT /api/drivers/:id/location
// @access  Private
const updateDriverLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
      { new: true }
    );

    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAvailableDrivers, getDriverById, createDriver, updateDriverLocation };
