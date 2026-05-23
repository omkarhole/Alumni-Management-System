const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getSavedItems,
  toggleSavedItem
} = require('../controllers/opportunity.controller');

const router = express.Router();

router.get('/', authenticate, getSavedItems);
router.post('/', authenticate, toggleSavedItem);

module.exports = router;