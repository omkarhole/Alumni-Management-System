const express=require('express');
const { isStudent } = require('../middlewares/auth.middleware');
const { getStudentProfile, updateStudentProfile, getMyApplications } = require('../controllers/student.controller');
const router=express.Router();


// student profile routes
// student - only profile routes
router.get("/profile",isStudent, getStudentProfile);
router.put("/profile",isStudent, updateStudentProfile);

// student - only my applications route
router.get('/my-applications', isStudent, getMyApplications);


module.exports=router;