const { User, Career, Event, ForumTopic } = require("../models");
const bcrypt = require('bcrypt');

async function getMyApplications(req,res,next){
    try{
        // Find all career applications for the logged-in student
        const applications=await Career.find({'applicants.user': req.user.id})
        .populate('user', 'name email student_bio')
        .populate('applicants.user', 'name email student_bio');
        res.json(applications);
    }catch(error){
     
        next(error);
    }
}
// get student profile details
async function getStudentProfile(req,res,next){
    try{
        const student=await User.findById(req.user.id)
        .populate('student_bio.course');
        res.json(student);

        }
    catch(err){
        next(err);
    }
}   
// update student (bio) profile details
async function updateStudentProfile(req,res,next){
    try{
        const {name,email,student_bio,password}=req.body;
        const updates={name,email,student_bio};
        if(password){
            updates.password=await bcrypt.hash(password,10);
        }
        const updatedStudent=await User.findByIdAndUpdate(req.user.id,updates,{new:true})
        .populate('student_bio.course');
        res.json(updatedStudent);
    }catch(err){
        next(err);
    }

}
async function getCounts(req, res, next) {
    try {
        const userId = req.user.id;

        const [forumCount, jobCount, upEventCount, myApplicationsCount] = await Promise.all([
            // total forum topics count
            ForumTopic.countDocuments(),
            // total jobs count
            Career.countDocuments(),
            // upcoming events count
            Event.countDocuments({ schedule: { $gte: new Date() } }),
            // my applications count
            Career.countDocuments({ 'applicants.user': userId })
        ]);

        // return counts as json
        res.json({
            forums: forumCount,
            jobs: jobCount,
            upevents: upEventCount,
            applications: myApplicationsCount
        });
    }
    catch (err) {
        next(err);
    }
}

module.exports={getMyApplications,getStudentProfile,updateStudentProfile,getCounts};