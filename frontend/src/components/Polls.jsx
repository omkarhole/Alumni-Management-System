import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaChartBar, FaFilter, FaPlus, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';
import PollVote from './PollVote';

const Polls = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [stats, setStats] = useState({});
  const itemsPerPage = 8;

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [selectedCategory, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/polls/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/polls/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: 'Active',
        ...(selectedCategory !== 'All' && { category: selectedCategory })
      };

      const response = await axios.get(`${baseUrl}/api/v1/polls`, { params });
      setPolls(response.data.polls);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter polls locally by search query
    if (searchQuery) {
      const filtered = polls.filter(poll =>
        poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPolls(filtered);
    } else {
      fetchPolls();
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Feedback': 'bg-blue-100 text-blue-800',
      'Event': 'bg-green-100 text-green-800',
      'Decision': 'bg-purple-100 text-purple-800',
      'Interest': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (expiresAt, status) => {
    if (status === 'Closed') return 'bg-red-100 text-red-800';
    if (new Date(expiresAt) < new Date()) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const timeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff < 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Expires soon';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Polls & Surveys
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Share your opinions and help shape our community
              </p>
            </div>
            {isLoggedIn && (
              <Link
                to="/polls/create"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <FaPlus /> Create Poll
              </Link>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Polls</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Responses</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalVotes || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Closed Polls</p>
              <p className="text-3xl font-bold text-red-600">{stats.closed || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Polls</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Polls Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <FaChartBar className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No polls available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Check back later or create a new poll
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {polls.map(poll => (
                <div
                  key={poll._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer group"
                  onClick={() => setSelectedPoll(poll)}
                >
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(poll.category)}`}>
                      {poll.category}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(poll.expiresAt, poll.status)}`}>
                      {timeRemaining(poll.expiresAt)}
                    </span>
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 line-clamp-2">
                    {poll.question}
                  </h3>

                  {/* Description */}
                  {poll.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {poll.description}
                    </p>
                  )}

                  {/* Poll Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>📊 {poll.totalVotes} responses</span>
                    <span>By {poll.createdBy?.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Poll Modal */}
      {selectedPoll && (
        <PollVote poll={selectedPoll} onClose={() => setSelectedPoll(null)} />
      )}
    </div>
  );
};

export default Polls;
