import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  Search,
  Filter,
  X,
  Sliders,
  Users,
  TrendingUp,
  Loader
} from 'lucide-react';
import AlumniProfileCard from './AlumniProfileCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const alumniUrl = `${API_URL}/api/alumni`;

/**
 * AlumniDirectory Component
 * Advanced searchable directory with filters for location, company, industry, skills, etc.
 */
const AlumniDirectory = () => {
  // State Management
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    batches: [],
    courses: [],
    locations: [],
    companies: [],
    industries: [],
    skills: [],
    interests: [],
    yearRange: { min: 2000, max: new Date().getFullYear() }
  });

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    batch: [],
    course: [],
    location: [],
    company: [],
    industry: [],
    skills: [],
    interests: [],
    minBatch: '',
    maxBatch: '',
    sortBy: 'name'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const filtersRef = useRef(null);

  // Initialize
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch alumni when filters or page changes
  useEffect(() => {
    fetchAlumni();
  }, [currentPage, filters, searchQuery]);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) {
        if (showAdvancedFilters && !e.target.closest('[data-filter-trigger]')) {
          setShowAdvancedFilters(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdvancedFilters]);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${alumniUrl}/directory/options`, {
        withCredentials: true
      });
      if (response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      toast.error('Failed to load filter options');
    }
  };

  // Fetch alumni with filters
  const fetchAlumni = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();

      // Add search query
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Add filters
      if (filters.batch.length > 0) {
        params.append('batch', filters.batch.join(','));
      }
      if (filters.minBatch) {
        params.append('minBatch', filters.minBatch);
      }
      if (filters.maxBatch) {
        params.append('maxBatch', filters.maxBatch);
      }
      if (filters.course.length > 0) {
        params.append('course', filters.course.join(','));
      }
      if (filters.location.length > 0) {
        params.append('location', filters.location.join(','));
      }
      if (filters.company.length > 0) {
        params.append('company', filters.company.join(','));
      }
      if (filters.industry.length > 0) {
        params.append('industry', filters.industry.join(','));
      }
      if (filters.skills.length > 0) {
        params.append('skills', filters.skills.join(','));
      }
      if (filters.interests.length > 0) {
        params.append('interests', filters.interests.join(','));
      }

      // Add sort and pagination
      params.append('sortBy', filters.sortBy);
      params.append('page', currentPage);
      params.append('limit', limit);

      const response = await axios.get(`${alumniUrl}/directory?${params.toString()}`, {
        withCredentials: true
      });

      if (response.data) {
        setAlumni(response.data.alumni || []);
        setTotal(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error('Failed to load alumni directory');
    } finally {
      setSearching(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value, isMulti = true) => {
    setCurrentPage(1); // Reset to page 1
    
    if (isMulti) {
      setFilters(prev => ({
        ...prev,
        [filterName]: prev[filterName].includes(value)
          ? prev[filterName].filter(v => v !== value)
          : [...prev[filterName], value]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      batch: [],
      course: [],
      location: [],
      company: [],
      industry: [],
      skills: [],
      interests: [],
      minBatch: '',
      maxBatch: '',
      sortBy: 'name'
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.batch.length > 0) count += filters.batch.length;
    if (filters.course.length > 0) count += filters.course.length;
    if (filters.location.length > 0) count += filters.location.length;
    if (filters.company.length > 0) count += filters.company.length;
    if (filters.industry.length > 0) count += filters.industry.length;
    if (filters.skills.length > 0) count += filters.skills.length;
    if (filters.interests.length > 0) count += filters.interests.length;
    if (filters.minBatch || filters.maxBatch) count++;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Alumni Directory</h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover and connect with thousands of alumni worldwide. Find peers in your field,
              explore career paths, and grow your professional network.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Alumni</p>
                  <p className="text-3xl font-bold text-gray-900">{total}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Results Found</p>
                  <p className="text-3xl font-bold text-gray-900">{alumni.length}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Filters</p>
                  <p className="text-3xl font-bold text-gray-900">{activeFilters}</p>
                </div>
                <Filter className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, company, location, skills..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <button
                data-filter-trigger
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Sliders className="w-5 h-5" />
                <span>Advanced Filters</span>
                {activeFilters > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {activeFilters}
                  </span>
                )}
              </button>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value, false)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="batch-newest">Sort: Newest Batch</option>
                <option value="batch-oldest">Sort: Oldest Batch</option>
                <option value="endorsements">Sort: Most Endorsed</option>
              </select>

              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div
                ref={filtersRef}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-6"
              >
                {/* Batch Range Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Batch Year
                    </label>
                    <input
                      type="number"
                      min={filterOptions.yearRange?.min}
                      max={filterOptions.yearRange?.max}
                      value={filters.minBatch}
                      onChange={(e) => handleFilterChange('minBatch', e.target.value, false)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2015"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Batch Year
                    </label>
                    <input
                      type="number"
                      min={filterOptions.yearRange?.min}
                      max={filterOptions.yearRange?.max}
                      value={filters.maxBatch}
                      onChange={(e) => handleFilterChange('maxBatch', e.target.value, false)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2023"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                {filterOptions.locations?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.locations.map(location => (
                        <button
                          key={location}
                          onClick={() => handleFilterChange('location', location)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.location.includes(location)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Filter */}
                {filterOptions.companies?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.companies.slice(0, 8).map(company => (
                        <button
                          key={company}
                          onClick={() => handleFilterChange('company', company)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.company.includes(company)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Industry Filter */}
                {filterOptions.industries?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.industries.slice(0, 6).map(industry => (
                        <button
                          key={industry}
                          onClick={() => handleFilterChange('industry', industry)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.industry.includes(industry)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Filter */}
                {filterOptions.skills?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.skills.slice(0, 10).map(skill => (
                        <button
                          key={skill}
                          onClick={() => handleFilterChange('skills', skill)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.skills.includes(skill)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests Filter */}
                {filterOptions.interests?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.interests.slice(0, 8).map(interest => (
                        <button
                          key={interest}
                          onClick={() => handleFilterChange('interests', interest)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.interests.includes(interest)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Alumni Grid */}
          {searching ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading alumni...</span>
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No alumni found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search filters or resetting filters to see more results.
              </p>
              {activeFilters > 0 && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <X className="w-4 h-4" />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {alumni.map((alum) => (
                  <AlumniProfileCard
                    key={alum._id}
                    alumni={alum}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                      .map((page, idx, arr) => (
                        <div key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div className="text-center mt-6 text-gray-600">
                <p>
                  Showing <span className="font-semibold">{(currentPage - 1) * limit + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(currentPage * limit, total)}</span> of{' '}
                  <span className="font-semibold">{total}</span> alumni
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AlumniDirectory;
