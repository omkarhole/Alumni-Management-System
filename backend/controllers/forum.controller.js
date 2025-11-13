const {ForumTopic,User}=require('../models/index');

// list all forum topics with user names
async function listForums(req, res, next) {
    try {
        const forums = await ForumTopic.find()
            .populate('user', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.json(forums);
    } catch (err) { next(err); }
}
// add new forum topic
async function addForum(req, res, next) {
    try {
        const topicData = {
            title: req.body.title,
            description: req.body.description,
            user: req.body.user_id || req.body.user
        };
        const topic = await ForumTopic.create(topicData);
        res.status(201).json(topic);
    } catch (err) { next(err); }
}

// update forum topic
async function updateForum(req, res, next) {
    try {
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;
        if (req.body.user_id) {
            updateData.user = req.body.user_id;
            delete updateData.user_id;
        }
        await ForumTopic.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ message: 'Updated' });
    } catch (err) { next(err); }
}
// delete forum topic
async function deleteForum(req, res, next) {
    try {
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