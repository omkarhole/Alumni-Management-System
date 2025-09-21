const express=require('express');

const careerRouter=require('./carrier.route.js');
const courseRouter=require('./carrier.route.js');
const eventRouter=require('./carrier.route.js');
const forumRouter=require('./carrier.route.js');
const galleryRouter=require('./carrier.route.js');
const settingsRouter=require('./carrier.route.js');
const userRouter=require('./carrier.route.js');
const dashboardRouter=require('./carrier.route.js');

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