const express = require('express');

const { googleAuthRedirect, googleAuthCallback, googleCompleteSignup } = require('../controllers/oauth.controller');

const router = express.Router();

router.get('/google', googleAuthRedirect);
router.get('/callback/google', googleAuthCallback);
router.post('/google/complete-signup', googleCompleteSignup);

module.exports = router;