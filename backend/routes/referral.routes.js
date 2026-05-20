const express = require('express');
const {
  createReferral,
  getReferrals,
  applyForReferral,
  acceptReferral,
  rejectReferral,
  closeReferral,
  getMyReferrals,
  getReferralById,
  getReferralTimeline
} = require('../controllers/referral.controller');
const { authenticate, isStudent } = require('../middlewares/auth.middleware');

const router = express.Router();

// Create new referral opportunity (alumni)
router.post('/', authenticate, createReferral);

// Get all referrals
router.get('/', authenticate, getReferrals);

// Apply for referral
router.post('/:id/apply', authenticate, isStudent, applyForReferral);

// Manage applicants (only poster)
router.put('/:id/applicants/:applicantId/accept', authenticate, acceptReferral);
router.put('/:id/applicants/:applicantId/reject', authenticate, rejectReferral);

// Close referral (poster/admin)
router.patch('/:id/close', authenticate, closeReferral);

// Get referral timeline
router.get('/:id/timeline', authenticate, getReferralTimeline);

// Get my referrals
router.get('/my-referrals', authenticate, getMyReferrals);

// Get single referral
router.get('/:id', authenticate, getReferralById);

module.exports = router;

