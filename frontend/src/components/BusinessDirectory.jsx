import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import defaultavatar from '../assets/uploads/defaultavatar.jpg';
import { toPublicUrl, businessUrl } from '../utils/globalurl';
import { 
  Building2, 
  Search, 
  Filter, 
  Star, 
  MapPin,
  Phone,
  Globe,
  Gift,
  ChevronRight,
  Award
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORY_LABELS = {
  technology: 'Technology',
  consulting: 'Consulting',
  finance: 'Finance',
  marketing: 'Marketing',
  healthcare: 'Healthcare',
  education: 'Education',
  retail: 'Retail',
  food: 'Food & Beverages',
  real_estate: 'Real Estate',
  legal: 'Legal',
  manufacturing: 'Manufacturing',
  hospitality: 'Hospitality',
  creative: 'Creative & Design',
  freelance: 'Freelance',
  other: 'Other'
};

const BusinessDirectory = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    hasDiscount: false,
    featured: false
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    cities: [],
    countries: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBusinesses();
    fetchFilterOptions();
  }, [pagination.page, filters]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.city && { city: filters.city }),
        ...(filters.hasDiscount && { hasDiscount: 'true' }),
        ...(filters.featured && { featured: 'true' })
      });

      const response = await fetch(`${API_URL}/api/business?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setBusinesses(data.businesses);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        toast.error('Failed to fetch businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Error loading businesses');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/filter-options`);
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
      category: '',
      city: '',
      hasDiscount: false,
      featured: false
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Business Directory</h1>
          <p className="text-gray-600">
            Discover businesses and services owned by our alumni community. 
            Find trusted professionals and enjoy exclusive alumni discounts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search businesses by name, category, or service..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    <option value="">All Cities</option>
                    {filterOptions.cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasDiscount}
                      onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Gift className="w-4 h-4 text-green-600" />
                      Alumni Discount
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-600" />
                      Featured
                    </span>
                  </label>
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

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {businesses.length} of {pagination.total} businesses
        </div>

        {/* Businesses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <div key={business._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {business.logo ? (
                        <img
                          src={toPublicUrl(business.logo)}
                          alt={business.businessName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-900">{business.businessName}</h3>
                          {business.isVerified && (
                            <span className="text-blue-500" title="Verified">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                          {business.isFeatured && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{CATEGORY_LABELS[business.category] || business.category}</p>
                        {renderStars(business.rating)}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>

                    {business.location?.city && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{business.location.city}{business.location.country ? `, ${business.location.country}` : ''}</span>
                      </div>
                    )}

                    {business.hasAlumniDiscount && (
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-3 bg-green-50 p-2 rounded">
                        <Gift className="w-4 h-4" />
                        <span className="font-medium">{business.alumniDiscount?.title || 'Alumni Discount Available'}</span>
                      </div>
                    )}

                    <Link
                      to={`/business/${business._id}`}
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      View Details
                    </Link>
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

            {businesses.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </>
        )}

        {/* Register Business CTA */}
        {isLoggedIn && user?.type === 'alumnus' && (
          <div className="mt-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">List Your Business</h2>
                <p className="text-green-100">
                  Showcase your business to the alumni community. 
                  Get discovered, offer exclusive discounts, and grow your network.
                </p>
              </div>
              <Link
                to="/register-business"
                className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors whitespace-nowrap"
              >
                Register Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
