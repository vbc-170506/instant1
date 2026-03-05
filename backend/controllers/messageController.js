// controllers/messageController.js - Chat message management
const Message = require('../models/Message');
const User = require('../models/User');

// Generate a consistent conversation ID from two user IDs
const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Security: Ensure the logged-in user is part of this conversation
    const userIdStr = req.user.id.toString();
    if (!conversationId.includes(userIdStr)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this conversation.' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiverId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'receiverId and content are required.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found.' });

    const conversationId = getConversationId(req.user.id, receiverId);

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      conversationId,
      content,
    });

    const populated = await message.populate('senderId', 'name role');
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    // Get latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', req.user._id] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Populate the other user's details
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const ids = conv._id.split('_');
        const otherId = ids.find((id) => id !== userId);
        const otherUser = await User.findById(otherId).select('name role');
        return { ...conv, otherUser };
      })
    );

    res.status(200).json({ success: true, conversations: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMessages, sendMessage, getConversations };
