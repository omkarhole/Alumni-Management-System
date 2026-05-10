const { User, Poll } = require('../models/Index');
const mongoose = require('mongoose');

// ==================== POLL CONTROLLERS ====================

// Create a new poll (admin/authorized users only)
async function createPoll(req, res, next) {
  try {
    const userId = req.user.id;
    const { question, description, options, anonymous, category, visibility, expiresAt, allowMultipleVotes } = req.body;

    // Validate required fields
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Poll must have a question and at least 2 options' });
    }

    // Create option objects with IDs
    const pollOptions = options.map(opt => ({
      _id: new mongoose.Types.ObjectId(),
      text: opt,
      votes: 0
    }));

    const poll = new Poll({
      question,
      description: description || '',
      options: pollOptions,
      createdBy: userId,
      anonymous: anonymous !== false,
      category: category || 'General',
      visibility: visibility || 'Public',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      allowMultipleVotes: allowMultipleVotes || false,
      status: 'Active'
    });

    await poll.save();
    await poll.populate('createdBy', 'name email alumnus_bio.avatar');

    res.status(201).json({
      message: 'Poll created successfully',
      poll
    });
  } catch (err) {
    next(err);
  }
}

// Get all active polls (with filtering)
async function getPolls(req, res, next) {
  try {
    const { category, status = 'Active', visibility, page = 1, limit = 10 } = req.query;
    const userId = req.user?.id;

    const filter = { status };

    // Apply category filter
    if (category) {
      filter.category = category;
    }

    // Apply visibility filter based on user role
    if (visibility) {
      filter.visibility = visibility;
    } else {
      // Default: show public polls to everyone, all polls to authenticated users
      if (userId) {
        filter.$or = [
          { visibility: 'Public' },
          { visibility: 'Alumni Only' },
          { visibility: 'Admin Only', createdBy: userId }
        ];
      } else {
        filter.visibility = 'Public';
      }
    }

    const skip = (page - 1) * limit;

    const polls = await Poll.find(filter)
      .populate('createdBy', 'name alumnus_bio.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Poll.countDocuments(filter);

    // Auto-close expired polls
    const now = new Date();
    await Poll.updateMany(
      { expiresAt: { $lt: now }, status: 'Active' },
      { status: 'Closed' }
    );

    res.json({
      polls,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get single poll details
async function getPollById(req, res, next) {
  try {
    const { pollId } = req.params;
    const userId = req.user?.id;

    const poll = await Poll.findById(pollId).populate('createdBy', 'name email alumnus_bio.avatar');

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check auto-close
    await poll.checkAndClosePoll();

    // Get user's vote if authenticated
    let userVote = null;
    if (userId) {
      userVote = poll.getUserVote(userId);
    }

    res.json({
      poll,
      userVote,
      stats: poll.getStats()
    });
  } catch (err) {
    next(err);
  }
}

// Vote on a poll
async function vote(req, res, next) {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.id;

    if (!optionId) {
      return res.status(400).json({ error: 'Option ID is required' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll is still active
    await poll.checkAndClosePoll();
    if (poll.status !== 'Active') {
      return res.status(400).json({ error: 'This poll is no longer active' });
    }

    // Submit vote
    await poll.vote(userId, optionId, poll.allowMultipleVotes);

    res.json({
      message: 'Vote recorded successfully',
      stats: poll.getStats()
    });
  } catch (err) {
    if (err.message === 'User has already voted on this poll' || err.message === 'Invalid option') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// Get poll results
async function getPollResults(req, res, next) {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    await poll.checkAndClosePoll();

    res.json({
      pollId: poll._id,
      question: poll.question,
      stats: poll.getStats()
    });
  } catch (err) {
    next(err);
  }
}

// Close a poll (admin/creator only)
async function closePoll(req, res, next) {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check authorization
    if (poll.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to close this poll' });
    }

    poll.status = 'Closed';
    await poll.save();

    res.json({
      message: 'Poll closed successfully',
      stats: poll.getStats()
    });
  } catch (err) {
    next(err);
  }
}

// Update a poll (admin/creator only)
async function updatePoll(req, res, next) {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;
    const { question, description, category, visibility, expiresAt } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check authorization
    if (poll.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this poll' });
    }

    // Can only update certain fields
    if (question) poll.question = question;
    if (description) poll.description = description;
    if (category) poll.category = category;
    if (visibility) poll.visibility = visibility;
    if (expiresAt) poll.expiresAt = new Date(expiresAt);

    await poll.save();

    res.json({
      message: 'Poll updated successfully',
      poll
    });
  } catch (err) {
    next(err);
  }
}

// Delete a poll (admin/creator only)
async function deletePoll(req, res, next) {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check authorization
    if (poll.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this poll' });
    }

    await Poll.findByIdAndDelete(pollId);

    res.json({
      message: 'Poll deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Get poll categories
async function getCategories(req, res, next) {
  try {
    const categories = ['Feedback', 'Event', 'Decision', 'Interest', 'General'];
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => ({
        name: category,
        count: await Poll.countDocuments({ category, status: 'Active' })
      }))
    );

    res.json(categoryStats);
  } catch (err) {
    next(err);
  }
}

// Get my polls (created by current user)
async function getMyPolls(req, res, next) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const polls = await Poll.find({ createdBy: userId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Poll.countDocuments({ createdBy: userId });

    res.json({
      polls,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get poll statistics (admin)
async function getPollStats(req, res, next) {
  try {
    const totalPolls = await Poll.countDocuments();
    const activePolls = await Poll.countDocuments({ status: 'Active' });
    const closedPolls = await Poll.countDocuments({ status: 'Closed' });
    const categories = await Poll.distinct('category');

    const categoryBreakdown = {};
    for (const category of categories) {
      categoryBreakdown[category] = await Poll.countDocuments({ category });
    }

    const totalVotes = await Poll.aggregate([
      { $group: { _id: null, total: { $sum: '$totalVotes' } } }
    ]);

    res.json({
      total: totalPolls,
      active: activePolls,
      closed: closedPolls,
      totalVotes: totalVotes[0]?.total || 0,
      categories: categoryBreakdown
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPoll,
  getPolls,
  getPollById,
  vote,
  getPollResults,
  closePoll,
  updatePoll,
  deletePoll,
  getCategories,
  getMyPolls,
  getPollStats
};
