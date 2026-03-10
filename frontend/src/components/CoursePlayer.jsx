import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiChevronRight,
  FiChevronLeft,
  FiDownload,
  FiMenu,
  FiX,
  FiCheck,
  FiXCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

export default function CoursePlayer() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Fetch enrollment and course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/enrollments/${enrollmentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnrollment(response.data.data);

        const courseResponse = await axios.get(`${baseUrl}/courses/${response.data.data.course}`);
        setCourse(courseResponse.data.data);

        // Set completed lessons
        const completed = new Set(
          response.data.data.completedLessons.map(l => l.lessonId)
        );
        setCompletedLessons(completed);
      } catch (err) {
        toast.error('Failed to load course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enrollmentId]);

  const currentModule = course?.modules?.[currentModuleIdx];
  const currentLesson = currentModule?.lessons?.[currentLessonIdx];

  const handleCompleteLesson = async () => {
    try {
      await axios.post(
        `${baseUrl}/courses/enrollment/${enrollmentId}/lesson/${currentLesson._id}/complete`,
        { score: 0 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson._id);
      setCompletedLessons(newCompleted);

      toast.success('Lesson marked as complete!');
    } catch (err) {
      toast.error('Failed to mark lesson complete');
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const answers = Object.entries(quizAnswers).map(([qId, answer]) => ({
        questionId: qId,
        userAnswer: answer
      }));

      const response = await axios.post(
        `${baseUrl}/courses/enrollment/${enrollmentId}/quiz/${currentLesson.quiz._id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success(response.data.message);
      setShowQuiz(false);
      setQuizAnswers({});

      // Mark as complete if passed
      if (response.data.data.passed) {
        handleCompleteLesson();
      }
    } catch (err) {
      toast.error('Failed to submit quiz');
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIdx + 1 < currentModule.lessons.length) {
      setCurrentLessonIdx(currentLessonIdx + 1);
      setShowQuiz(false);
    } else if (currentModuleIdx + 1 < course.modules.length) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setCurrentLessonIdx(0);
      setShowQuiz(false);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
      setShowQuiz(false);
    } else if (currentModuleIdx > 0) {
      setCurrentModuleIdx(currentModuleIdx - 1);
      setCurrentLessonIdx(course.modules[currentModuleIdx - 1].lessons.length - 1);
      setShowQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Course or lesson not found
          </p>
        </div>
      </div>
    );
  }

  const isLessonCompleted = completedLessons.has(currentLesson._id);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      {showSidebar && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={`w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-bold text-lg line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {course.title}
            </h3>
          </div>

          {/* Course Modules */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {course.modules?.map((module, mIdx) => (
              <div key={mIdx}>
                <button
                  className={`w-full text-left font-semibold px-3 py-2 rounded transition ${
                    currentModuleIdx === mIdx
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Module {mIdx + 1}: {module.title}
                </button>

                {currentModuleIdx === mIdx && (
                  <div className="space-y-1 mt-2">
                    {module.lessons?.map((lesson, lIdx) => {
                      const isCompleted = completedLessons.has(lesson._id);
                      const isCurrent = lIdx === currentLessonIdx;

                      return (
                        <button
                          key={lIdx}
                          onClick={() => setCurrentLessonIdx(lIdx)}
                          className={`w-full text-left px-4 py-2 rounded text-sm flex items-center gap-2 transition ${
                            isCurrent
                              ? 'bg-blue-500 text-white'
                              : isDark
                              ? 'text-gray-400 hover:bg-gray-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {isCompleted && <FiCheck className="text-green-500" />}
                          <span className="flex-1 truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Progress: {enrollment?.progress}%
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-green-600" style={{ width: `${enrollment?.progress}%` }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {showSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <h1 className={`flex-1 text-xl font-semibold px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentLesson.title}
          </h1>

          <div className="flex items-center gap-2">
            {isLessonCompleted && (
              <div className="flex items-center gap-1 text-green-500 font-semibold">
                <FiCheck /> Completed
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!showQuiz ? (
            <div className="p-8">
              {/* Video Section */}
              {currentLesson.videoUrl && (
                <div className="mb-8 rounded-lg overflow-hidden bg-black">
                  <iframe
                    width="100%"
                    height="500"
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Lesson Content */}
              <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentLesson.title}
                </h2>
                <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                  {currentLesson.content && (
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {currentLesson.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Resources
                  </h3>
                  <div className="space-y-2">
                    {currentLesson.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        <FiDownload /> {resource.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Button or Complete Button */}
              <div className="flex gap-4">
                {currentLesson.quiz && !isLessonCompleted && (
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
                  >
                    Take Quiz
                  </button>
                )}

                {!isLessonCompleted && !currentLesson.quiz && (
                  <button
                    onClick={handleCompleteLesson}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Quiz Section
            <div className="p-8">
              <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentLesson.quiz.title}
                </h2>

                <div className="space-y-6">
                  {currentLesson.quiz.questions?.map((question, idx) => (
                    <div key={idx} className={`p-4 rounded border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <p className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {idx + 1}. {question.questionText}
                      </p>

                      {question.questionType === 'multiple-choice' && (
                        <div className="space-y-2">
                          {question.options?.map((option, optIdx) => (
                            <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`q${idx}`}
                                value={option}
                                checked={quizAnswers[question._id] === option}
                                onChange={(e) => setQuizAnswers(prev => ({ ...prev, [question._id]: e.target.value }))}
                                className="w-4 h-4"
                              />
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.questionType === 'true-false' && (
                        <div className="space-y-2">
                          {['True', 'False'].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`q${idx}`}
                                value={option}
                                checked={quizAnswers[question._id] === option}
                                onChange={(e) => setQuizAnswers(prev => ({ ...prev, [question._id]: e.target.value }))}
                                className="w-4 h-4"
                              />
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowQuiz(false)}
                    className={`px-6 py-3 font-semibold rounded-lg transition ${
                      isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className={`flex items-center justify-between p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={goToPreviousLesson}
            disabled={currentModuleIdx === 0 && currentLessonIdx === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft /> Previous
          </button>

          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Module {currentModuleIdx + 1} • Lesson {currentLessonIdx + 1}
          </div>

          <button
            onClick={goToNextLesson}
            disabled={currentModuleIdx === course.modules.length - 1 && currentLessonIdx === currentModule.lessons.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
