const {ForumTopic,ForumComment,User}=require('../models/Index');

// list all forum topics with user names
async function listForums(req, res, next) {
    try {
        const forums = await ForumTopic.findAll({
            include: { model: User, as: 'user', attributes: ['name'] },
            order: [['id', 'DESC']]
        });
        res.json(forums);
    } catch (err) { next(err); }
}
// add new forum topic
async function addForum(req, res, next) {
    try {
        const topic = await ForumTopic.create(req.body);
        res.status(201).json(topic);
    } catch (err) { next(err); }
}

// update forum topic
async function updateForum(req, res, next) {
    try {
        await ForumTopic.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Updated' });
    } catch (err) { next(err); }
}
// delete forum topic
async function deleteForum(req, res, next) {
    try {
        await ForumTopic.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
}

// list comments for a forum topic
async function listComments(req, res, next) {
  try {
    const comments = await ForumComment.findAll({
      where: { topic_id: req.params.topicId },
      include: { model: User, as: 'user', attributes: ['name'] },
      order: [['id', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

// add comment to a forum topic
async function addComment(req, res, next) {
  try {
    const payload = {
      comment:  req.body.c,
      user_id:  req.body.user_id,
      topic_id: +req.params.topicId
    };
    const comment = await ForumComment.create(payload);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// update comment
async function updateComment(req, res, next) {
    try {
        await ForumComment.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Updated' });
    } catch (err) { next(err); }
}

// delete comment
async function deleteComment(req, res, next) {
    try {
        await ForumComment.destroy({ where: { id: req.params.id } });
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