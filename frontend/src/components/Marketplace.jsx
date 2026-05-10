import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaFilter, FaMapMarkerAlt, FaTag, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';
import { smoothScrollToTop } from '../utils/smoothScroll';
import MarketplaceItem from './MarketplaceItem';

const Marketplace = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({});
  const [likedListings, setLikedListings] = useState(new Set());
  const itemsPerPage = 12;

  // Fetch categories
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [selectedCategory, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/marketplace/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/marketplace/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        ...(priceMin && { priceMin }),
        ...(priceMax && { priceMax })
      };

      const response = await axios.get(`${baseUrl}/api/v1/marketplace`, { params });
      setListings(response.data.listings);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceMin('');
    setPriceMax('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
    fetchListings();
  };

  const handleToggleLike = async (listingId) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${baseUrl}/api/v1/marketplace/${listingId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikedListings(prev => {
        const newSet = new Set(prev);
        if (newSet.has(listingId)) {
          newSet.delete(listingId);
        } else {
          newSet.add(listingId);
        }
        return newSet;
      });

      // Refresh listings to get updated like count
      fetchListings();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Alumni Marketplace
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Discover opportunities, services, and connect with fellow alumni
              </p>
            </div>
            {isLoggedIn && (
              <Link
                to="/marketplace/create"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <FaPlus /> Create Listing
              </Link>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Listings</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active || 0}</p>
            </div>
            {Object.entries(stats.categories || {}).slice(0, 3).map(([category, count]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
                <p className="text-3xl font-bold text-indigo-600">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedCategory === 'All'}
                      onChange={() => setSelectedCategory('All')}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">All</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.name} className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(cat.name)}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {cat.name} <span className="text-xs text-gray-500">({cat.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="w-full mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search listings..."
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
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gray-200 text-gray-800 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaFilter /> Filters
                </button>
              </div>
            </form>

            {/* Listings Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <FaTag className="text-5xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <MarketplaceItem
                      key={listing._id}
                      listing={listing}
                      isLiked={likedListings.has(listing._id)}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
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
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
