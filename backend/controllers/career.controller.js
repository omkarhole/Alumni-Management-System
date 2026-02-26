const {Career, User, JobSubscription, JobPreference, JobReferral}=require('../models/Index');
const sendEmail = require('../utils/mailer');
const { calculateSkillsMatchPercentage } = require('../utils/skillMatcher');


// Helper function to calculate skill match percentage (uses shared utility)
function calculateSkillMatch(userSkills, jobSkills) {
  return calculateSkillsMatchPercentage(userSkills, jobSkills);
}

/**
 * Calculate job match score using weighted algorithm:
 * - Skills: 50%
 * - Job Type: 20%
 * - Location Preference: 20%
 * - Experience Level: 10%
 * 
 * @param {Object} preferences - User's job preferences
 * @param {Object} job - Job posting to score
 * @returns {Object} - Match score details
 */
function calculateJobMatchScore(preferences, job) {
  const userSkills = preferences?.preferredSkills || [];
  const preferredJobTypes = preferences?.preferredJobTypes || [];
  const preferredLocations = preferences?.preferredLocations || [];
  const preferredExperienceLevels = preferences?.preferredExperienceLevels || [];
  
// 1. Skills Match (50%)
  let skillsScore = 0;
  let matchedSkills = [];
  if (userSkills.length > 0 && job.skills && job.skills.length > 0) {
    // Get matched skills for tracking
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    const normalizedJobSkills = job.skills.map(s => s.toLowerCase().trim());
    
    normalizedJobSkills.forEach(jobSkill => {
      if (normalizedUserSkills.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )) {
        matchedSkills.push(jobSkill);
      }
    });
    
    // Use the shared utility for calculating the score
    skillsScore = calculateSkillsMatchPercentage(userSkills, job.skills);
  }
  
  // 2. Job Type Match (20%)
  let jobTypeScore = 0;
  if (preferredJobTypes.length > 0 && job.job_type) {
    jobTypeScore = preferredJobTypes.includes(job.job_type) ? 100 : 0;
  }
  
  // 3. Location Match (20%)
  let locationScore = 0;
  if (preferredLocations.length > 0 && job.location) {
    const jobLocation = job.location.toLowerCase();
    // Check if any preferred location is in the job location
    const locationMatch = preferredLocations.some(prefLoc => 
      jobLocation.includes(prefLoc.toLowerCase()) || prefLoc.toLowerCase().includes(jobLocation)
    );
    locationScore = locationMatch ? 100 : 0;
  }
  
  // 4. Experience Level Match (10%)
  let experienceScore = 0;
  if (preferredExperienceLevels.length > 0 && job.experience_level) {
    experienceScore = preferredExperienceLevels.includes(job.experience_level) ? 100 : 0;
  }
  
  // Calculate weighted total score
  const totalScore = Math.round(
    (skillsScore * 0.5) + 
    (jobTypeScore * 0.2) + 
    (locationScore * 0.2) + 
    (experienceScore * 0.1)
  );
  
  return {
    totalScore,
    skillsScore,
    jobTypeScore,
    locationScore,
    experienceScore,
    matchedSkills
  };
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

