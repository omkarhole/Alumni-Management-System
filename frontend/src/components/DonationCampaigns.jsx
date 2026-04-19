import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  Heart,
  Target,
  Users,
  TrendingUp,
  Filter,
  Search,
  Loader,
  Award,
  ArrowRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const donationUrl = `${API_URL}/api/donations`;

/**
 * DonationCampaigns Component
 * Displays fundraising campaigns with progress tracking
 */
const DonationCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'All',
    'Scholarship',
    'Infrastructure',
    'Event',
    'Research',
    'Sports',
    'Library',
    'General'
  ];

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [page, selectedCategory]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      params.append('status', 'active');
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory.toLowerCase());
      }

      const response = await axios.get(
        `${donationUrl}/campaigns?${params.toString()}`
      );

      if (response.data) {
        setCampaigns(response.data.campaigns || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${donationUrl}/stats`, {
        withCredentials: true
      });
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getProgressPercentage = (current, target) => {
    return target > 0 ? Math.round((current / target) * 100) : 0;
  };

  const getCategoryColor = (category) => {
    const colors = {
      scholarship: 'bg-blue-100 text-blue-800',
      infrastructure: 'bg-amber-100 text-amber-800',
      event: 'bg-purple-100 text-purple-800',
      research: 'bg-green-100 text-green-800',
      sports: 'bg-red-100 text-red-800',
      library: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 fill-current" />
          <h1 className="text-4xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your generous donations help us strengthen the institution,
            support students, and create lasting impact for our community
          </p>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-gray-50 py-12 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Total Raised</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalRaised?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Donors</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDonations || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeCampaigns || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Avg Donation</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.averageDonation?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border-b border-gray-200 py-8 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat || (cat === 'All' && !selectedCategory)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-500">Check back soon for new campaigns!</p>
            </div>
          ) : (
            <>
              {/* Campaign Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {campaigns.map((campaign) => {
                  const percentage = getProgressPercentage(
                    campaign.currentAmount,
                    campaign.targetAmount
                  );
                  const daysLeft = Math.ceil(
                    (new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={campaign._id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                    >
                      {/* Campaign Image */}
                      {campaign.image && (
                        <div className="h-48 overflow-hidden bg-gray-200">
                          <img
                            src={`${API_URL}/${campaign.image}`}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 flex-grow flex flex-col">
                        {/* Category Badge */}
                        <span
                          className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(
                            campaign.category
                          )}`}
                        >
                          {campaign.category.charAt(0).toUpperCase() +
                            campaign.category.slice(1)}
                        </span>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {campaign.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {campaign.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ${campaign.currentAmount.toLocaleString()}
                            </span>
                            <span className="text-sm font-semibold text-gray-500">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Goal: ${campaign.targetAmount.toLocaleString()}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {campaign.donorCount} donors
                          </span>
                          <span
                            className={
                              daysLeft > 0
                                ? 'text-amber-600 font-medium'
                                : 'text-gray-400'
                            }
                          >
                            {daysLeft > 0
                              ? `${daysLeft} days left`
                              : 'Ended'}
                          </span>
                        </div>

                        {/* Donate Button */}
                        <button className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4" />
                          Donate Now
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => (
                      <div key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            page === p
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DonationCampaigns;
