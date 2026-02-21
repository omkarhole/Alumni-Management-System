const express=require('express');

const careerRouter=require('./career.routes.js');
const courseRouter=require('./course.routes.js');
const eventRouter=require('./event.routes.js');
const forumRouter=require('./forum.routes.js');
const galleryRouter=require('./gallery.routes.js');
const settingsRouter=require('./settings.routes.js');
const userRouter=require('./user.routes.js');
const dashboardRouter=require('./dashboard.routes.js');
const alumniRouter=require('./alumni.routes.js');

const router=express.Router();

// added all routes for admin here

router.use('/dashboard', dashboardRouter);
router.use('/users', userRouter);

router.use('/jobs', careerRouter);
router.use('/courses', courseRouter);
router.use('/events', eventRouter);
router.use('/forums', forumRouter);
router.use('/gallery', galleryRouter);
router.use('/alumni', alumniRouter);
router.use('/settings', settingsRouter);


module.exports=router;