const { Course } = require('../models/Index');

async function listCourses(req, res, next) {
    try {
        res.json(await Course.findAll());
    } catch (err) {
        next(err);
    }
}

async function addCourse(req, res, next) {

    try {
        res.status(201).json(await Course.create(req.body));
    } catch (err) {
        next(err);
    }
}

async function updateCourse(req, res, next) {
    try {
        await Course.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Updated' });
    } catch (err) {
        next(err);
    }
}
async function deleteCourse(req,res,next){
    try{
        await Course.destroy({where:{id:req.params.id}});
        res.json({message:'Deleted'});
    }
    catch(err){
        next(err);
    }
}

module.exports={
    listCourses,
    addCourse,
    updateCourse,
    deleteCourse
}