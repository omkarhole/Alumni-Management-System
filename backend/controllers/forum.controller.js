const {ForumTopic,User}=require('../models/Index');

// Maximum number of forum topics returned per page (#265).
const FORUM_PAGE_SIZE = 20;

// list all forum topics with pagination (#265)
async function listForums(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(FORUM_PAGE_SIZE, parseInt(req.query.limit) || FORUM_PAGE_SIZE);
        const skip = (page - 1) * limit;

        const [forums, total] = await Promise.all([
            ForumTopic.find()
                .populate('user', 'name')
                .populate('comments.user', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ForumTopic.countDocuments(),
        ]);

        res.json({
            forums,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) { next(err); }
}

// add new forum topic - author derived from verified session, not request body (#263)
async function addForum(req, res, next) {
    try {
        const topicData = {
            title: req.body.title,
            description: req.body.description,
            // Always use the authenticated caller's ID. Never trust client-supplied
            // user_id or user fields, which would allow author impersonation.
            user: req.user.id || req.user._id,
        };
        const topic = await ForumTopic.create(topicData);
        res.status(201).json(topic);
    } catch (err) { next(err); }
}

// update forum topic - only the original author may edit (#264)
async function updateForum(req, res, next) {
    try {
        const topic = await ForumTopic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        // Ownership check: prevent any authenticated user from editing another user's topic.
        const callerId = String(req.user.id || req.user._id);
        if (String(topic.user) !== callerId) {
            return res.status(403).json({ message: 'Not authorised to update this topic' });
        }
        // Only allow updating title and description; never allow reassigning the author.
        const { title, description } = req.body;
        await ForumTopic.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true }
        );
        res.json({ message: 'Updated' });
    } catch (err) { next(err); }
}

// delete forum topic - only the original author may delete (#264)
async function deleteForum(req, res, next) {
    try {
        const topic = await ForumTopic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        const callerId = String(req.user.id || req.user._id);
        if (String(topic.user) !== callerId) {
            return res.status(403).json({ message: 'Not authorised to delete this topic' });
        }
        await ForumTopic.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
}

// list comments for a forum topic
async function listComments(req, res, next) {
  try {
    const topic = await ForumTopic.findById(req.params.topicId)
      .populate('comments.user', 'name');
    res.json(topic ? topic.comments : []);
  } catch (err) {
    next(err);
  }
}

// add comment to a forum topic
async function addComment(req, res, next) {
  try {
    const topic = await ForumTopic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    topic.comments.push({
      comment: req.body.comment,
      user: req.body.user_id
    });
    await topic.save();
    res.status(201).json(topic.comments[topic.comments.length - 1]);
  } catch (err) {
    next(err);
  }
}

// update comment
async function updateComment(req, res, next) {
    try {
        const topic = await ForumTopic.findOne({ 'comments._id': req.params.id });
        if (!topic) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const comment = topic.comments.id(req.params.id);
        comment.comment = req.body.comment;
        await topic.save();
        res.json({ message: 'Updated' });
    } catch (err) { next(err); }
}

// delete comment
async function deleteComment(req, res, next) {
    try {
        const topic = await ForumTopic.findOne({ 'comments._id': req.params.id });
        if (!topic) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // Use pull instead of remove
        topic.comments.pull({ _id: req.params.id });
        await topic.save();
        res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
}

module.exports={
    listForums,
    addForum,
    updateForum,
    deleteForum,
    listComments,
    addComment,
    updateComment,
    deleteComment
}