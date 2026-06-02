const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, signup, logout, session, requestPasswordReset, verifyOtp, resetPassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Strict rate limiter for credential and OTP endpoints.
// Limits brute-force password attacks, OTP guessing, and email enumeration.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// Looser limiter for account creation to prevent bulk signup abuse.
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many signup attempts. Please try again later.' },
});

// OTP and password-reset endpoints share the same tight window as login.
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

router.post('/login', loginLimiter, login);
router.post('/signup', signupLimiter, signup);
router.post('/logout', logout);
router.get('/session', authenticate, session);

router.post('/forgot-password', otpLimiter, requestPasswordReset);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/reset-password', otpLimiter, resetPassword);

module.exports = router;
