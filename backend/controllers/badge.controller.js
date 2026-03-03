const { Badge, UserBadge, User, VerificationRequest } = require('../models/Index');

// ==================== BADGE MANAGEMENT ====================

// Create a new badge (admin only)
async function createBadge(req, res, next) {
    try {
        const { name, description, icon, color, category, points, criteria } = req.body;
        
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        const existingBadge = await Badge.findOne({ slug });
        if (existingBadge) {
            return res.status(400).json({ message: 'Badge with similar name already exists' });
        }

        const badge = await Badge.create({
            name,
            slug,
            description,
            icon: icon || '',
            color: color || '#6c757d',
            category,
            points: points || 0,
            criteria: criteria || ''
        });

        res.status(201).json(badge);
    } catch (err) {
        next(err);
    }
}

// Get all badges
async function getAllBadges(req, res, next) {
    try {
        const { category, active } = req.query;
        
        const query = {};
        if (category) {
            query.category = category;
        }
        if (active !== undefined) {
            query.isActive = active === 'true';
        }

        const badges = await Badge.find(query).sort({ points: -1, name: 1 });
        res.json(badges);
    } catch (err) {
        next(err);
    }
}

// Get badge by ID
async function getBadgeById(req, res, next) {
    try {
        const badge = await Badge.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        res.json(badge);
    } catch (err) {
        next(err);
    }
}

// Update badge (admin only)
async function updateBadge(req, res, next) {
    try {
        const { name, description, icon, color, category, points, criteria, isActive } = req.body;
        
        const badge = await Badge.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }

        if (name && name !== badge.name) {
            badge.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        if (name) badge.name = name;
        if (description) badge.description = description;
        if (icon !== undefined) badge.icon = icon;
        if (color) badge.color = color;
        if (category) badge.category = category;
        if (points !== undefined) badge.points = points;
        if (criteria !== undefined) badge.criteria = criteria;
        if (isActive !== undefined) badge.isActive = isActive;

        await badge.save();
        res.json(badge);
    } catch (err) {
        next(err);
    }
}

// Delete badge (admin only)
async function deleteBadge(req, res, next) {
    try {
        const badge = await Badge.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }

        // Remove badge from all users
        await UserBadge.deleteMany({ badge: req.params.id });
        
        await Badge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Badge deleted successfully' });
    } catch (err) {
        next(err);
    }
}

// ==================== USER BADGE MANAGEMENT ====================

// Award a badge to a user
async function awardBadge(req, res, next) {
    try {
        const { userId, badgeId, notes, source } = req.body;
        
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user already has this badge
        const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badgeId });
        if (existingUserBadge) {
            return res.status(400).json({ message: 'User already has this badge' });
        }

        const userBadge = await UserBadge.create({
            user: userId,
            badge: badgeId,
            awardedBy: req.user?.id || null,
            notes: notes || '',
            source: source || { type: 'manual', referenceId: null }
        });

        await userBadge.populate('badge');
        await userBadge.populate('user', 'name email');

        res.status(201).json(userBadge);
    } catch (err) {
        next(err);
    }
}

// Get user's badges
async function getUserBadges(req, res, next) {
    try {
        const { userId } = req.params;

        const userBadges = await UserBadge.find({ user: userId })
            .populate('badge')
            .populate('awardedBy', 'name')
            .sort({ earnedAt: -1 });

        res.json(userBadges);
    } catch (err) {
        next(err);
    }
}

// Get current user's badges
async function getMyBadges(req, res, next) {
    try {
        const userBadges = await UserBadge.find({ user: req.user.id })
            .populate('badge')
            .sort({ earnedAt: -1 });

        res.json(userBadges);
    } catch (err) {
        next(err);
    }
}

