const express = require('express');
const {
  // Course Management
  createCourse,
  updateCourse,
  publishCourse,
  deleteCourse,
  // Browsing
  listCourses,
  getCourseDetails,
  getInstructorCourses,
  // Enrollment
  enrollCourse,
  updateProgress,
  completeLesson,
  // Quiz
  submitQuiz,
  // Certificate
  generateCertificate,
  // My Learning
  getMyLearning,
  getUserStats
} = require('../controllers/course.controller');

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all published courses (with filters)
router.get('/', listCourses);

// Get course details
router.get('/:id', getCourseDetails);

// ==================== AUTHENTICATED ROUTES ====================

// Get my learning (enrolled courses)
router.get('/my-learning/list', authenticate, getMyLearning);

// Get user learning statistics
router.get('/my-learning/stats', authenticate, getUserStats);

// Get instructor's courses
router.get('/instructor/courses', authenticate, getInstructorCourses);

// ==================== COURSE MANAGEMENT (INSTRUCTOR/ADMIN) ====================

// Create new course
router.post('/', authenticate, createCourse);

// Update course
router.put('/:id', authenticate, updateCourse);

// Publish course
router.post('/:id/publish', authenticate, publishCourse);

// Delete (archive) course
router.delete('/:id', authenticate, deleteCourse);

// ==================== ENROLLMENT ====================

// Enroll in course
router.post('/:courseId/enroll', authenticate, enrollCourse);

// ==================== LESSON & PROGRESS ====================

// Update progress
router.post('/enrollment/:enrollmentId/progress', authenticate, updateProgress);

// Mark lesson as complete
router.post('/enrollment/:enrollmentId/lesson/:lessonId/complete', authenticate, completeLesson);

// ==================== QUIZ ====================

// Submit quiz
router.post('/enrollment/:enrollmentId/quiz/:quizId/submit', authenticate, submitQuiz);

// ==================== CERTIFICATE ====================

// Generate certificate
router.post('/enrollment/:enrollmentId/certificate/generate', authenticate, generateCertificate);

module.exports = router;
