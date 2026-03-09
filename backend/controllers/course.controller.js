const { Course, Enrollment, User } = require('../models/Index');

// ==================== COURSE MANAGEMENT ====================

/**
 * Create a new course (by instructor/admin)
 */
async function createCourse(req, res, next) {
  try {
    const { title, description, category, isFree, price, thumbnail, modules, learningOutcomes, requirements } = req.body;
    
    const course = new Course({
      title,
      description,
      category,
      isFree: isFree !== undefined ? isFree : true,
      price: price || 0,
      thumbnail: thumbnail || '',
      modules: modules || [],
      learningOutcomes: learningOutcomes || [],
      requirements: requirements || [],
      instructor: req.user._id,
      status: 'draft'
    });

    await course.save();
    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (err) {
    next(err);
  }
}

/**
 * Update course (by instructor/admin)
 */
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check authorization - only instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json({ success: true, message: 'Course updated successfully', data: course });
  } catch (err) {
    next(err);
  }
}

/**
 * Publish course (make it available to students)
 */
async function publishCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to publish this course' });
    }

    course.status = 'published';
    course.isPublished = true;
    await course.save();

    res.json({ success: true, message: 'Course published successfully', data: course });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete course (soft delete - archive)
 */
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    course.status = 'archived';
    await course.save();

    res.json({ success: true, message: 'Course archived successfully' });
  } catch (err) {
    next(err);
  }
}

// ==================== COURSE BROWSING ====================

/**
 * Get all published courses (with filters)
 */
async function listCourses(req, res, next) {
  try {
    const { category, search, level, tags, page = 1, limit = 10 } = req.query;
    let query = { isPublished: true, status: 'published' };

    if (category) query.category = category;
    if (level) query.level = level;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .select('-modules')
      .populate('instructor', 'name avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get course details by ID
 */
async function getCourseDetails(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('instructor', 'name avatar email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ user: req.user._id, course: id });
      isEnrolled = !!enrollment;
    }

    res.json({ success: true, data: { ...course.toObject(), isEnrolled } });
  } catch (err) {
    next(err);
  }
}

/**
 * Get instructor's courses
 */
async function getInstructorCourses(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ instructor: req.user._id })
      .select('-modules')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ instructor: req.user._id });

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// ==================== ENROLLMENT ====================

/**
 * Enroll user in course
 */
async function enrollCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (enrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Create enrollment
    enrollment = new Enrollment({
      user: userId,
      course: courseId,
      enrollmentDate: new Date()
    });

    await enrollment.save();
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    await course.save();

    res.status(201).json({ success: true, message: 'Successfully enrolled in course', data: enrollment });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user's progress
 */
async function updateProgress(req, res, next) {
  try {
    const { enrollmentId } = req.params;
    const { currentLessonIndex, currentModuleIndex, completedLessons, completedModules, totalTimeSpent } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Check authorization
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update progress
    if (currentLessonIndex !== undefined) enrollment.currentLessonIndex = currentLessonIndex;
    if (currentModuleIndex !== undefined) enrollment.currentModuleIndex = currentModuleIndex;
    if (completedLessons) enrollment.completedLessons = completedLessons;
    if (completedModules) enrollment.completedModules = completedModules;
    if (totalTimeSpent !== undefined) enrollment.totalTimeSpent += totalTimeSpent;

    // Calculate progress percentage
    const course = await Course.findById(enrollment.course);
    const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    enrollment.progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    res.json({ success: true, message: 'Progress updated', data: enrollment });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark lesson as complete
 */
async function completeLesson(req, res, next) {
  try {
    const { enrollmentId, lessonId } = req.params;
    const { score } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Check authorization
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if already completed
    const alreadyCompleted = enrollment.completedLessons.find(l => l.lessonId.toString() === lessonId);
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Lesson already completed' });
    }

    // Add to completed lessons
    enrollment.completedLessons.push({
      lessonId: lessonId,
      score: score || 0,
      completedAt: new Date()
    });

    // Recalculate progress
    const course = await Course.findById(enrollment.course);
    const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    enrollment.progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;

    // Check if course completed
    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
      enrollment.completionDate = new Date();
    }

    await enrollment.save();

    res.json({ success: true, message: 'Lesson marked as complete', data: enrollment });
  } catch (err) {
    next(err);
  }
}

// ==================== QUIZ & ASSESSMENT ====================

/**
 * Submit quiz attempt
 */
async function submitQuiz(req, res, next) {
  try {
    const { enrollmentId, quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, userAnswer }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Check authorization
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get course and quiz
    const course = await Course.findById(enrollment.course);
    let quiz = null;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.quiz && lesson.quiz._id.toString() === quizId) {
          quiz = lesson.quiz;
          break;
        }
      }
      if (quiz) break;
    }

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    const result = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.userAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect
      };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const score = (correctCount / quiz.questions.length) * totalPoints;
    const percentage = (correctCount / quiz.questions.length) * 100;
    const passed = percentage >= quiz.passingScore;

    // Save attempt
    const attempt = {
      quizId,
      score,
      totalPoints,
      percentage,
      passed,
      answers: result,
      attemptDate: new Date()
    };

    enrollment.quizAttempts.push(attempt);
    await enrollment.save();

    res.json({
      success: true,
      message: passed ? 'Quiz passed' : 'Quiz failed',
      data: {
        score,
        totalPoints,
        percentage,
        passed,
        answers: result
      }
    });
  } catch (err) {
    next(err);
  }
}

// ==================== CERTIFICATE ====================

/**
 * Generate certificate upon course completion
 */
async function generateCertificate(req, res, next) {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Check authorization
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if course is completed
    if (!enrollment.isCompleted) {
      return res.status(400).json({ success: false, message: 'Course not completed yet' });
    }

    // Check if certificate already issued
    if (enrollment.certificateIssued) {
      return res.status(400).json({ success: false, message: 'Certificate already issued' });
    }

    // Generate certificate ID
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    enrollment.certificateIssued = true;
    enrollment.certificateIssuedDate = new Date();
    enrollment.certificateId = certificateId;
    // certificateUrl would be generated by a certificate service
    enrollment.certificateUrl = `/api/certificates/${certificateId}`;

    await enrollment.save();

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        certificateId,
        certificateUrl: enrollment.certificateUrl
      }
    });
  } catch (err) {
    next(err);
  }
}

// ==================== USER'S LEARNING ====================

/**
 * Get user's enrolled courses (my learning)
 */
async function getMyLearning(req, res, next) {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user._id };
    if (status === 'completed') query.isCompleted = true;
    if (status === 'in-progress') query.isCompleted = false;

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title thumbnail description category')
      .skip(skip)
      .limit(Number(limit))
      .sort({ lastAccessedAt: -1 });

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's course statistics
 */
async function getUserStats(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id });

    const stats = {
      totalEnrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.isCompleted).length,
      inProgressCourses: enrollments.filter(e => !e.isCompleted).length,
      certificatesEarned: enrollments.filter(e => e.certificateIssued).length,
      totalTimeSpent: enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0)
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
};

