// utils/socket.js - Socket.io real-time communication setup
const Message = require('../models/Message');

const setupSocket = (io) => {
  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User comes online
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      // Broadcast updated online users list
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`👤 User online: ${userId}`);
    });

    // Join a conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
      console.log(`💬 ${socket.userId} joined room: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { senderId, receiverId, content, conversationId } = data;

        // Save to database
        const message = await Message.create({
          senderId,
          receiverId,
          conversationId,
          content,
        });

        const populated = await message.populate('senderId', 'name role');

        // Emit to conversation room (both users)
        io.to(conversationId).emit('message:receive', populated);

        // If receiver is not in the room, send notification
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification:message', {
            from: populated.senderId,
            preview: content.substring(0, 50),
            conversationId,
          });
        }
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('message:error', { error: 'Failed to send message.' });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('typing:start', { userId });
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('typing:stop', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('users:online', Array.from(onlineUsers.keys()));
        console.log(`🔌 User disconnected: ${socket.userId}`);
      }
    });
  });
};

module.exports = setupSocket;
