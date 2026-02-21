const {Career, User, JobSubscription}=require('../models/Index');
const sendEmail = require('../utils/mailer');


// Helper function to calculate skill match percentage
function calculateSkillMatch(userSkills, jobSkills) {
  if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) {
    return 0;
  }
  
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  
  let matchCount = 0;
  normalizedJobSkills.forEach(jobSkill => {
    if (normalizedUserSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )) {
      matchCount++;
    }
  });
  
  // Calculate percentage based on job skills matched
  return Math.round((matchCount / normalizedJobSkills.length) * 100);
}

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
            user: req.body.user_id || req.body.user,
            skills: req.body.skills || [],
            job_type: req.body.job_type || 'full-time',
            experience_level: req.body.experience_level || 'mid',
            salary_range: req.body.salary_range || ''
        };
        const career=await Career.create(careerData);
        
        // Notify subscribed users about new job
        notifyUsersForNewJob(career).catch(err => console.error('Error notifying users:', err));
        
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

// Get job recommendations based on user skills and preferences
async function getJobRecommendations(req, res, next) {
    try {
        const userId = req.user.id;
        
        // Get user with their skills
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get user skills from alumnus_bio or student_bio
        let userSkills = [];
        if (user.alumnus_bio && user.alumnus_bio.skills) {
            userSkills = user.alumnus_bio.skills;
        }
        
        // Get user's subscription preferences
        const subscription = await JobSubscription.findOne({ user: userId, isActive: true });
        
        // Build query for matching jobs
        const query = {};
        
        if (subscription) {
            // If user has subscription, use their preferences
            if (subscription.preferredSkills && subscription.preferredSkills.length > 0) {
                query.skills = { $in: subscription.preferredSkills };
            }
            if (subscription.preferredJobTypes && subscription.preferredJobTypes.length > 0) {
                query.job_type = { $in: subscription.preferredJobTypes };
            }
            if (subscription.preferredExperienceLevels && subscription.preferredExperienceLevels.length > 0) {
                query.experience_level = { $in: subscription.preferredExperienceLevels };
            }
        } else if (userSkills.length > 0) {
            // If no subscription, use user's skills for matching
            query.skills = { $in: userSkills };
        }
        
        // Get all matching jobs
        const jobs = await Career.find(query)
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
        
        // Calculate match percentage for each job
        const recommendations = jobs.map(job => {
            const matchPercentage = calculateSkillMatch(userSkills, job.skills);
            return {
                ...job.toObject(),
                matchPercentage,
                matchedSkills: job.skills.filter(skill => 
                    userSkills.some(userSkill => 
                        userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                        skill.toLowerCase().includes(userSkill.toLowerCase())
                    )
                )
            };
        });
        
        // Sort by match percentage (highest first)
        recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        res.json(recommendations);
    } catch (err) {
        next(err);
    }
}

// Subscribe to job notifications
async function subscribeToJobs(req, res, next) {
    try {
        const userId = req.user.id;
        const { 
            preferredSkills, 
            preferredJobTypes, 
            preferredExperienceLevels, 
            preferredLocations,
            emailNotifications,
            notificationFrequency 
        } = req.body;
        
        // Get user to get their current skills if no preferred skills provided
        const user = await User.findById(userId);
        let userSkills = [];
        if (user.alumnus_bio && user.alumnus_bio.skills) {
            userSkills = user.alumnus_bio.skills;
        }
        
        // Check if subscription exists
        let subscription = await JobSubscription.findOne({ user: userId });
        
        if (subscription) {
            // Update existing subscription
            subscription.preferredSkills = preferredSkills || userSkills;
            subscription.preferredJobTypes = preferredJobTypes || ['full-time', 'part-time'];
            subscription.preferredExperienceLevels = preferredExperienceLevels || ['entry', 'mid', 'senior'];
            subscription.preferredLocations = preferredLocations || [];
            subscription.emailNotifications = emailNotifications !== undefined ? emailNotifications : true;
            subscription.notificationFrequency = notificationFrequency || 'immediate';
            subscription.isActive = true;
            await subscription.save();
        } else {
            // Create new subscription
            subscription = await JobSubscription.create({
                user: userId,
                preferredSkills: preferredSkills || userSkills,
                preferredJobTypes: preferredJobTypes || ['full-time', 'part-time'],
                preferredExperienceLevels: preferredExperienceLevels || ['entry', 'mid', 'senior'],
                preferredLocations: preferredLocations || [],
                emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
                notificationFrequency: notificationFrequency || 'immediate',
                isActive: true
            });
        }
        
        res.status(201).json({ 
            message: 'Successfully subscribed to job notifications',
            subscription 
        });
    } catch (err) {
        next(err);
    }
}

