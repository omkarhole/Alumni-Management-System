const express=require('express');
const router=express.Router();
const{
    listForums,
    addForum,
    updateForum,
    deleteForum,
    listComments,
    addComment,
    updateComment,
    deleteComment
} = require('../controllers/forum.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// forum topics routes (all authenticated users)
router.get('/', authenticate, listForums);
router.post('/', authenticate, addForum);
router.put('/:id', authenticate, updateForum);
router.delete('/:id', authenticate, deleteForum);

// comments routes (all authenticated users)
router.get('/:topicId/comments', authenticate, listComments);
router.post('/:topicId/comments', authenticate, addComment);
router.put('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);


module.exports=router;