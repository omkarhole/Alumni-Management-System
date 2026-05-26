const express = require('express');
const {
  createReferral,
  getReferrals,
  applyForReferral,
  acceptReferral,
  rejectReferral,
  closeReferral,
  getReferralMessages,
  sendReferralMessage,
  getMyReferrals,
  getReferralById,
  getReferralTimeline,
  computeReferralBonus
} = require('../controllers/referral.controller');
const { authenticate, isStudent } = require('../middlewares/auth.middleware');

const router = express.Router();

const allowBonusCompute = (req, res, next) => {
  const internalToken = process.env.INTERNAL_BONUS_TOKEN;
  const providedToken = req.headers['x-internal-bonus-token'];
  const isInternal = Boolean(internalToken && providedToken && providedToken === internalToken);

  if (isInternal || req.user?.type === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Admin access required' });
};

// Create new referral opportunity (alumni)
router.post('/', authenticate, createReferral);

// Get all referrals
router.get('/', authenticate, getReferrals);

// Apply for referral
router.post('/:id/apply', authenticate, isStudent, applyForReferral);

// Referral Q&A / messaging
router.post('/:id/messages', authenticate, sendReferralMessage);
router.get('/:id/messages', authenticate, getReferralMessages);

// Referral bonus computation
router.post('/:id/compute-bonus', authenticate, allowBonusCompute, computeReferralBonus);

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