// Remove badge from user
async function removeUserBadge(req, res, next) {
    try {
        const { id } = req.params;

        const userBadge = await UserBadge.findById(id);
        if (!userBadge) {
            return res.status(404).json({ message: 'User badge not found' });
        }

        // Check permission (admin or self)
        if (userBadge.user.toString() !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await UserBadge.findByIdAndDelete(id);
        res.json({ message: 'Badge removed successfully' });
    } catch (err) {
        next(err);
    }
}

// ==================== LEADERBOARD ====================

// Get leaderboard (top contributors)
async function getLeaderboard(req, res, next) {
    try {
        const { limit = 10, timeframe } = req.query;
        
        // Calculate date filter based on timeframe
        let dateFilter = {};
        if (timeframe === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { earnedAt: { $gte: startOfMonth } };
        } else if (timeframe === 'year') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            dateFilter = { earnedAt: { $gte: startOfYear } };
        }
        // 'all' or undefined - no date filter

        // Aggregate user points
        const leaderboardData = await UserBadge.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$user',
                    totalPoints: { $sum: '$badge.points' },
                    badgeCount: { $sum: 1 }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    userName: '$user.name',
                    userEmail: '$user.email',
                    userAvatar: '$user.alumnus_bio.avatar',
                    userBatch: '$user.alumnus_bio.batch',
                    totalPoints: 1,
                    badgeCount: 1
                }
            }
        ]);

        res.json(leaderboardData);
    } catch (err) {
        next(err);
    }
}

// ==================== VERIFICATION MANAGEMENT ====================

// Submit verification request
async function submitVerificationRequest(req, res, next) {
    try {
        const { degree, batch, course, graduationYear, rollNumber, documents } = req.body;
        
        // Check for existing pending request
        const existingRequest = await VerificationRequest.findOne({
            user: req.user.id,
            status: { $in: ['pending', 'under_review'] }
        });
        
        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending verification request' });
        }

        const verificationRequest = await VerificationRequest.create({
            user: req.user.id,
            credentials: {
                degree: degree || '',
                batch: parseInt(batch),
                course,
                graduationYear: parseInt(graduationYear),
                rollNumber: rollNumber || ''
            },
            documents: documents || [],
            status: 'pending'
        });

        await verificationRequest.populate('credentials.course', 'course');
        
        res.status(201).json(verificationRequest);
    } catch (err) {
        next(err);
    }
}

