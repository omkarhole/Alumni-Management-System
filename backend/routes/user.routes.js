const express=require('express');
const {
  listUsers,
  updateUser,
  deleteUser
}=require('../controllers/user.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const router=express.Router();

// list of all users (admin only)

router.get('/', authenticate, isAdmin, listUsers);

// update a user (admin only)
router.put('/:id', authenticate, isAdmin, updateUser);

// delete a user (admin only)
router.delete('/:id', authenticate, isAdmin, deleteUser);


module.exports=router;