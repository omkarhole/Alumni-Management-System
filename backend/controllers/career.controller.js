const {Career,User}=require('../models/index')


// print all careers
async function listCarrers(req,res,next){
    try{
        const careers=await Career.find()
            .populate('user', 'name')
            .populate({
                path: 'applicants.user',
                select: 'name email student_bio',
                populate: {
                    path: 'student_bio.course',
                    select: 'name course'
                }
            })
            .sort({ createdAt: -1 });
        res.json(careers);

    }
    catch(err){
        next(err);
    }

}

// add careers 
async function addCareer(req,res,next){
    try{
        // Map user_id to user for MongoDB compatibility
        const careerData = {
            company: req.body.company,
            location: req.body.location,
            job_title: req.body.job_title,
            description: req.body.description,
            user: req.body.user_id || req.body.user
        };
        const career=await Career.create(careerData);
        res.status(201).json(career);
    }
    catch(err){
        next(err);
    }
}
// update careers
async function updateCareer(req,res,next){
    try{
        // Map user_id to user for MongoDB compatibility
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.id;
        
        // Map user_id to user if present
        if (req.body.user_id) {
            updateData.user = req.body.user_id;
            delete updateData.user_id;
        }
        
        await Career.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({message:'updated successfully'});
    }
    catch(err){
        next(err);
    }

}

// delete careers
async function deleteCareer(req,res,next){
    try{
        await Career.findByIdAndDelete(req.params.id);
        res.json({message:'deleted successfully'});
    }
    catch(err){
        next(err);
    }
}

// apply to job (for students)
async function applyToJob(req, res, next) {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        // Check if user already applied
        const alreadyApplied = career.applicants.some(
            applicant => applicant.user.toString() === req.body.user_id
        );
        
        if (alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        
        career.applicants.push({
            user: req.body.user_id,
            status: 'pending'
        });
        
        await career.save();
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (err) {
        next(err);
    }
}

// get job applications (for admin/alumni who posted the job)
async function getJobApplications(req, res, next) {
    try {
        const career = await Career.findById(req.params.id)
            .populate('applicants.user', 'name email student_bio');
        
        if (!career) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.json(career.applicants);
    } catch (err) {
        next(err);
    }
}

// update application status (for admin/alumni who posted the job)
async function updateApplicationStatus(req, res, next) {
    try {
        const { status } = req.body;
        const career = await Career.findById(req.params.jobId);
        
        if (!career) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        const applicant = career.applicants.find(
            app => app.user.toString() === req.params.userId
        );
        
        if (!applicant) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        applicant.status = status;
        await career.save();
        
        res.json({ message: 'Application status updated successfully' });
    } catch (err) {
        next(err);
    }
}

// get student's own applications
async function getMyApplications(req, res, next) {
    try {
        const careers = await Career.find({
            'applicants.user': req.user.id
        })
        .populate('user', 'name')
        .select('company job_title location applicants');
        
        // Filter to show only this user's application status
        const applications = careers.map(career => {
            const myApplication = career.applicants.find(
                app => app.user.toString() === req.user.id
            );
            return {
                _id: career._id,
                company: career.company,
                job_title: career.job_title,
                location: career.location,
                status: myApplication.status,
                appliedAt: myApplication.appliedAt
            };
        });
        
        res.json(applications);
    } catch (err) {
        next(err);
    }
}



module.exports={listCarrers,addCareer,updateCareer,deleteCareer,applyToJob,getJobApplications,updateApplicationStatus,getMyApplications};