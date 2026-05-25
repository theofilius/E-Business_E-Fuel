const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          // Akun baru SELALU Basic — tidak ada jalan jadi premium lewat register
          isPremium: false,
          premiumPlan: null,
          premiumUntil: null,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPremium: user.isPremium || false,
        premiumPlan: user.premiumPlan || null,
        premiumUntil: user.premiumUntil || null,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (req.body.name  !== undefined) user.name    = req.body.name.trim()  || user.name;
    if (req.body.phone !== undefined) user.phone   = req.body.phone.trim() || user.phone;
    if (req.body.address !== undefined) user.address = req.body.address;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use');
      }
      user.email = req.body.email;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address || null,
        isPremium: updatedUser.isPremium || false,
        premiumPlan: updatedUser.premiumPlan || null,
        premiumUntil: updatedUser.premiumUntil || null,
        avatar: updatedUser.avatar || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user premium status (simulated payment)
// @route   PUT /api/auth/premium
// @access  Private
const updatePremium = async (req, res, next) => {
  try {
    const { isPremium, premiumPlan, premiumUntil } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isPremium = isPremium === true;
    if (premiumPlan !== undefined) user.premiumPlan = premiumPlan;
    if (premiumUntil !== undefined) user.premiumUntil = premiumUntil;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isPremium: updatedUser.isPremium,
        premiumPlan: updatedUser.premiumPlan,
        premiumUntil: updatedUser.premiumUntil,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePremium };
