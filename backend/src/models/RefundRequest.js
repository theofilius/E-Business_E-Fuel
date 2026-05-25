const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      enum: {
        values: [
          'Bensin Tidak Datang Lebih dari 15 Menit',
          'Volume Tidak Sesuai',
          'Jenis BBM Tidak Sesuai',
          'Lainnya',
        ],
        message: '{VALUE} is not a valid refund reason',
      },
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: 'pending',
    },
    // Snapshot fields from order at the time of refund
    amount: { type: Number, default: 0 },
    driverName: { type: String, default: null },
    fuelType: { type: String, default: null },
    liters: { type: Number, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate refund for same order
refundRequestSchema.index({ orderId: 1 }, { unique: true });
refundRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
