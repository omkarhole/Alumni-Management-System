const express = require('express');
const {
  createReferral,
  getReferrals,
  applyForReferral,
  acceptReferral,
  rejectReferral,
  getMyReferrals
} = require('../controllers/referral.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Create new referral opportunity (alumni)
router.post('/', authenticate, createReferral);

// Get all referrals
router.get('/', authenticate, getReferrals);

// Apply for referral
router.post('/:id/apply', authenticate, applyForReferral);

// Manage applicants (only poster)
router.put('/:id/applicants/:applicantId/accept', authenticate, acceptReferral);
router.put('/:id/applicants/:applicantId/reject', authenticate, rejectReferral);

// Get single referral
router.get('/:id', authenticate, getReferralById);

// Get my referrals
router.get('/my-referrals', authenticate, getMyReferrals);

module.exports = router;

