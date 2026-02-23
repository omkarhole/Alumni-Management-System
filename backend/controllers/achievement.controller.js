const { Achievement, User } = require('../models/Index');

// Create a new achievement
async function createAchievement(req, res, next) {
    try {
        const achievementData = {
            user: req.user.id,
            type: req.body.type,
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            company: req.body.company || '',
            mediaUrl: req.body.mediaUrl || '',
            isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true
        };

        const achievement = await Achievement.create(achievementData);
        
        // Populate user details for response
        await achievement.populate('user', 'name email alumnus_bio');

        res.status(201).json(achievement);
    } catch (err) {
        next(err);
    }
}

// Get all achievements (public feed)
async function getAchievements(req, res, next) {
    try {
        const { type, limit = 20, skip = 0 } = req.query;
        
        const query = { isPublished: true };
        if (type && type !== 'all') {
            query.type = type;
        }

        const achievements = await Achievement.find(query)
            .populate('user', 'name email alumnus_bio')
            .sort({ date: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Achievement.countDocuments(query);

        res.json({
            achievements,
            total,
            hasMore: parseInt(skip) + achievements.length < total
        });
    } catch (err) {
        next(err);
    }
}

// Get current user's achievements
async function getMyAchievements(req, res, next) {
    try {
        const achievements = await Achievement.find({ user: req.user.id })
            .sort({ date: -1, createdAt: -1 });

        res.json(achievements);
    } catch (err) {
        next(err);
    }
}

// Get achievements for a specific user
async function getUserAchievements(req, res, next) {
    try {
        const { userId } = req.params;

        const achievements = await Achievement.find({ 
            user: userId,
            isPublished: true 
        })
            .populate('user', 'name email alumnus_bio')
            .sort({ date: -1, createdAt: -1 });

        res.json(achievements);
    } catch (err) {
        next(err);
    }
}

// Update an achievement
async function updateAchievement(req, res, next) {
    try {
        const { id } = req.params;

        // Find achievement
        const achievement = await Achievement.findById(id);
        
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        // Check if user owns the achievement or is admin
        if (achievement.user.toString() !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update fields
        const updateFields = ['type', 'title', 'description', 'date', 'company', 'mediaUrl', 'isPublished'];
        
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                achievement[field] = req.body[field];
            }
        });

        await achievement.save();
        
        // Populate user details for response
        await achievement.populate('user', 'name email alumnus_bio');

        res.json(achievement);
    } catch (err) {
        next(err);
    }
}

// Delete an achievement
async function deleteAchievement(req, res, next) {
    try {
        const { id } = req.params;

        // Find achievement
        const achievement = await Achievement.findById(id);
        
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        // Check if user owns the achievement or is admin
        if (achievement.user.toString() !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Achievement.findByIdAndDelete(id);

        res.json({ message: 'Achievement deleted successfully' });
    } catch (err) {
        next(err);
    }
}

// Get all achievements (admin - including unpublished)
async function getAllAchievementsAdmin(req, res, next) {
    try {
        const { type, status } = req.query;
        
        const query = {};
        if (type && type !== 'all') {
            query.type = type;
        }
        if (status === 'published') {
            query.isPublished = true;
        } else if (status === 'unpublished') {
            query.isPublished = false;
        }

        const achievements = await Achievement.find(query)
            .populate('user', 'name email type')
            .sort({ date: -1, createdAt: -1 });

        res.json(achievements);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createAchievement,
    getAchievements,
    getMyAchievements,
    getUserAchievements,
    updateAchievement,
    deleteAchievement,
    getAllAchievementsAdmin
};
