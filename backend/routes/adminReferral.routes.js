const express = require('express');
const {
  getAdminReferrals,
  getReferralModerationActions,
  flagReferralForSpam,
  hideReferral,
  restoreReferral,
  suspendReferralPoster
} = require('../controllers/referral.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/', getAdminReferrals);
router.get('/:id/moderation-actions', getReferralModerationActions);
router.post('/:id/flag', flagReferralForSpam);
router.post('/:id/hide', hideReferral);
router.post('/:id/restore', restoreReferral);
router.post('/:id/suspend-poster', suspendReferralPoster);

module.exports = router;