const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: ['IGNITE', 'BLAZE', 'QUANTUM', 'DIESEL'],
        message: '{VALUE} is not a valid fuel type',
      },
    },
    liters: {
      type: Number,
      required: [true, 'Number of liters is required'],
      min: [1, 'Minimum order is 1 liter'],
      max: [200, 'Maximum order is 200 liters'],
    },
    pricePerLiter: {
      type: Number,
      required: [true, 'Price per liter is required'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    serviceFee: {
      type: Number,
      default: 5000, // Rp 5.000 service fee
    },
    location: {
      address: {
        type: String,
        required: [true, 'Delivery address is required'],
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    // Last known driver position while delivering — updated in realtime via Socket.IO
    driverLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'on_the_way', 'arrived', 'fueling', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'dana', 'ovo', 'gopay', 'shopeepay', 'qris', 'bca', 'bni', 'mandiri', 'bri'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters'],
      default: '',
    },
    paymentExpiry: {
      type: Date,
      default: null,
    },
    paymentRef: {
      type: String,
      default: null,
    },
    estimatedArrival: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    // ===== Driver rating (filled by customer after delivery) =====
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratingComment: {
      type: String,
      default: null,
      maxlength: 200,
    },
    ratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster user order queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ driverId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
