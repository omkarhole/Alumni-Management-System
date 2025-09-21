const express=require('express');
const authenticate = require('../middlewares/auth.middleware');



const router=express.Router();


// admin -only  summary counts

router.get('/counts',authenticate,getCounts);

module.exports=router;