const { Reunion, ReunionMemory, ReunionContribution, User } = require('../models/Index');

// Get all reunions with pagination
async function listReunions(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reunions = await Reunion.find()
      .populate('organizers.user', 'name email avatar')
      .populate('attendees', 'name email avatar')
      .sort({ eventDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reunion.countDocuments();

    res.json({
      reunions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get reunion by ID
async function getReunionById(req, res, next) {
  try {
    const reunion = await Reunion.findById(req.params.id)
      .populate('organizers.user', 'name email avatar')
      .populate('attendees', 'name email avatar');

    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    res.json(reunion);
  } catch (err) {
    next(err);
  }
}

// Get reunions by batch
async function getReunionsByBatch(req, res, next) {
  try {
    const batch = parseInt(req.params.batch);

    const reunions = await Reunion.find({ batch })
      .populate('organizers.user', 'name email avatar')
      .populate('attendees', 'name email avatar')
      .sort({ eventDate: -1 });

    res.json(reunions);
  } catch (err) {
    next(err);
  }
}

// Create new reunion
async function createReunion(req, res, next) {
  try {
    const { title, batch, description, eventDate, venue, virtualOption } = req.body;
    const userId = req.user.id;

    const reunion = await Reunion.create({
      title,
      batch,
      description,
      eventDate,
      venue,
      virtualOption,
      organizers: [{
        user: userId,
        role: 'coordinator'
      }],
      attendees: [userId]
    });

    const populatedReunion = await reunion.populate('organizers.user', 'name email avatar');

    res.status(201).json({
      message: 'Reunion created successfully',
      reunion: populatedReunion
    });
  } catch (err) {
    next(err);
  }
}

// Update reunion
async function updateReunion(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reunion = await Reunion.findById(id);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    // Check if user is organizer
    const isOrganizer = reunion.organizers.some(org => org.user.toString() === userId);
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can update reunion' });
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    await Reunion.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ message: 'Reunion updated successfully' });
  } catch (err) {
    next(err);
  }
}

// Delete reunion
async function deleteReunion(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reunion = await Reunion.findById(id);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    // Check if user is organizer
    const isOrganizer = reunion.organizers.some(org => org.user.toString() === userId);
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can delete reunion' });
    }

    await Reunion.findByIdAndDelete(id);

    res.json({ message: 'Reunion deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Join reunion (RSVP)
async function joinReunion(req, res, next) {
  try {
    const { reunionId } = req.body;
    const userId = req.user.id;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    // Check if already attending
    if (reunion.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Already marked as attending' });
    }

    reunion.attendees.push(userId);
    await reunion.save();

    res.json({ message: 'Successfully joined reunion' });
  } catch (err) {
    next(err);
  }
}

// Leave reunion
async function leaveReunion(req, res, next) {
  try {
    const { reunionId } = req.body;
    const userId = req.user.id;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    reunion.attendees = reunion.attendees.filter(id => id.toString() !== userId);
    await reunion.save();

    res.json({ message: 'Successfully left reunion' });
  } catch (err) {
    next(err);
  }
}

// Add memory (photo/message)
async function addMemory(req, res, next) {
  try {
    const { reunionId, caption, photos } = req.body;
    const userId = req.user.id;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    const memory = await ReunionMemory.create({
      reunion: reunionId,
      user: userId,
      caption,
      photos: photos || []
    });

    const populatedMemory = await memory.populate('user', 'name avatar email');

    res.status(201).json({
      message: 'Memory added successfully',
      memory: populatedMemory
    });
  } catch (err) {
    next(err);
  }
}

// Get memories for a reunion
async function getMemories(req, res, next) {
  try {
    const { reunionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    const memories = await ReunionMemory.find({ reunion: reunionId })
      .populate('user', 'name avatar email')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReunionMemory.countDocuments({ reunion: reunionId });

    res.json({
      memories,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (err) {
    next(err);
  }
}

// Delete memory
async function deleteMemory(req, res, next) {
  try {
    const { memoryId } = req.params;
    const userId = req.user.id;

    const memory = await ReunionMemory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Check if user is owner
    if (memory.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the owner can delete this memory' });
    }

    await ReunionMemory.findByIdAndDelete(memoryId);

    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Like memory
async function likeMemory(req, res, next) {
  try {
    const { memoryId } = req.params;
    const userId = req.user.id;

    const memory = await ReunionMemory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    if (memory.likes.includes(userId)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    memory.likes.push(userId);
    await memory.save();

    res.json({ likes: memory.likes.length });
  } catch (err) {
    next(err);
  }
}

// Unlike memory
async function unlikeMemory(req, res, next) {
  try {
    const { memoryId } = req.params;
    const userId = req.user.id;

    const memory = await ReunionMemory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    memory.likes = memory.likes.filter(id => id.toString() !== userId);
    await memory.save();

    res.json({ likes: memory.likes.length });
  } catch (err) {
    next(err);
  }
}

// Add comment to memory
async function addComment(req, res, next) {
  try {
    const { memoryId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const memory = await ReunionMemory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    memory.comments.push({
      user: userId,
      text
    });

    await memory.save();
    const updated = await memory.populate('comments.user', 'name avatar');

    res.json({ comments: updated.comments });
  } catch (err) {
    next(err);
  }
}

// Manage contributions (View, Add, Update)
async function addContribution(req, res, next) {
  try {
    const { reunionId, amount, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    const contribution = await ReunionContribution.create({
      reunion: reunionId,
      contributor: userId,
      amount,
      paymentMethod,
      notes
    });

    // Update reunion budget
    reunion.budget.collected += amount;
    await reunion.save();

    const populatedContribution = await contribution.populate('contributor', 'name email');

    res.status(201).json({
      message: 'Contribution added successfully',
      contribution: populatedContribution
    });
  } catch (err) {
    next(err);
  }
}

// Get contributions for a reunion
async function getContributions(req, res, next) {
  try {
    const { reunionId } = req.params;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    const contributions = await ReunionContribution.find({ reunion: reunionId })
      .populate('contributor', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      contributions,
      budget: reunion.budget
    });
  } catch (err) {
    next(err);
  }
}

// Update contribution status (For admins/organizers)
async function updateContributionStatus(req, res, next) {
  try {
    const { contributionId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const contribution = await ReunionContribution.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    const reunion = await Reunion.findById(contribution.reunion);
    const isOrganizer = reunion.organizers.some(org => org.user.toString() === userId);
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can update contributions' });
    }

    contribution.status = status;
    await contribution.save();

    res.json({ message: 'Contribution status updated' });
  } catch (err) {
    next(err);
  }
}

// Add organizer to reunion
async function addOrganizer(req, res, next) {
  try {
    const { reunionId } = req.params;
    const { userId, role } = req.body;
    const requesterId = req.user.id;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    // Check if requester is organizer
    const isOrganizer = reunion.organizers.some(org => org.user.toString() === requesterId);
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can add members' });
    }

    // Check if already organizer
    const exists = reunion.organizers.some(org => org.user.toString() === userId);
    if (exists) {
      return res.status(400).json({ message: 'User is already an organizer' });
    }

    reunion.organizers.push({
      user: userId,
      role: role || 'member'
    });

    await reunion.save();
    const updated = await reunion.populate('organizers.user', 'name email avatar');

    res.json({
      message: 'Organizer added successfully',
      organizers: updated.organizers
    });
  } catch (err) {
    next(err);
  }
}

// Remove organizer from reunion
async function removeOrganizer(req, res, next) {
  try {
    const { reunionId, organizerId } = req.params;
    const requesterId = req.user.id;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json({ message: 'Reunion not found' });
    }

    // Check if requester is coordinator
    const isCoordinator = reunion.organizers.some(
      org => org.user.toString() === requesterId && org.role === 'coordinator'
    );
    if (!isCoordinator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only coordinator can remove organizers' });
    }

    reunion.organizers = reunion.organizers.filter(org => org.user.toString() !== organizerId);
    await reunion.save();

    res.json({ message: 'Organizer removed successfully' });
  } catch (err) {
    next(err);
  }
}

// Get upcoming reunions (for dashboard)
async function getUpcomingReunions(req, res, next) {
  try {
    const currentDate = new Date();

    const reunions = await Reunion.find({
      eventDate: { $gte: currentDate },
      status: { $in: ['planning', 'confirmed'] }
    })
      .populate('organizers.user', 'name avatar')
      .sort({ eventDate: 1 })
      .limit(5);

    res.json(reunions);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listReunions,
  getReunionById,
  getReunionsByBatch,
  createReunion,
  updateReunion,
  deleteReunion,
  joinReunion,
  leaveReunion,
  addMemory,
  getMemories,
  deleteMemory,
  likeMemory,
  unlikeMemory,
  addComment,
  addContribution,
  getContributions,
  updateContributionStatus,
  addOrganizer,
  removeOrganizer,
  getUpcomingReunions
};
