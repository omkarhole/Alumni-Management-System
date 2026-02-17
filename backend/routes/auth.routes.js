const express=require('express');
const {login,signup,logout,session}=require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router=express.Router();

router.post('/login',login);
router.post('/signup',signup);
router.post('/logout',logout);
router.get('/session', authenticate, session);

module.exports=router;
