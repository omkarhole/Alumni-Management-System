const express = require('express');
const router = express.Router();

const {
  listNews,
  getNewsById,
  listNewsByCategory,
  addNews,
  updateNews,
  deleteNews,
  subscribeNewsletter,
  unsubscribeNewsletter,
  listSubscribers
} = require('../controllers/news.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Public routes - News
router.get('/', listNews);
router.get('/:id', getNewsById);
router.get('/category/:category', listNewsByCategory);

// Public routes - Newsletter
router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);

// Admin routes - News (protected)
router.post('/', authenticate, isAdmin, addNews);
router.put('/:id', authenticate, isAdmin, updateNews);
router.delete('/:id', authenticate, isAdmin, deleteNews);

// Admin routes - Newsletter (protected)
router.get('/newsletter/subscribers', authenticate, isAdmin, listSubscribers);

module.exports = router;
