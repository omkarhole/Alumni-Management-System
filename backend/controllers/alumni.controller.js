const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Career, Course } = require('../models/Index');
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

module.exports={
    alumniList,
    alumnus,
    updateAlumnusStatus,
    deleteAlumnus,
    updateAccount,
    advancedSearch,
    getFilterOptions,
    exportAlumni
}
