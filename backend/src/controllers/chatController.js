const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Order = require('../models/Order');

// ─── Helper: verify the requesting user is a participant of this order ────────
async function getOrderAndVerify(orderId, userId, userRole) {
  const order = await Order.findById(orderId);
  if (!order) return { error: 'Order tidak ditemukan', status: 404 };

  const isCustomer = order.userId.toString() === userId.toString();
  const isDriver   = order.driverId && order.driverId.toString() === userId.toString();
  const isAdmin    = userRole === 'admin';

  if (!isCustomer && !isDriver && !isAdmin) {
    return { error: 'Anda bukan peserta chat ini', status: 403 };
  }
  return { order };
}

// ─── GET /api/chat/orders/:orderId/messages ───────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId   = req.user._id;
    const userRole = req.user.role;

    const { order, error, status } = await getOrderAndVerify(orderId, userId, userRole);
    if (error) return res.status(status).json({ success: false, message: error });

    // Find or create conversation
    let convo = await Conversation.findOne({ orderId });
    if (!convo) {
      const participants = [order.userId];
      if (order.driverId) participants.push(order.driverId);
      convo = await Conversation.create({ orderId, participants });
    }

    const messages = await Message.find({ conversationId: convo._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name role');

    res.json({ success: true, data: { conversationId: convo._id, messages } });
  } catch (err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/chat/orders/:orderId/messages ──────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { text }    = req.body;
    const userId      = req.user._id;
    const userRole    = req.user.role;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
    }

    const { order, error, status } = await getOrderAndVerify(orderId, userId, userRole);
    if (error) return res.status(status).json({ success: false, message: error });

    // Find or create conversation
    let convo = await Conversation.findOne({ orderId });
    if (!convo) {
      const participants = [order.userId];
      if (order.driverId) participants.push(order.driverId);
      convo = await Conversation.create({ orderId, participants });
    }

    const message = await Message.create({
      conversationId: convo._id,
      orderId,
      senderId: userId,
      senderRole: userRole,
      type: 'text',
      text: text.trim(),
    });

    // Update last message on conversation
    convo.lastMessage = text.trim().substring(0, 100);
    convo.lastMessageAt = new Date();
    await convo.save();

    // Populate for socket emit
    await message.populate('senderId', 'name role');

    // Emit to everyone in this order's room
    const io = req.app.get('io');
    io.to(`order:${orderId}`).emit('chat_message', message);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/chat/orders/:orderId/upload ────────────────────────────────────
const uploadImage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId      = req.user._id;
    const userRole    = req.user.role;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }

    const { order, error, status } = await getOrderAndVerify(orderId, userId, userRole);
    if (error) return res.status(status).json({ success: false, message: error });

    // Build a URL the client can load
    const imageUrl  = `/uploads/chat/${req.file.filename}`;
    const imageName = req.file.originalname;

    // Find or create conversation
    let convo = await Conversation.findOne({ orderId });
    if (!convo) {
      const participants = [order.userId];
      if (order.driverId) participants.push(order.driverId);
      convo = await Conversation.create({ orderId, participants });
    }

    const message = await Message.create({
      conversationId: convo._id,
      orderId,
      senderId: userId,
      senderRole: userRole,
      type: 'image',
      imageUrl,
      imageName,
    });

    convo.lastMessage = '[Foto]';
    convo.lastMessageAt = new Date();
    await convo.save();

    await message.populate('senderId', 'name role');

    const io = req.app.get('io');
    io.to(`order:${orderId}`).emit('chat_message', message);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('uploadImage error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMessages, sendMessage, uploadImage };