// Get job recommendations based on user skills and preferences using weighted algorithm
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
        
        // Try to get JobPreference first, then fall back to JobSubscription
        let preferences = await JobPreference.findOne({ user: userId });
        
        if (!preferences) {
            // Fall back to subscription preferences if no JobPreference exists
            const subscription = await JobSubscription.findOne({ user: userId, isActive: true });
            if (subscription) {
                preferences = {
                    preferredSkills: subscription.preferredSkills || userSkills,
                    preferredJobTypes: subscription.preferredJobTypes || ['full-time', 'part-time'],
                    preferredLocations: subscription.preferredLocations || [],
                    preferredExperienceLevels: subscription.preferredExperienceLevels || ['entry', 'mid', 'senior']
                };
            } else {
                // Use user's profile skills as default
                preferences = {
                    preferredSkills: userSkills,
                    preferredJobTypes: ['full-time', 'part-time'],
                    preferredLocations: [],
                    preferredExperienceLevels: ['entry', 'mid', 'senior']
                };
            }
        }
        
        // Build query for matching jobs (use preferences to filter)
        const query = {};
        
        if (preferences.preferredSkills && preferences.preferredSkills.length > 0) {
            query.skills = { $in: preferences.preferredSkills };
        }
        if (preferences.preferredJobTypes && preferences.preferredJobTypes.length > 0) {
            query.job_type = { $in: preferences.preferredJobTypes };
        }
        if (preferences.preferredExperienceLevels && preferences.preferredExperienceLevels.length > 0) {
            query.experience_level = { $in: preferences.preferredExperienceLevels };
        }
        
        // Get all matching jobs (or all jobs if no specific filters)
        const jobs = await Career.find(Object.keys(query).length > 0 ? query : {})
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(100);
        
        // Calculate match score using weighted algorithm for each job
        const recommendations = jobs.map(job => {
            const matchScore = calculateJobMatchScore(preferences, job);
            return {
                ...job.toObject(),
                matchPercentage: matchScore.totalScore,
                skillsScore: matchScore.skillsScore,
                jobTypeScore: matchScore.jobTypeScore,
                locationScore: matchScore.locationScore,
                experienceScore: matchScore.experienceScore,
                matchedSkills: matchScore.matchedSkills
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

// Job Referral Functions

// Refer a candidate for a job
async function referCandidate(req, res, next) {
    try {
        const { jobId } = req.params;
        const { 
            candidateName, 
            candidateEmail, 
            candidatePhone, 
            candidateResume, 
            candidateLinkedIn,
            candidateExperience,
            notes 
        } = req.body;

        // Check if job exists
        const job = await Career.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if candidate already referred for this job
        const existingReferral = await JobReferral.findOne({
            job: jobId,
            candidateEmail: candidateEmail.toLowerCase()
        });

        if (existingReferral) {
            return res.status(400).json({ message: 'This candidate has already been referred for this job' });
        }

        // Create new referral
        const referral = await JobReferral.create({
            job: jobId,
            referrer: req.user.id,
            candidateName,
            candidateEmail: candidateEmail.toLowerCase(),
            candidatePhone: candidatePhone || '',
            candidateResume: candidateResume || '',
            candidateLinkedIn: candidateLinkedIn || '',
            candidateExperience: candidateExperience || '',
            notes: notes || '',
            status: 'pending'
        });

        // Populate job and referrer details
        await referral.populate([
            { path: 'job', select: 'company job_title location' },
            { path: 'referrer', select: 'name email' }
        ]);

        res.status(201).json({
            message: 'Candidate referred successfully',
            referral
        });
    } catch (err) {
        next(err);
    }
}

// Get my referrals (for alumni who made referrals)
async function getMyReferrals(req, res, next) {
    try {
        const referrals = await JobReferral.find({ referrer: req.user.id })
            .populate('job', 'company job_title location status')
            .populate('referrer', 'name email')
            .sort({ createdAt: -1 });

        res.json(referrals);
    } catch (err) {
        next(err);
    }
}

// Get all referrals (for admin)
async function getAllReferrals(req, res, next) {
    try {
        const { status, jobId, referrerId } = req.query;
        
        const query = {};
        
        if (status) {
            query.status = status;
        }
        if (jobId) {
            query.job = jobId;
        }
        if (referrerId) {
            query.referrer = referrerId;
        }

        const referrals = await JobReferral.find(query)
            .populate('job', 'company job_title location status')
            .populate('referrer', 'name email type')
            .sort({ createdAt: -1 });

        res.json(referrals);
    } catch (err) {
        next(err);
    }
}

// Get referrals for a specific job (for job poster)
async function getJobReferrals(req, res, next) {
    try {
        const { jobId } = req.params;

        // Check if job exists and user is the poster
        const job = await Career.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Only job poster or admin can view referrals
        if (job.user.toString() !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const referrals = await JobReferral.find({ job: jobId })
            .populate('referrer', 'name email')
            .sort({ createdAt: -1 });

        res.json(referrals);
    } catch (err) {
        next(err);
    }
}

// Update referral status
async function updateReferralStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, notes, outcome } = req.body;

        const referral = await JobReferral.findById(id);
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        // Update status
        if (status) {
            referral.status = status;
        }
        
        // Add notes
        if (notes) {
            referral.notes = notes;
        }
        
        // Add outcome
        if (outcome) {
            referral.outcome = outcome;
        }

        await referral.save();

        // Populate details for response
        await referral.populate([
            { path: 'job', select: 'company job_title location' },
            { path: 'referrer', select: 'name email' }
        ]);

        res.json({
            message: 'Referral status updated successfully',
            referral
        });
    } catch (err) {
        next(err);
    }
}

// Delete a referral
async function deleteReferral(req, res, next) {
    try {
        const { id } = req.params;

        const referral = await JobReferral.findById(id);
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        // Only referrer or admin can delete
        if (referral.referrer.toString() !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await JobReferral.findByIdAndDelete(id);

        res.json({ message: 'Referral deleted successfully' });
    } catch (err) {
        next(err);
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
    getSubscription,
    referCandidate,
    getMyReferrals,
    getAllReferrals,
    getJobReferrals,
    updateReferralStatus,
    deleteReferral
};
