const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { createContact } = require('../controllers/contact.controller');
const { validateRequest } = require('../middlewares/validation.middleware');
const router = express.Router();

const contactSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    subject: Joi.string().trim().min(3).max(150).required(),
    message: Joi.string().trim().min(10).max(2000).required(),
    honeypot: Joi.string().allow('').optional()
});

const contactRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many contact requests. Please try again later.'
    }
});

// POST /api/contact
router.post('/', contactRateLimiter, validateRequest(contactSchema), createContact);

// GET test route
router.get('/test', (req, res) => {
    res.json({ message: "Contact router is mounted" });
});

module.exports = router;
