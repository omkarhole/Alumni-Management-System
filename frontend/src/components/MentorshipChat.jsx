import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import defaultavatar from '../assets/uploads/defaultavatar.jpg';
import { toPublicUrl } from '../utils/globalurl';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Calendar,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MentorshipChat = () => {
  const { mentorshipId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [mentorship, setMentorship] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchMentorshipDetails();
    fetchMessages();
  }, [isLoggedIn, mentorshipId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMentorshipDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/mentorships/${mentorshipId}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setMentorship(data);
      } else {
        toast.error('Failed to fetch mentorship details');
        navigate('/mentorship/my');
      }
    } catch (error) {
      console.error('Error fetching mentorship:', error);
      toast.error('Error loading mentorship');
      navigate('/mentorship/my');
    }
  };

  const fetchMessages = async (pageNum = 1) => {
    try {
      const response = await fetch(
        `${API_URL}/api/mentorship/mentorships/${mentorshipId}/messages?page=${pageNum}&limit=50`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setMessages(data.messages);
        } else {
          setMessages(prev => [...data.messages, ...prev]);
        }
        setHasMore(data.messages.length === 50);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/mentorship/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          mentorshipId,
          content: newMessage.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMoreMessages = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage);
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getOtherPerson = () => {
    if (!mentorship || !user) return null;
    return mentorship.mentor._id === user.id ? mentorship.mentee : mentorship.mentor;
  };

  const isMyMessage = (message) => {
    return message.sender._id === user?.id;
  };

  const renderMessageStatus = (message) => {
    if (!isMyMessage(message)) return null;
    
    if (message.isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const otherPerson = getOtherPerson();
  const groupedMessages = groupMessagesByDate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/mentorship/my')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <img
                  src={toPublicUrl(otherPerson?.alumnus_bio?.avatar) || defaultavatar}
                  alt={otherPerson?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">{otherPerson?.name}</h2>
                  <p className="text-xs text-gray-500">
                    {mentorship?.mentor._id === user?.id ? 'Mentee' : 'Mentor'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/mentorship/sessions/${mentorshipId}`}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Schedule Session"
              >
                <Calendar className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="max-w-4xl mx-auto">
          {hasMore && messages.length >= 50 && (
            <button
              onClick={loadMoreMessages}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Load more messages
            </button>
          )}

          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-4">
                {dateMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMyMessage(message)
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMyMessage(message) ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
                        {renderMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorshipChat;
