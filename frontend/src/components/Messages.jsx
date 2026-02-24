import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { messagesUrl } from '../utils/globalurl';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MessageCircle, 
  Search, 
  MoreVertical, 
  CheckCheck,
  Clock,
  Send
} from 'lucide-react';
import defaultavatar from '../assets/uploads/defaultavatar.jpg';

const Messages = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const userId = localStorage.getItem('user_id');
    setCurrentUserId(userId);
    fetchConversations();
  }, [isLoggedIn, navigate]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${messagesUrl}/conversations`, {
        withCredentials: true
      });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const userName = conv.user?.name?.toLowerCase() || '';
    return userName.includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const getOtherUser = (conv) => conv.user;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Start a conversation by messaging an alumni from the directory'}
              </p>
              {!searchQuery && (
                <Link
                  to="/alumni"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  Browse Alumni
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conv) => {
                const otherUser = getOtherUser(conv);
                const hasUnread = conv.unreadCount > 0;
                
                return (
                  <Link
                    key={otherUser._id}
                    to={`/messages/${otherUser._id}`}
                    className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                      hasUnread ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          otherUser?.alumnus_bio?.avatar
                            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${otherUser.alumnus_bio.avatar}`
                            : defaultavatar
                        }
                        alt={otherUser?.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      {hasUnread && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          hasUnread ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {otherUser?.name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatMessageTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate pr-4 ${
                          hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {conv.lastMessage?.sender === currentUserId ? 'You: ' : ''}
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        
                        {hasUnread && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 mt-1">
                        {otherUser?.alumnus_bio?.batch && (
                          <span className="text-xs text-gray-400">
                            Batch {otherUser.alumnus_bio.batch}
                          </span>
                        )}
                        {otherUser?.alumnus_bio?.course?.course && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">
                              {otherUser.alumnus_bio.course.course}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
