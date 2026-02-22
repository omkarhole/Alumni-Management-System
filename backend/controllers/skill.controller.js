const { Endorsement, User } = require('../models/Index');

// Get all skills with endorsement counts
async function getAllSkills(req, res, next) {
  try {
    // Get all unique skills from endorsements
    const skills = await Endorsement.aggregate([
      {
        $group: {
          _id: { $toLower: '$skill' },
          count: { $sum: 1 },
          endorsers: { $push: '$endorser' }
        }
      },
      {
        $sort: { count: -1, _id: 1 }
      }
    ]);

    // Also get skills from User model
    const userSkills = await User.distinct('alumnus_bio.skills', { type: 'alumnus' });
    
    // Merge both skill sources
    const allSkills = [...new Set([
      ...skills.map(s => s._id),
      ...userSkills.filter(s => s && s.length > 0).map(s => s.toLowerCase())
    ])];

    // Get detailed skill info with endorsement counts
    const skillsWithCounts = await Promise.all(
      allSkills.map(async (skill) => {
        const endorsements = await Endorsement.find({ skill: { $regex: new RegExp(`^${skill}$`, 'i') } })
          .populate('endorser', 'name')
          .lean();
        
        return {
          name: skill,
          endorsementCount: endorsements.length,
          topEndorsers: endorsements.slice(0, 5).map(e => ({
            userId: e.endorser._id,
            name: e.endorser.name,
            date: e.createdAt
          }))
        };
      })
    );

    res.json(skillsWithCounts.sort((a, b) => b.endorsementCount - a.endorsementCount));
  } catch (err) {
    next(err);
  }
}

// Endorse a user for a skill
async function endorseUser(req, res, next) {
  try {
    const { endorseeId, skill } = req.body;
    const endorserId = req.user.id; // From auth middleware

    if (!endorseeId || !skill) {
      return res.status(400).json({ error: 'Endorsee ID and skill are required' });
    }

    if (endorseeId === endorserId) {
      return res.status(400).json({ error: 'You cannot endorse yourself' });
    }

    // Check if endorsee exists
    const endorsee = await User.findById(endorseeId);
    if (!endorsee) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if skill exists in endorsee's skills list
    const hasSkill = endorsee.alumnus_bio?.skills?.some(
      s => s.toLowerCase() === skill.toLowerCase()
    );
    
    // Add skill to endorsee's skills if not already present
    if (!hasSkill) {
      await User.findByIdAndUpdate(endorseeId, {
        $addToSet: { 'alumnus_bio.skills': skill }
      });
    }

    // Create or find endorsement
    let endorsement = await Endorsement.findOne({
      endorser: endorserId,
      endorsee: endorseeId,
      skill: { $regex: new RegExp(`^${skill}$`, 'i') }
    });

    if (endorsement) {
      return res.json({ message: 'Endorsement already exists', endorsement });
    }

    endorsement = await Endorsement.create({
      endorser: endorserId,
      endorsee: endorseeId,
      skill
    });

    await endorsement.populate('endorser', 'name email');

    res.status(201).json({ message: 'Endorsement added successfully', endorsement });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Endorsement already exists' });
    }
    next(err);
  }
}

// Get endorsements for a user
async function getUserEndorsements(req, res, next) {
  try {
    const { userId } = req.params;

    const endorsements = await Endorsement.find({ endorsee: userId })
      .populate('endorser', 'name email alumnus_bio.avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Group by skill and count
    const skillsMap = {};
    endorsements.forEach(e => {
      const skillKey = e.skill.toLowerCase();
      if (!skillsMap[skillKey]) {
        skillsMap[skillKey] = {
          skill: e.skill,
          count: 0,
          endorsers: []
        };
      }
      skillsMap[skillKey].count++;
      skillsMap[skillKey].endorsers.push({
        _id: e.endorser._id,
        name: e.endorser.name,
        avatar: e.endorser.alumnus_bio?.avatar
      });
    });

    const result = Object.values(skillsMap).map(s => ({
      skill: s.skill,
      count: s.count,
      endorsers: s.endorsers
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Remove an endorsement
async function removeEndorsement(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const endorsement = await Endorsement.findById(id);

    if (!endorsement) {
      return res.status(404).json({ error: 'Endorsement not found' });
    }

    // Only the endorser or admin can remove the endorsement
    if (endorsement.endorser.toString() !== userId && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to remove this endorsement' });
    }

    await Endorsement.findByIdAndDelete(id);

    res.json({ message: 'Endorsement removed successfully' });
  } catch (err) {
    next(err);
  }
}

// Get skills for a specific user with endorsement counts
async function getUserSkills(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userSkills = user.alumnus_bio?.skills || [];
    
    // Get endorsement counts for each skill
    const skillsWithCounts = await Promise.all(
      userSkills.map(async (skill) => {
        const count = await Endorsement.countDocuments({
          endorsee: userId,
          skill: { $regex: new RegExp(`^${skill}$`, 'i') }
        });
        
        return {
          name: skill,
          endorsementCount: count
        };
      })
    );

    res.json(skillsWithCounts);
  } catch (err) {
    next(err);
  }
}

// Add a skill to user's profile
async function addUserSkill(req, res, next) {
  try {
    const { skill } = req.body;
    const userId = req.user.id;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const trimmedSkill = skill.trim();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if skill already exists
    const hasSkill = user.alumnus_bio?.skills?.some(
      s => s.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (hasSkill) {
      return res.status(400).json({ error: 'Skill already exists in your profile' });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'alumnus_bio.skills': trimmedSkill }
    });

    res.json({ message: 'Skill added successfully', skill: trimmedSkill });
  } catch (err) {
    next(err);
  }
}

// Remove a skill from user's profile
async function removeUserSkill(req, res, next) {
  try {
    const { skill } = req.body;
    const userId = req.user.id;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const trimmedSkill = skill.trim();

    await User.findByIdAndUpdate(userId, {
      $pull: { 'alumnus_bio.skills': { $regex: new RegExp(`^${trimmedSkill}$`, 'i') } }
    });

    // Also remove all endorsements for this skill
    await Endorsement.deleteMany({
      endorsee: userId,
      skill: { $regex: new RegExp(`^${trimmedSkill}$`, 'i') }
    });

    res.json({ message: 'Skill removed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllSkills,
  endorseUser,
  getUserEndorsements,
  removeEndorsement,
  getUserSkills,
  addUserSkill,
  removeUserSkill
};
