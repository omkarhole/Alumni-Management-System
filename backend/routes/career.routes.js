const express=require('express');

const {listCarrers,addCareer,updateCareer,deleteCareer,applyToJob,getJobApplications,updateApplicationStatus,getMyApplications}=require('../controllers/career.controller');
const { authenticate, canPostJobs, isStudent } = require('../middlewares/auth.middleware');

const router=express.Router();

// all careers routes  for admin and authenticated users

router.get('/', authenticate, listCarrers);
router.post('/', authenticate, canPostJobs, addCareer);
router.put('/:id', authenticate, canPostJobs, updateCareer);
router.delete('/:id', authenticate, canPostJobs, deleteCareer);

// job application routes for students
router.post('/:id/apply', authenticate, isStudent, applyToJob);
router.get('/:id/applicants', authenticate, canPostJobs, getJobApplications);
router.patch('/:jobId/applicants/:userId', authenticate, canPostJobs, updateApplicationStatus);
router.get('/my-applications', authenticate, isStudent, getMyApplications);

module.exports=router;