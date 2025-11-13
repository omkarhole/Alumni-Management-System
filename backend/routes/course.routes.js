const express=require('express');
const {
  listCourses,
  addCourse,
  updateCourse,
  deleteCourse
}=require('../controllers/course.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const router=express.Router();

router.get('/', listCourses);
router.post('/', authenticate, isAdmin, addCourse);
router.put('/:id', authenticate, isAdmin, updateCourse);
router.delete('/:id', authenticate, isAdmin, deleteCourse);

module.exports=router;