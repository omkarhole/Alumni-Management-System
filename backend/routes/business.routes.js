const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ==================== BUSINESS ROUTES ====================

// Public routes
router.get('/filter-options', businessController.getBusinessFilterOptions);
router.get('/', businessController.listBusinesses);
router.get('/:businessId', businessController.getBusinessById);
router.get('/:businessId/reviews', businessController.getBusinessReviews);

// Protected routes (alumni only)
router.post('/register', authenticate, businessController.registerBusiness);
router.get('/my-business', authenticate, businessController.getMyBusiness);
router.put('/my-business', authenticate, businessController.updateMyBusiness);
router.patch('/my-business/status', authenticate, businessController.toggleMyBusinessStatus);

// Review routes (authenticated users)
router.post('/:businessId/reviews', authenticate, businessController.addReview);
router.put('/reviews/:reviewId', authenticate, businessController.updateMyReview);
router.delete('/reviews/:reviewId', authenticate, businessController.deleteMyReview);
router.patch('/reviews/:reviewId/helpful', businessController.markReviewHelpful);

// Admin routes
router.get('/admin/all', authenticate, businessController.getAllBusinessesAdmin);
router.get('/admin/stats', authenticate, businessController.getBusinessStats);
router.patch('/admin/:businessId/featured', authenticate, businessController.toggleFeaturedStatus);
router.patch('/admin/:businessId/verify', authenticate, businessController.toggleVerificationStatus);
router.patch('/admin/:businessId/status', authenticate, businessController.toggleBusinessActiveStatus);
router.patch('/admin/reviews/:reviewId/visibility', authenticate, businessController.toggleReviewVisibility);

module.exports = router;
