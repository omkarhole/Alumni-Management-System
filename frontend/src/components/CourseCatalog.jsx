import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiStar, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark } = useTheme();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    page: parseInt(searchParams.get('page')) || 1
  });
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([
    'Web Development',
    'Mobile Development',
    'Data Science',
    'AI & Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Design',
    'Business'
  ]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.level) queryParams.append('level', filters.level);
        queryParams.append('page', filters.page);

        const response = await axios.get(`${baseUrl}/courses?${queryParams}`);
        setCourses(response.data.data);
        setPagination(response.data.pagination);

        // Update URL with filters
        setSearchParams(filters);
      } catch (err) {
        toast.error('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const courseCard = (course) => (
    <motion.div
      key={course._id}
      whileHover={{ y: -8 }}
      onClick={() => handleCourseClick(course._id)}
      className={`rounded-lg overflow-hidden cursor-pointer transition-all ${
        isDark
          ? 'bg-gray-800 hover:shadow-lg hover:shadow-blue-500/20'
          : 'bg-white hover:shadow-lg hover:shadow-blue-500/20'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiSearch className="text-white text-4xl opacity-50" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
          {course.level || 'Beginner'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {course.title}
        </h3>

        <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {course.description_short || course.description}
        </p>

        {/* Instructor */}
        <div className={`flex items-center gap-2 mb-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <img
            src={course.instructor?.avatar || '/default-avatar.png'}
            alt={course.instructor?.name}
            className="w-6 h-6 rounded-full"
          />
          <span>{course.instructor?.name}</span>
        </div>

        {/* Stats */}
        <div className={`flex items-center justify-between text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-1">
            <FiUsers size={16} />
            <span>{course.enrollmentCount || 0} enrolled</span>
          </div>
          {course.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <FiStar size={16} className="fill-yellow-400" />
              <span>{course.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Price & Category */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {course.category}
          </span>
          <span className="font-bold text-lg">
            {course.isFree ? 'Free' : `$${course.price}`}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Learning Catalog
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Expand your skills with courses from industry experts
          </p>
        </div>

        {/* Filters */}
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Search Courses
              </label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
              }`}>
                <FiSearch size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={handleSearch}
                  className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map(courseCard)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-3 py-2 rounded transition-colors ${
                      filters.page === page
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <FiSearch size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No courses found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
