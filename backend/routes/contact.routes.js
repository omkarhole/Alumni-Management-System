const express = require('express');
const { createContact } = require('../controllers/contact.controller');
const router = express.Router();

// POST /api/contact
router.post('/', createContact);

// GET test route
router.get('/test', (req, res) => {
    res.json({ message: "Contact router is mounted" });
});

module.exports = router;
