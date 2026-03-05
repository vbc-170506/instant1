// pages/Chat/Chat.jsx - Chat interface with conversation list
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../../components/ChatBox/ChatBox';
import Sidebar from '../../components/Sidebar/Sidebar';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('user:online', user.id);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user.id]);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await messagesAPI.getConversations();
        setConversations(data.conversations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: '75vh' }}>
            <div className="flex h-full">
              {/* Conversations list */}
              <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="px-4 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 text-sm">Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 px-4">
                      <p className="text-3xl mb-2">💬</p>
                      <p className="text-sm">No conversations yet.</p>
                      <p className="text-xs mt-1">Accept a proposal to start chatting!</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isSelected = selectedConv?._id === conv._id;
                      return (
                        <button
                          key={conv._id}
                          onClick={() => setSelectedConv(conv)}
                          className={`w-full flex items-center space-x-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left ${isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {conv.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{conv.otherUser?.name}</p>
                            <p className="text-xs text-gray-400 truncate capitalize">{conv.otherUser?.role}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1">
                {selectedConv ? (
                  <ChatBox
                    socket={socketRef.current}
                    receiverId={selectedConv.otherUser?._id}
                    receiverName={selectedConv.otherUser?.name}
                    conversationId={selectedConv._id}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="text-5xl mb-4">💬</p>
                      <p className="font-medium text-gray-500">Select a conversation</p>
                      <p className="text-sm mt-1">Choose from the list on the left</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
