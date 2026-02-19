import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import defaultavatar from '../assets/uploads/defaultavatar.jpg';
import { toPublicUrl } from '../utils/globalurl';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Briefcase, 
  Calendar, 
  MessageCircle, 
  ChevronRight,
  Award,
  MapPin,
  Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Mentorship = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    expertise: '',
    industry: '',
    minRating: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    expertise: [],
    industries: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMentors();
    fetchFilterOptions();
  }, [pagination.page, filters]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.expertise && { expertise: filters.expertise }),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.minRating > 0 && { minRating: filters.minRating })
      });

      const response = await fetch(`${API_URL}/api/mentorship/mentors?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setMentors(data.mentors);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        toast.error('Failed to fetch mentors');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Error loading mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/mentors/filters`);
      const data = await response.json();

      if (response.ok) {
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      expertise: '',
      industry: '',
      minRating: 0
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRequestMentorship = (mentorId) => {
    if (!isLoggedIn) {
      toast.info('Please login to request mentorship');
      navigate('/login');
      return;
    }
    navigate(`/mentorship/request/${mentorId}`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating || 0})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Program</h1>
          <p className="text-gray-600">
            Connect with experienced alumni mentors for career guidance, skill development, and professional growth.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-sm text-gray-600">Active Mentors</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">500+</p>
              <p className="text-sm text-gray-600">Mentorships</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1000+</p>
              <p className="text-sm text-gray-600">Sessions</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search mentors by name, expertise, or company..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={filters.expertise}
                    onChange={(e) => handleFilterChange('expertise', e.target.value)}
                  >
                    <option value="">All Expertise</option>
                    {filterOptions.expertise.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                  >
                    <option value="">All Industries</option>
                    {filterOptions.industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div key={mentor._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={toPublicUrl(mentor.user?.alumnus_bio?.avatar) || defaultavatar}
                        alt={mentor.user?.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{mentor.user?.name}</h3>
                        <p className="text-sm text-gray-600">{mentor.currentPosition}</p>
                        <p className="text-sm text-gray-500">{mentor.currentCompany}</p>
                        {renderStars(mentor.rating)}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.expertise.slice(0, 3).map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {exp}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{mentor.expertise.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{mentor.yearsOfExperience} years exp.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{mentor.currentMentees}/{mentor.maxMentees} mentees</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/mentorship/mentor/${mentor.user?._id}`}
                        className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleRequestMentorship(mentor.user?._id)}
                        disabled={mentor.currentMentees >= mentor.maxMentees}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                          mentor.currentMentees >= mentor.maxMentees
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {mentor.currentMentees >= mentor.maxMentees ? 'Full' : 'Request'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}

            {mentors.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </>
        )}

        {/* Become a Mentor CTA */}
        {isLoggedIn && user?.type === 'alumnus' && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Become a Mentor</h2>
                <p className="text-blue-100">
                  Share your experience and help shape the next generation of professionals. 
                  Join our mentorship program today.
                </p>
              </div>
              <Link
                to="/mentorship/become-mentor"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
