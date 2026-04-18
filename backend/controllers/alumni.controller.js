const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Career, Course, Endorsement, DirectMessage } = require('../models/Index');
const { uploadImage, deleteImage } = require('../utils/image-storage');


// print alumnilist
async function alumniList(req, res, next) {
    try {
        const list = await User.find({ type: 'alumnus' })
            .populate('alumnus_bio.course')
            .sort({ name: 1 });
        res.json(list);
    } catch (err) {
        next(err);
    }
}

// print alumnus by id
async function alumnus(req, res, next) {
    try {
        const record = await User.findById(req.params.id).populate('alumnus_bio.course');
        res.json(record);
    } catch (err) {
        next(err);
    }
}

// update alumnus status
async function updateAlumnusStatus(req, res, next) {
    try {
        await User.findByIdAndUpdate(
            req.body.id,
            { 'alumnus_bio.status': req.body.status }
        );
        res.json({ message: 'Status updated' });
    } catch (err) {
        next(err);
    }
}

// delete alumnus
async function deleteAlumnus(req, res, next) {
    try {
        const user = await User.findById(req.params.id).select(
            'alumnus_bio.avatar alumnus_bio.avatar_public_id'
        );
        if (user?.alumnus_bio?.avatar) {
            try {
                await deleteImage(user.alumnus_bio.avatar, user.alumnus_bio.avatar_public_id);
            } catch (cleanupError) {
                console.error('Failed to delete alumnus avatar:', cleanupError.message);
            }
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
}


// update account with avatar upload
async function updateAccount(req, res, next) {
    try {
        const userId = req.body.user_id;
        if (!userId) {
            return res.status(400).json({ message: 'User id is required' });
        }

        const currentUser = await User.findById(userId).select(
            'alumnus_bio.avatar alumnus_bio.avatar_public_id'
        );
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Build user update payload
        const userData = {
            name: req.body.name,
            email: req.body.email,
            'alumnus_bio.gender': req.body.gender,
            'alumnus_bio.batch': req.body.batch,
            'alumnus_bio.course': req.body.course_id,
            'alumnus_bio.connected_to': req.body.connected_to,
        };
        let uploadedAvatar = null;
        
        if (req.file) {
            uploadedAvatar = await uploadImage(req.file, {
                folder: 'avatars',
                prefix: 'avatar',
            });
            userData['alumnus_bio.avatar'] = uploadedAvatar.path;
            userData['alumnus_bio.avatar_public_id'] = uploadedAvatar.publicId || '';
        }

        if (req.body.password) {
            const hashed = await bcrypt.hash(req.body.password, 10);
            userData.password = hashed;
        }

        // Update user
        await User.findByIdAndUpdate(userId, userData);

        if (
            uploadedAvatar &&
            currentUser.alumnus_bio?.avatar &&
            currentUser.alumnus_bio.avatar !== uploadedAvatar.path
        ) {
            try {
                await deleteImage(
                    currentUser.alumnus_bio.avatar,
                    currentUser.alumnus_bio.avatar_public_id
                );
            } catch (cleanupError) {
                console.error('Failed to delete previous avatar:', cleanupError.message);
            }
        }

        res.json({ message: 'Account updated successfully' });
    } catch (err) {
        next(err);
    }
}

// Advanced search with filters, pagination
async function advancedSearch(req, res, next) {
    try {
        const {
            search,
            batch,
            course,
            company,
            location,
            skills,
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        const query = { type: 'alumnus' };

        // Text search on name and email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by batch
        if (batch) {
            const batchArray = batch.split(',').map(Number);
            query['alumnus_bio.batch'] = { $in: batchArray };
        }

        // Filter by course
        if (course) {
            const courseArray = course.split(',');
            query['alumnus_bio.course'] = { $in: courseArray };
        }

        // Filter by skills
        if (skills) {
            const skillsArray = skills.split(',');
            query['alumnus_bio.skills'] = { $in: skillsArray };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query with pagination
        let alumni = await User.find(query)
            .populate('alumnus_bio.course')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // If filtering by company or location, we need to join with Career model
        if (company || location) {
            const careerQuery = {};
            if (company) {
                const companies = company.split(',');
                careerQuery.company = { $regex: new RegExp(companies.join('|'), 'i') };
            }
            if (location) {
                const locations = location.split(',');
                careerQuery.location = { $regex: new RegExp(locations.join('|'), 'i') };
            }

            const careers = await Career.find(careerQuery).select('user');
            const userIds = careers.map(c => c.user);
            
            // Add user filter to main query
            query._id = { $in: userIds };
            
            // Re-run query with career filter
            alumni = await User.find(query)
                .populate('alumnus_bio.course')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit));
        }

        // Get total count
        const total = await User.countDocuments(query);

        res.json({
            alumni,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        next(err);
    }
}

// Get filter options (batches, courses, companies, locations, skills)
async function getFilterOptions(req, res, next) {
    try {
        // Get unique batches
        const batches = await User.distinct('alumnus_bio.batch', { type: 'alumnus' });
        
        // Get unique courses
        const courses = await Course.find().select('course _id');
        
        // Get unique companies from Career model
        const companies = await Career.distinct('company');
        
        // Get unique locations from Career model
        const locations = await Career.distinct('location');
        
        // Get all unique skills from alumni
        const allSkills = await User.distinct('alumnus_bio.skills', { type: 'alumnus' });
        const skills = allSkills.filter(s => s && s.length > 0);

        res.json({
            batches: batches.filter(b => b).sort((a, b) => b - a),
            courses: courses.map(c => ({ _id: c._id, name: c.course })),
            companies: companies.filter(c => c).sort(),
            locations: locations.filter(l => l).sort(),
            skills: skills.sort()
        });
    } catch (err) {
        next(err);
    }
}

// Export alumni data as CSV
async function exportAlumni(req, res, next) {
    try {
        const { batch, course, company, location, skills } = req.query;

        // Build query (same as advanced search but without pagination)
        const query = { type: 'alumnus' };

        if (batch) {
            const batchArray = batch.split(',').map(Number);
            query['alumnus_bio.batch'] = { $in: batchArray };
        }

        if (course) {
            const courseArray = course.split(',');
            query['alumnus_bio.course'] = { $in: courseArray };
        }

        if (skills) {
            const skillsArray = skills.split(',');
            query['alumnus_bio.skills'] = { $in: skillsArray };
        }

        // Get alumni data
        let alumni = await User.find(query)
            .populate('alumnus_bio.course')
            .sort({ name: 1 })
            .lean();

        // If filtering by company or location, join with Career model
        if (company || location) {
            const careerQuery = {};
            if (company) {
                const companies = company.split(',');
                careerQuery.company = { $regex: new RegExp(companies.join('|'), 'i') };
            }
            if (location) {
                const locations = location.split(',');
                careerQuery.location = { $regex: new RegExp(locations.join('|'), 'i') };
            }

            const careers = await Career.find(careerQuery).select('user company location job_title');
            const userIds = careers.map(c => c.user);
            
            query._id = { $in: userIds };
            alumni = await User.find(query)
                .populate('alumnus_bio.course')
                .sort({ name: 1 })
                .lean();

            // Add career info to alumni objects
            const careerMap = {};
            careers.forEach(c => {
                careerMap[c.user.toString()] = c;
            });

            alumni = alumni.map(a => ({
                ...a,
                career_company: careerMap[a._id.toString()]?.company || '',
                career_location: careerMap[a._id.toString()]?.location || '',
                career_job_title: careerMap[a._id.toString()]?.job_title || ''
            }));
        }

        // Generate CSV
        const headers = ['Name', 'Email', 'Batch', 'Course', 'Skills', 'Company', 'Location', 'Job Title', 'Status'];
        const rows = alumni.map(a => [
            a.name || '',
            a.email || '',
            a.alumnus_bio?.batch || '',
            a.alumnus_bio?.course?.course || '',
            (a.alumnus_bio?.skills || []).join('; '),
            a.career_company || '',
            a.career_location || '',
            a.career_job_title || '',
            a.alumnus_bio?.status === 1 ? 'Verified' : 'Unverified'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=alumni_export.csv');
        res.send(csvContent);
    } catch (err) {
        next(err);
    }
}

// Get alumni profile with endorsements and career info for profile cards
async function getAlumniProfile(req, res, next) {
    try {
        const { alumniId } = req.params;
        
        // Get alumni user
        const alumni = await User.findById(alumniId)
            .populate('alumnus_bio.course')
            .select('name email alumnus_bio');
        
        if (!alumni || alumni.type !== 'alumnus') {
            return res.status(404).json({ message: 'Alumni not found' });
        }

        // Get endorsement count
        const endorsementCount = await Endorsement.countDocuments({ endorsee: alumniId });
        
        // Get top endorsements (skills with most endorsements)
        const topEndorsements = await Endorsement.aggregate([
            { $match: { endorsee: alumniId } },
            { $group: { _id: '$skill', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get career information
        const career = await Career.findOne({ user: alumniId })
            .select('company location job_title job_type experience_level skills salary_range');

        // Combine and return
        const profile = {
            _id: alumni._id,
            name: alumni.name,
            email: alumni.email,
            avatar: alumni.alumnus_bio?.avatar || '',
            batch: alumni.alumnus_bio?.batch,
            course: alumni.alumnus_bio?.course,
            gender: alumni.alumnus_bio?.gender,
            status: alumni.alumnus_bio?.status,
            bio: alumni.alumnus_bio?.bio || '',
            location: alumni.alumnus_bio?.location || '',
            company: alumni.alumnus_bio?.company || '',
            job_title: alumni.alumnus_bio?.job_title || '',
            industry: alumni.alumnus_bio?.industry || '',
            skills: alumni.alumnus_bio?.skills || [],
            interests: alumni.alumnus_bio?.interests || [],
            endorsementCount,
            topEndorsements,
            career,
            isSearchable: alumni.alumnus_bio?.isSearchable !== false
        };

        res.json(profile);
    } catch (err) {
        next(err);
    }
}

// Advanced alumni directory search with full filtering
async function advancedAlumniDirectory(req, res, next) {
    try {
        const {
            search,
            batch,
            course,
            location,
            company,
            industry,
            interests,
            skills,
            minBatch,
            maxBatch,
            sortBy = 'name',
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        const query = { 
            type: 'alumnus',
            'alumnus_bio.isSearchable': true,
            'alumnus_bio.status': 1  // Only verified alumni
        };

        // Full-text search
        if (search && search.trim()) {
            query.$text = { $search: search.trim() };
        }

        // Filter by batch range
        if (minBatch || maxBatch) {
            query['alumnus_bio.batch'] = {};
            if (minBatch) query['alumnus_bio.batch'].$gte = parseInt(minBatch);
            if (maxBatch) query['alumnus_bio.batch'].$lte = parseInt(maxBatch);
        } else if (batch) {
            const batchArray = batch.split(',').map(Number);
            query['alumnus_bio.batch'] = { $in: batchArray };
        }

        // Filter by course
        if (course) {
            const courseArray = course.split(',');
            query['alumnus_bio.course'] = { $in: courseArray };
        }

        // Filter by location
        if (location) {
            const locations = location.split(',').map(l => l.trim());
            query['alumnus_bio.location'] = { $in: locations };
        }

        // Filter by company
        if (company) {
            const companies = company.split(',').map(c => c.trim());
            query['alumnus_bio.company'] = { $in: companies };
        }

        // Filter by industry
        if (industry) {
            const industries = industry.split(',').map(i => i.trim());
            query['alumnus_bio.industry'] = { $in: industries };
        }

        // Filter by skills (any matching)
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query['alumnus_bio.skills'] = { $in: skillsArray };
        }

        // Filter by interests
        if (interests) {
            const interestsArray = interests.split(',').map(i => i.trim());
            query['alumnus_bio.interests'] = { $in: interestsArray };
        }

        // Determine sort
        let sortOption = { name: 1 };
        switch (sortBy) {
            case 'batch-newest':
                sortOption = { 'alumnus_bio.batch': -1, name: 1 };
                break;
            case 'batch-oldest':
                sortOption = { 'alumnus_bio.batch': 1, name: 1 };
                break;
            case 'endorsements':
                sortOption = { 'alumnus_bio.endorsementCount': -1, name: 1 };
                break;
            case 'name-desc':
                sortOption = { name: -1 };
                break;
            case 'name-asc':
            default:
                sortOption = { name: 1 };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get total count
        const total = await User.countDocuments(query);

        // Execute query
        const alumni = await User.find(query)
            .populate('alumnus_bio.course')
            .select('_id name email alumnus_bio')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        // Enrich with endorsement data
        const enrichedAlumni = await Promise.all(
            alumni.map(async (a) => {
                const endorsementCount = await Endorsement.countDocuments({ endorsee: a._id });
                return {
                    ...a.toObject(),
                    endorsementCount
                };
            })
        );

        res.json({
            alumni: enrichedAlumni,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        next(err);
    }
}

// Get all filter options for directory
async function getDirectoryFilterOptions(req, res, next) {
    try {
        const baseQuery = { type: 'alumnus', 'alumnus_bio.isSearchable': true };

        // Get unique batches
        const batches = await User.distinct('alumnus_bio.batch', baseQuery);
        
        // Get unique courses
        const courses = await Course.find().select('course _id');
        
        // Get unique locations from alumni
        const locations = await User.distinct('alumnus_bio.location', {
            ...baseQuery,
            'alumnus_bio.location': { $ne: '' }
        });
        
        // Get unique companies from alumni
        const companies = await User.distinct('alumnus_bio.company', {
            ...baseQuery,
            'alumnus_bio.company': { $ne: '' }
        });
        
        // Get unique industries from alumni
        const industries = await User.distinct('alumnus_bio.industry', {
            ...baseQuery,
            'alumnus_bio.industry': { $ne: '' }
        });

        // Get all unique skills from alumni
        const allSkills = await User.distinct('alumnus_bio.skills', baseQuery);
        const skills = allSkills.filter(s => s && s.length > 0);

        // Get all unique interests from alumni
        const allInterests = await User.distinct('alumnus_bio.interests', baseQuery);
        const interests = allInterests.filter(i => i && i.length > 0);

        res.json({
            batches: batches.filter(b => b).sort((a, b) => b - a),
            courses: courses.map(c => ({ _id: c._id, name: c.course })),
            locations: locations.filter(l => l).sort(),
            companies: companies.filter(c => c).sort(),
            industries: industries.filter(i => i).sort(),
            skills: skills.sort(),
            interests: interests.sort(),
            yearRange: {
                min: batches.length > 0 ? Math.min(...batches.filter(b => b)) : 2000,
                max: batches.length > 0 ? Math.max(...batches.filter(b => b)) : new Date().getFullYear()
            }
        });
    } catch (err) {
        next(err);
    }
}

// Initiate connection (send connection message)
async function initiateConnection(req, res, next) {
    try {
        const { targetUserId, message } = req.body;
        const senderId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({ message: 'Target user ID is required' });
        }

        // Check if target user exists and is an alumnus
        const targetUser = await User.findById(targetUserId);
        if (!targetUser || targetUser.type !== 'alumnus') {
            return res.status(404).json({ message: 'Alumni not found' });
        }

        // Prevent sending to self
        if (senderId === targetUserId) {
            return res.status(400).json({ message: 'Cannot connect with yourself' });
        }

        // Create initial message
        const defaultMessage = message || `Hi ${targetUser.name}, I'd like to connect with you!`;
        
        const directMessage = new DirectMessage({
            sender: senderId,
            receiver: targetUserId,
            content: defaultMessage,
            messageType: 'text'
        });

        await directMessage.save();
        await directMessage.populate('sender', 'name email alumnus_bio.avatar');
        await directMessage.populate('receiver', 'name email alumnus_bio.avatar');

        res.status(201).json({
            message: 'Connection request sent',
            data: directMessage
        });
    } catch (err) {
        next(err);
    }
}

// Update alumni profile fields (location, company, industry, interests, bio)
async function updateAlumniProfileInfo(req, res, next) {
    try {
        const userId = req.user.id;
        const { 
            location, 
            company, 
            job_title, 
            industry, 
            interests, 
            bio,
            isSearchable 
        } = req.body;

        // Build update object
        const updateData = {};
        if (location !== undefined) updateData['alumnus_bio.location'] = location;
        if (company !== undefined) updateData['alumnus_bio.company'] = company;
        if (job_title !== undefined) updateData['alumnus_bio.job_title'] = job_title;
        if (industry !== undefined) updateData['alumnus_bio.industry'] = industry;
        if (interests !== undefined) {
            updateData['alumnus_bio.interests'] = Array.isArray(interests) ? interests : [];
        }
        if (bio !== undefined) updateData['alumnus_bio.bio'] = bio;
        if (isSearchable !== undefined) updateData['alumnus_bio.isSearchable'] = isSearchable;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).populate('alumnus_bio.course');

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (err) {
        next(err);
    }
}

// Update endorsement count (called after endorsement is created/deleted)
async function updateEndorsementCount(req, res, next) {
    try {
        const { userId } = req.params;

        // Count endorsements for this user
        const endorsementCount = await Endorsement.countDocuments({ endorsee: userId });

        // Update the denormalized count
        await User.findByIdAndUpdate(
            userId,
            { 'alumnus_bio.endorsementCount': endorsementCount }
        );

        res.json({ 
            message: 'Endorsement count updated',
            endorsementCount 
        });
    } catch (err) {
        next(err);
    }
}

module.exports={
    alumniList,
    alumnus,
    updateAlumnusStatus,
    deleteAlumnus,
    updateAccount,
    advancedSearch,
    getFilterOptions,
    exportAlumni,
    getAlumniProfile,
    advancedAlumniDirectory,
    getDirectoryFilterOptions,
    initiateConnection,
    updateAlumniProfileInfo,
    updateEndorsementCount
