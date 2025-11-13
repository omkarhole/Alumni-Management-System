const express=require('express');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const getCounts=require('../controllers/dashboard.controller');

const router=express.Router();


// admin -only  summary counts

router.get('/counts', authenticate, isAdmin, getCounts);

module.exports=router;