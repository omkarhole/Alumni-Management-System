import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiPlay,
  FiClock,
  FiUsers,
  FiStar,
  FiDownload,
  FiBookOpen,
  FiAward,
  FiCheck
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/courses/${courseId}`);
        setCourse(response.data.data);
        setIsEnrolled(response.data.data.isEnrolled);
      } catch (err) {
        toast.error('Failed to load course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please log in to enroll');
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await axios.post(`${baseUrl}/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
      navigate(`/my-learning`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    navigate(`/my-learning`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Course not found</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Thumbnail */}
        <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiBookOpen className="text-white text-6xl opacity-50" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
            <div className="text-white">
              <div className="mb-2 text-sm font-semibold bg-blue-600 w-fit px-3 py-1 rounded">
                {course.level || 'Beginner'}
              </div>
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg opacity-90 mb-4">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FiUsers /> {course.enrollmentCount || 0} students
                </div>
                <div className="flex items-center gap-2">
                  <FiClock /> {course.duration} mins
                </div>
                {course.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <FiStar className="fill-yellow-400" /> {course.averageRating.toFixed(1)} ({course.ratingCount})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              About this course
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-700'} leading-relaxed`}>
              {course.description}
            </p>
          </motion.div>

          {/* Learning Outcomes */}
          {course.learningOutcomes?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiAward className="inline mr-2" />
                What you'll learn
              </h2>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className={`flex items-start gap-3 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Requirements
              </h2>
              <ul className="space-y-2">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className={`flex items-start gap-3 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Course Content */}
          {course.modules?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Content
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, mIdx) => (
                  <div key={mIdx} className={`border rounded-lg p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Module {mIdx + 1}: {module.title}
                    </h3>
                    <ul className="space-y-1">
                      {module.lessons?.map((lesson, lIdx) => (
                        <li
                          key={lIdx}
                          className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          <FiPlay size={14} />
                          {lesson.title}
                          {lesson.duration && <span className="text-xs">({lesson.duration} mins)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            sticky
            top={20}
            className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-700">
              <p className={`text-4xl font-bold ${course.isFree ? 'text-green-500' : ''}`}>
                {course.isFree ? 'Free' : `$${course.price}`}
              </p>
            </div>

            {/* Instructor Info */}
            <div className="mb-6 pb-6 border-b border-gray-700">
              <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Instructor
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={course.instructor?.avatar || '/default-avatar.png'}
                  alt={course.instructor?.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {course.instructor?.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Course Instructor
                  </p>
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <FiBookOpen className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {course.modules?.length || 0} modules
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {course.duration} total minutes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiAward className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Certificate of completion
                </span>
              </div>
            </div>

            {/* Action Button */}
            {isEnrolled ? (
              <button
                onClick={handleStartLearning}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FiPlay /> Continue Learning
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}

            {/* Share Button */}
            <button className={`w-full mt-3 py-2 border rounded-lg transition flex items-center justify-center gap-2 ${
              isDark
                ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
              <FiDownload /> Share
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
