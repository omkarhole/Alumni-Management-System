import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiPlay,
  FiClock,
  FiCheckCircle,
  FiFilter,
  FiArrowRight,
  FiBook
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

export default function MyLearning() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'in-progress'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Fetch user's enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${baseUrl}/courses/my-learning/list?status=${filter}&page=${page}`,
          { withCredentials: true }
        );
        setEnrollments(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        toast.error('Failed to load enrollments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [filter, page]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${baseUrl}/courses/my-learning/stats`, {
          withCredentials: true
        });
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const handleContinueLearning = (enrollmentId) => {
    navigate(`/course-player/${enrollmentId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const enrollmentCard = (enrollment) => (
    <motion.div
      key={enrollment._id}
      whileHover={{ y: -4 }}
      className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition`}
    >
      {/* Course Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {enrollment.course?.thumbnail ? (
          <img
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBook className="text-white text-3xl opacity-50" />
          </div>
        )}

        {/* Progress Badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">
          {enrollment.progress}%
        </div>

        {/* Completed Badge */}
        {enrollment.isCompleted && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-600 px-3 py-1 rounded-full text-white text-sm font-semibold">
            <FiCheckCircle /> Completed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className={`font-semibold text-lg mb-1 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {enrollment.course?.title}
        </h3>

        {/* Category and Duration */}
        <div className={`flex items-center justify-between text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            {enrollment.course?.category}
          </span>
          <div className="flex items-center gap-1">
            <FiClock size={14} />
            {formatTime(enrollment.totalTimeSpent || 0)} spent
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${enrollment.progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>

        {/* Status and Button */}
        <div className="flex items-center gap-2">
          {enrollment.isCompleted ? (
            <>
              <div className="flex-1 text-sm font-semibold text-green-600">
                Course Completed
              </div>
              {enrollment.certificateIssued && (
                <button
                  onClick={() => window.open(enrollment.certificateUrl, '_blank')}
                  className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  View Certificate
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleContinueLearning(enrollment._id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition"
            >
              <FiPlay size={14} /> Continue
            </button>
          )}
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
            My Learning
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Continue learning and track your progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: stats.totalEnrollments, color: 'blue' },
            { label: 'In Progress', value: stats.inProgressCourses, color: 'purple' },
            { label: 'Completed', value: stats.completedCourses, color: 'green' },
            { label: 'Certificates', value: stats.certificatesEarned, color: 'yellow' }
          ].map(stat => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${`text-${stat.color}-500`}`}>
                {stat.value || 0}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <FiFilter className={isDark ? 'text-gray-400' : 'text-gray-600'} />
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'All Courses', value: 'all' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enrollments Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : enrollments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {enrollments.map(enrollmentCard)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded transition-colors ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-16 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <FiBook size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No courses yet
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Courses <FiArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
