const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: null },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
