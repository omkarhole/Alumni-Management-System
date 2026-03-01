const express = require('express');
const { login, signup, logout, session, requestPasswordReset, verifyOtp, resetPassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/session', authenticate, session);

router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
