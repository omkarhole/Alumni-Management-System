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

// forum topics routes
router.get('/',listForums);
router.post('/',addForum);
router.put('/:id',updateForum);
router.delete('/:id',deleteForum);

// comments routes
router.get('/:topicId/comments',listComments);
router.post('/:topicId/comments', addComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);


module.exports=router;