const express=require('express');

const {
    listCarrers,
    addCareer,
    updateCareer,
    deleteCareer,
    applyToJob,
    getJobApplications,
    updateApplicationStatus,
    getMyApplications,
    getJobRecommendations,
    subscribeToJobs,
    unsubscribeFromJobs,
    getSubscription,
    referCandidate,
    getMyReferrals,
    getAllReferrals,
    getJobReferrals,
    updateReferralStatus,
    deleteReferral,
    // trackJobInteraction,
    // getSimilarAlumniCareerPaths,
    // getSkillGapAnalysis,
    // getEnhancedJobRecommendations,
    // submitRecommendationFeedback,
    // getRecommendationAnalytics
}=require('../controllers/career.controller');

const { authenticate, canPostJobs, isStudent, isAdmin } = require('../middlewares/auth.middleware');

const router=express.Router();

// all careers routes  for admin and authenticated users

router.get('/', authenticate, listCarrers);
router.post('/', authenticate, canPostJobs, addCareer);
router.put('/:id', authenticate, canPostJobs, updateCareer);
router.delete('/:id', authenticate, canPostJobs, deleteCareer);

// job application routes for students
router.post('/:id/apply', authenticate, isStudent, applyToJob);
router.get('/:id/applicants', authenticate, canPostJobs, getJobApplications);
router.patch('/:jobId/applicants/:userId', authenticate, canPostJobs, updateApplicationStatus);
router.get('/my-applications', authenticate, isStudent, getMyApplications);

// job recommendation routes
router.get('/recommendations', authenticate, getJobRecommendations);
router.get('/subscription', authenticate, getSubscription);
router.post('/subscribe', authenticate, subscribeToJobs);
router.post('/unsubscribe', authenticate, unsubscribeFromJobs);

// Job Referral Routes
// Refer a candidate for a job (alumni only)
router.post('/:jobId/refer', authenticate, canPostJobs, referCandidate);

// Get referrals for a specific job (job poster or admin)
router.get('/:jobId/referrals', authenticate, getJobReferrals);

// Get my referrals (for alumni who made them)
router.get('/my-referrals', authenticate, getMyReferrals);

// Get all referrals (admin only)
router.get('/all-referrals', authenticate, isAdmin, getAllReferrals);

// Update referral status
router.put('/referrals/:id/status', authenticate, updateReferralStatus);

// Delete a referral
router.delete('/referrals/:id', authenticate, deleteReferral);

// AI-Powered Job Recommendation Routes (commented out for testing)
// router.post('/interactions', authenticate, trackJobInteraction);
// router.get('/similar-alumni', authenticate, getSimilarAlumniCareerPaths);
// router.get('/:jobId/skill-gap', authenticate, getSkillGapAnalysis);
// router.get('/recommendations/enhanced', authenticate, getEnhancedJobRecommendations);
// router.post('/recommendations/feedback', authenticate, submitRecommendationFeedback);
// router.get('/analytics', authenticate, getRecommendationAnalytics);

module.exports=router;
