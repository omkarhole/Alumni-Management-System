const express=require('express');
const {
  listUsers,
  updateUser,
  deleteUser
}=require('../controllers/user.controller');
const authenticate=require('../middlewares/auth.middleware');
const router=express.Router();

// list of all users

router.get('/',authenticate,listUsers);

// update a user (name, email, type, password)
router.put('/:id', authenticate, updateUser);

// delete a user
router.delete('/:id', authenticate, deleteUser);


module.exports=router;