// Get current user's verification status
async function getMyVerificationStatus(req, res, next) {
    try {
        const verificationRequest = await VerificationRequest.findOne({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.json(verificationRequest || null);
    } catch (err) {
        next(err);
    }
}

// Get verification requests (admin)
async function getVerificationRequests(req, res, next) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const requests = await VerificationRequest.find(query)
            .populate('user', 'name email alumnus_bio')
            .populate('credentials.course', 'course')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await VerificationRequest.countDocuments(query);

        res.json({
            requests,
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

// Review verification request (admin)
async function reviewVerificationRequest(req, res, next) {
    try {
        const { id } = req.params;
        const { status, reviewNotes, rejectionReason } = req.body;

        const verificationRequest = await VerificationRequest.findById(id);
        if (!verificationRequest) {
            return res.status(404).json({ message: 'Verification request not found' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        verificationRequest.status = status;
        verificationRequest.reviewedBy = req.user.id;
        verificationRequest.reviewedAt = new Date();
        verificationRequest.reviewNotes = reviewNotes || '';
        
        if (status === 'rejected') {
            verificationRequest.rejectionReason = rejectionReason || 'Verification rejected';
        }

        await verificationRequest.save();

        // If approved, update user's verification status
        if (status === 'approved') {
            await User.findByIdAndUpdate(verificationRequest.user, {
                'alumnus_bio.status': 1
            });
        }

        await verificationRequest.populate('user', 'name email');
        await verificationRequest.populate('reviewedBy', 'name');

        res.json(verificationRequest);
    } catch (err) {
        next(err);
    }
}

// Add document to verification request
async function addVerificationDocument(req, res, next) {
    try {
        const { requestId } = req.params;
        const { type, url, publicId } = req.body;

        const verificationRequest = await VerificationRequest.findById(requestId);
        if (!verificationRequest) {
            return res.status(404).json({ message: 'Verification request not found' });
        }

        // Check ownership
        if (verificationRequest.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!['pending', 'rejected'].includes(verificationRequest.status)) {
            return res.status(400).json({ message: 'Cannot add documents to a processed request' });
        }

        verificationRequest.documents.push({
            type,
            url,
            publicId: publicId || '',
            uploadedAt: new Date()
        });

        await verificationRequest.save();
        
        // Reset to pending if was rejected
        if (verificationRequest.status === 'rejected') {
            verificationRequest.status = 'pending';
            verificationRequest.rejectionReason = '';
            await verificationRequest.save();
        }

        res.json(verificationRequest);
    } catch (err) {
        next(err);
    }
}

// Initialize default badges (seed data)
async function initializeDefaultBadges(req, res, next) {
    try {
        const defaultBadges = [
            {
                name: 'Verified Alumni',
                slug: 'verified-alumni',
                description: 'Awarded to alumni who have verified their credentials',
                icon: 'fa-check-circle',
                color: '#28a745',
                category: 'verification',
                points: 50,
                criteria: 'Complete the alumni verification process'
            },
            {
                name: 'First Job Finder',
                slug: 'first-job-finder',
                description: 'Awarded for sharing your first job after graduation',
                icon: 'fa-briefcase',
                color: '#17a2b8',
                category: 'career',
                points: 25,
                criteria: 'Post your first career achievement'
            },
            {
                name: 'Mentor Champion',
                slug: 'mentor-champion',
                description: 'Awarded for mentoring 5 or more students',
                icon: 'fa-user-graduate',
                color: '#6f42c1',
                category: 'mentorship',
                points: 100,
                criteria: 'Complete 5 mentorship sessions as a mentor'
            },
            {
                name: 'Event Organizer',
                slug: 'event-organizer',
                description: 'Awarded for organizing alumni events',
                icon: 'fa-calendar-alt',
                color: '#fd7e14',
                category: 'events',
                points: 75,
                criteria: 'Organize or help with alumni events'
            },
            {
                name: 'Year Donor',
                slug: 'year-donor',
                description: 'Awarded for annual donations to the alumni fund',
                icon: 'fa-donate',
                color: '#e74c3c',
                category: 'donation',
                points: 100,
                criteria: 'Make a donation to the alumni fund'
            },
            {
                name: 'Community Star',
                slug: 'community-star',
                description: 'Awarded for active community participation',
                icon: 'fa-star',
                color: '#ffc107',
                category: 'community',
                points: 50,
                criteria: 'Participate in 10 or more community activities'
            },
            {
                name: 'Referral Hero',
                slug: 'referral-hero',
                description: 'Awarded for referring 3 or more alumni',
                icon: 'fa-users',
                color: '#20c997',
                category: 'community',
                points: 75,
                criteria: 'Refer 3 new alumni to the network'
            },
            {
                name: 'First Achievement',
                slug: 'first-achievement',
                description: 'Awarded for sharing your first achievement',
                icon: 'fa-trophy',
                color: '#6c757d',
                category: 'career',
                points: 10,
                criteria: 'Share your first achievement'
            }
        ];

        const createdBadges = [];
        for (const badgeData of defaultBadges) {
            const existing = await Badge.findOne({ slug: badgeData.slug });
            if (!existing) {
                const badge = await Badge.create(badgeData);
                createdBadges.push(badge);
            }
        }

        res.json({ 
            message: `Created ${createdBadges.length} default badges`,
            badges: createdBadges 
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    // Badge management
    createBadge,
    getAllBadges,
    getBadgeById,
    updateBadge,
    deleteBadge,
    initializeDefaultBadges,
    
    // User badge management
    awardBadge,
    getUserBadges,
    getMyBadges,
    removeUserBadge,
    
    // Leaderboard
    getLeaderboard,
    
    // Verification
    submitVerificationRequest,
    getMyVerificationStatus,
    getVerificationRequests,
    reviewVerificationRequest,
    addVerificationDocument
};
