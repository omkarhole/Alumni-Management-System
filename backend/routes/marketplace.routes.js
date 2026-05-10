const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplace.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ==================== MARKETPLACE ROUTES ====================

// Public routes
router.get('/categories', marketplaceController.getCategoryOptions);
router.get('/stats', marketplaceController.getMarketplaceStats);
router.get('/', marketplaceController.getAllListings);
router.get('/:listingId', marketplaceController.getListingById);

// Protected routes (alumni only)
router.post('/', authenticate, marketplaceController.createListing);
router.get('/my-listings', authenticate, marketplaceController.getMyListings);
router.put('/:listingId', authenticate, marketplaceController.updateListing);
router.patch('/:listingId/status', authenticate, marketplaceController.updateListingStatus);
router.delete('/:listingId', authenticate, marketplaceController.deleteListing);
router.post('/:listingId/like', authenticate, marketplaceController.toggleLike);

// Admin routes
router.get('/admin/all', authenticate, marketplaceController.getAllListingsAdmin);
router.patch('/admin/:listingId/featured', authenticate, marketplaceController.toggleFeaturedStatus);
router.patch('/admin/:listingId/verify', authenticate, marketplaceController.toggleVerificationStatus);

module.exports = router;
