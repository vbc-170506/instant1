// components/ChatBox/ChatBox.jsx - Real-time chat interface
import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChatBox = ({ socket, receiverId, receiverName, conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial messages
  useEffect(() => {
    if (!conversationId) return;
    const loadMessages = async () => {
      try {
        setLoading(true);
        const { data } = await messagesAPI.getMessages(conversationId);
        setMessages(data.messages);
      } catch (err) {
        console.error('Load messages error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [conversationId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('conversation:join', conversationId);

    socket.on('message:receive', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing:start', ({ userId }) => {
      if (userId !== user.id) setIsTyping(true);
    });

    socket.on('typing:stop', ({ userId }) => {
      if (userId !== user.id) setIsTyping(false);
    });

    return () => {
      socket.emit('conversation:leave', conversationId);
      socket.off('message:receive');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, conversationId, user.id]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleTyping = () => {
    socket?.emit('typing:start', { conversationId, userId: user.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing:stop', { conversationId, userId: user.id });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    setInput('');

    // Emit via socket (socket.js saves to DB)
    socket?.emit('message:send', {
      senderId: user.id,
      receiverId,
      content,
      conversationId,
    });

    // Optimistic update (socket will confirm)
    const optimistic = {
      _id: Date.now().toString(),
      senderId: { _id: user.id, name: user.name },
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center space-x-3">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold">
          {receiverName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{receiverName || 'Chat'}</p>
          <p className="text-xs text-blue-100">{isTyping ? 'Typing...' : 'Online'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">💬</p>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId?._id === user.id || msg.senderId === user.id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); handleTyping(); }}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