// Unsubscribe from job notifications
async function unsubscribeFromJobs(req, res, next) {
    try {
        const userId = req.user.id;
        
        const subscription = await JobSubscription.findOne({ user: userId });
        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found' });
        }
        
        subscription.isActive = false;
        await subscription.save();
        
        res.json({ message: 'Successfully unsubscribed from job notifications' });
    } catch (err) {
        next(err);
    }
}

// Get user's subscription preferences
async function getSubscription(req, res, next) {
    try {
        const userId = req.user.id;
        
        const subscription = await JobSubscription.findOne({ user: userId });
        if (!subscription) {
            return res.json({ 
                isSubscribed: false,
                message: 'Not subscribed to job notifications'
            });
        }
        
        res.json({
            isSubscribed: subscription.isActive,
            ...subscription.toObject()
        });
    } catch (err) {
        next(err);
    }
}

// Notify users when a new job is posted
async function notifyUsersForNewJob(career) {
    try {
        // Get all active subscriptions that match this job
        const subscriptions = await JobSubscription.find({ 
            isActive: true,
            emailNotifications: true
        });
        
        for (const subscription of subscriptions) {
            // Check if job matches user preferences
            const jobMatchesPreferences = 
                (!subscription.preferredJobTypes || subscription.preferredJobTypes.length === 0 || subscription.preferredJobTypes.includes(career.job_type)) &&
                (!subscription.preferredExperienceLevels || subscription.preferredExperienceLevels.length === 0 || subscription.preferredExperienceLevels.includes(career.experience_level));
            
            // Check if job skills match user preferred skills
            const skillsMatch = !subscription.preferredSkills || subscription.preferredSkills.length === 0 || 
                career.skills.some(skill => 
                    subscription.preferredSkills.some(prefSkill => 
                        skill.toLowerCase().includes(prefSkill.toLowerCase()) || 
                        prefSkill.toLowerCase().includes(skill.toLowerCase())
                    )
                );
            
            if (jobMatchesPreferences || skillsMatch) {
                // Get user email
                const user = await User.findById(subscription.user);
                if (user && user.email) {
                    const subject = 'New Job Matching Your Skills!';
                    const html = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2563eb;">New Job Opportunity Matching Your Profile!</h2>
                            <p>Hello ${user.name},</p>
                            <p>A new job has been posted that matches your skills and preferences:</p>
                            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">${career.job_title}</h3>
                                <p><strong>Company:</strong> ${career.company}</p>
                                <p><strong>Location:</strong> ${career.location}</p>
                                <p><strong>Job Type:</strong> ${career.job_type}</p>
                                <p><strong>Required Skills:</strong> ${career.skills.join(', ') || 'Not specified'}</p>
                                <p><strong>Description:</strong> ${career.description.substring(0, 200)}...</p>
                            </div>
                            <p>Log in to your account to view more details and apply!</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/careers" 
                               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                                View Job Details
                            </a>
                            <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
                                You received this email because you subscribed to job notifications. 
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/careers">Manage your preferences</a>
                            </p>
                        </div>
                    `;
                    
                    try {
                        await sendEmail(user.email, subject, html);
                        subscription.lastNotificationSent = new Date();
                        await subscription.save();
                    } catch (emailErr) {
                        console.error(`Failed to send email to ${user.email}:`, emailErr);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error notifying users for new job:', err);
    }
}

module.exports={
    listCarrers,
    addCareer,
    updateCareer,
    deleteCareer,
    applyToJob,
    getJobApplications,
    updateApplicationStatus,
    getMyApplications,
    getJobRecommendations,
    subscribeToJobs,
    unsubscribeFromJobs,
    getSubscription
};
