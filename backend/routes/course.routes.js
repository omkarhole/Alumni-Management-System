const express=require('express');
const {
  listCourses,
  addCourse,
  updateCourse,
  deleteCourse
}=require('../controllers/course.controller');
const router=express.Router();

router.get('/',listCourses);
router.post('/',addCourse);
router.put('/:id',updateCourse);
router.delete('/:id',deleteCourse);

module.exports=router;