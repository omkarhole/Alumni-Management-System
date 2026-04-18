const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const { avatarUpload } = require('../utils/file-upload');

const {
  getCampaigns,
  getCampaignDetails,
  createCampaign,
  updateCampaign,
  addCampaignUpdate,
  getDonations,
  getDonorHistory,
  createDonationIntent,
  completeDonation,
  getDonorBadges,
  getDonationStats
} = require('../controllers/donation.controller');

/**
 * ==================== CAMPAIGN ROUTES ====================
 */

// Get all campaigns (public)
router.get('/campaigns', getCampaigns);

// Get campaign details (public)
router.get('/campaigns/:campaignId', getCampaignDetails);

// Create campaign (admin only)
router.post('/campaigns', authenticate, isAdmin, avatarUpload.single('image'), createCampaign);

// Update campaign (admin only)
router.put('/campaigns/:campaignId', authenticate, isAdmin, avatarUpload.single('image'), updateCampaign);

// Add campaign update/milestone (admin only)
router.post('/campaigns/:campaignId/updates', authenticate, isAdmin, addCampaignUpdate);

/**
 * ==================== DONATION ROUTES ====================
 */

// Get donations (admin)
router.get('/admin/donations', authenticate, isAdmin, getDonations);

// Get donor's history (authenticated)
router.get('/my-donations', authenticate, getDonorHistory);

// Create donation intent (public with email)
router.post('/donate', createDonationIntent);

// Complete donation (webhook or direct)
router.post('/donations/:donationId/complete', completeDonation);

/**
 * ==================== BADGE ROUTES ====================
 */

// Get donor badges (authenticated)
router.get('/badges', authenticate, getDonorBadges);

/**
 * ==================== STATISTICS ROUTES ====================
 */

// Get donation statistics (admin)
router.get('/stats', authenticate, isAdmin, getDonationStats);

module.exports = router;
