const { News, Newsletter } = require('../models/Index');
const sendEmail = require('../utils/mailer');

// List all published news
async function listNews(req, res, next) {
  try {
    const news = await News.find({ isPublished: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    next(err);
  }
}

// Get news by ID
async function getNewsById(req, res, next) {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name');
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (err) {
    next(err);
  }
}

// Get news by category
async function listNewsByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const news = await News.find({ category, isPublished: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    next(err);
  }
}

// Add news (admin only)
async function addNews(req, res, next) {
  try {
    const news = await News.create(req.body);
    res.status(201).json({ message: 'Created', news });
  } catch (err) {
    next(err);
  }
}

// Update news (admin only)
async function updateNews(req, res, next) {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    const news = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'Updated', news });
  } catch (err) {
    next(err);
  }
}

// Delete news (admin only)
async function deleteNews(req, res, next) {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

// Subscribe to newsletter
async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      return res.json({ message: 'Subscription reactivated' });
    }

    const subscriber = await Newsletter.create({ email });
    res.status(201).json({ message: 'Subscribed successfully', subscriber });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    next(err);
  }
}

// Unsubscribe from newsletter
async function unsubscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found' });
    }

    subscriber.isActive = false;
    await subscriber.save();
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    next(err);
  }
}

// List all subscribers (admin only)
async function listSubscribers(req, res, next) {
  try {
    const subscribers = await Newsletter.find()
      .sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listNews,
  getNewsById,
  listNewsByCategory,
  addNews,
  updateNews,
  deleteNews,
  subscribeNewsletter,
  unsubscribeNewsletter,
  listSubscribers
};
