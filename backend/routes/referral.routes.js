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
  computeReferralBonus,
  checkReferralAccessMiddleware
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

// Get my referrals
router.get('/my-referrals', authenticate, getMyReferrals);

// Check access for all ID-based subroutes
router.use('/:id', authenticate, checkReferralAccessMiddleware);

// Apply for referral
router.post('/:id/apply', isStudent, applyForReferral);

// Referral Q&A / messaging
router.post('/:id/messages', sendReferralMessage);
router.get('/:id/messages', getReferralMessages);

// Referral bonus computation
router.post('/:id/compute-bonus', allowBonusCompute, computeReferralBonus);

// Manage applicants (only poster)
router.put('/:id/applicants/:applicantId/accept', acceptReferral);
router.put('/:id/applicants/:applicantId/reject', rejectReferral);

// Close referral (poster/admin)
router.patch('/:id/close', closeReferral);

// Get referral timeline
router.get('/:id/timeline', getReferralTimeline);

// Get single referral
router.get('/:id', getReferralById);

module.exports = router;

