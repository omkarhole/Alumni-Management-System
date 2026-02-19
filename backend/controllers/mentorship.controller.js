const { 
  User, 
  MentorProfile, 
  MentorshipMatch, 
  MentorshipSession, 
  MentorshipMessage 
} = require('../models/Index');

// ==================== MENTOR PROFILE CONTROLLERS ====================

// Create or update mentor profile
async function createOrUpdateMentorProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Check if user is an alumnus
    const user = await User.findById(userId);
    if (!user || user.type !== 'alumnus') {
      return res.status(403).json({ error: 'Only alumni can become mentors' });
    }

    // Find existing profile or create new one
    let mentorProfile = await MentorProfile.findOne({ user: userId });

    if (mentorProfile) {
      // Update existing profile
      Object.assign(mentorProfile, profileData);
      await mentorProfile.save();
    } else {
      // Create new profile
      mentorProfile = new MentorProfile({
        user: userId,
        ...profileData
      });
      await mentorProfile.save();
    }

    res.json({ 
      message: mentorProfile ? 'Mentor profile updated successfully' : 'Mentor profile created successfully',
      profile: mentorProfile 
    });
  } catch (err) {
    next(err);
  }
}

// Get mentor profile by user ID
async function getMentorProfile(req, res, next) {
  try {
    const { userId } = req.params;
    
    const profile = await MentorProfile.findOne({ user: userId })
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch');

    if (!profile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

// Get my mentor profile
async function getMyMentorProfile(req, res, next) {
  try {
    const userId = req.user.id;
    
    const profile = await MentorProfile.findOne({ user: userId })
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch');

    if (!profile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

// Toggle mentor status (active/inactive)
async function toggleMentorStatus(req, res, next) {
  try {
    const userId = req.user.id;
    
    const profile = await MentorProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    profile.isActive = !profile.isActive;
    await profile.save();

    res.json({ 
      message: `Mentor profile ${profile.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: profile.isActive 
    });
  } catch (err) {
    next(err);
  }
}

// List all active mentors with filters
async function listMentors(req, res, next) {
  try {
    const { 
      expertise, 
      industry, 
      search, 
      page = 1, 
      limit = 12,
      minRating = 0
    } = req.query;

    const query = { isActive: true };

    // Filter by expertise
    if (expertise) {
      const expertiseArray = expertise.split(',');
      query.expertise = { $in: expertiseArray };
    }

    // Filter by industry
    if (industry) {
      const industryArray = industry.split(',');
      query.industries = { $in: industryArray };
    }

    // Filter by minimum rating
    if (minRating > 0) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Text search on bio, current position, company
    if (search) {
      query.$or = [
        { bio: { $regex: search, $options: 'i' } },
        { currentPosition: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { expertise: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const mentors = await MentorProfile.find(query)
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch alumnus_bio.course')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MentorProfile.countDocuments(query);

    res.json({
      mentors,
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

// Get mentor filter options
async function getMentorFilterOptions(req, res, next) {
  try {
    const expertise = await MentorProfile.distinct('expertise', { isActive: true });
    const industries = await MentorProfile.distinct('industries', { isActive: true });

    res.json({
      expertise: expertise.filter(e => e).sort(),
      industries: industries.filter(i => i).sort()
    });
  } catch (err) {
    next(err);
  }
}

// ==================== MENTORSHIP MATCH CONTROLLERS ====================

// Request mentorship
async function requestMentorship(req, res, next) {
  try {
    const menteeId = req.user.id;
    const { mentorId, requestMessage, goals } = req.body;

    // Check if mentor exists and is active
    const mentorProfile = await MentorProfile.findOne({ user: mentorId, isActive: true });
    if (!mentorProfile) {
      return res.status(404).json({ error: 'Mentor not found or inactive' });
    }

    // Check if mentor has reached max mentees
    if (mentorProfile.currentMentees >= mentorProfile.maxMentees) {
      return res.status(400).json({ error: 'Mentor has reached maximum mentee limit' });
    }

    // Check if mentorship already exists
    const existingMatch = await MentorshipMatch.findOne({
      mentor: mentorId,
      mentee: menteeId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingMatch) {
      return res.status(400).json({ 
        error: existingMatch.status === 'pending' 
          ? 'Mentorship request already pending' 
          : 'You are already mentored by this mentor' 
      });
    }

    // Create mentorship match
    const match = new MentorshipMatch({
      mentor: mentorId,
      mentee: menteeId,
      requestMessage,
      goals,
      status: 'pending'
    });

    await match.save();

    res.json({ 
      message: 'Mentorship request sent successfully',
      match 
    });
  } catch (err) {
    next(err);
  }
}

// Respond to mentorship request (accept/reject)
async function respondToMentorshipRequest(req, res, next) {
  try {
    const mentorId = req.user.id;
    const { matchId, status, responseMessage } = req.body;

    const match = await MentorshipMatch.findOne({
      _id: matchId,
      mentor: mentorId,
      status: 'pending'
    });

    if (!match) {
      return res.status(404).json({ error: 'Mentorship request not found' });
    }

    match.status = status;
    match.responseMessage = responseMessage;
    
    if (status === 'accepted') {
      match.startDate = new Date();
      
      // Increment mentor's current mentees count
      await MentorProfile.findOneAndUpdate(
        { user: mentorId },
        { $inc: { currentMentees: 1 } }
      );
    }

    await match.save();

    res.json({ 
      message: `Mentorship request ${status} successfully`,
      match 
    });
  } catch (err) {
    next(err);
  }
}

// Get my mentorships (as mentor or mentee)
async function getMyMentorships(req, res, next) {
  try {
    const userId = req.user.id;
    const { role, status } = req.query;

    let query = {};
    
    if (role === 'mentor') {
      query.mentor = userId;
    } else if (role === 'mentee') {
      query.mentee = userId;
    } else {
      query.$or = [{ mentor: userId }, { mentee: userId }];
    }

    if (status) {
      query.status = status;
    }

    const mentorships = await MentorshipMatch.find(query)
      .populate('mentor', 'name email alumnus_bio.avatar')
      .populate('mentee', 'name email alumnus_bio.avatar student_bio.course')
      .sort({ createdAt: -1 });

    res.json(mentorships);
  } catch (err) {
    next(err);
  }
}

// Get mentorship details
async function getMentorshipDetails(req, res, next) {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await MentorshipMatch.findOne({
      _id: matchId,
      $or: [{ mentor: userId }, { mentee: userId }]
    })
      .populate('mentor', 'name email alumnus_bio.avatar alumnus_bio.batch')
      .populate('mentee', 'name email alumnus_bio.avatar student_bio.course');

    if (!match) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    res.json(match);
  } catch (err) {
    next(err);
  }
}

// End mentorship
async function endMentorship(req, res, next) {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    const match = await MentorshipMatch.findOne({
      _id: matchId,
      $or: [{ mentor: userId }, { mentee: userId }],
      status: 'accepted'
    });

    if (!match) {
      return res.status(404).json({ error: 'Active mentorship not found' });
    }

    match.status = 'completed';
    match.endDate = new Date();
    await match.save();

    // Decrement mentor's current mentees count
    await MentorProfile.findOneAndUpdate(
      { user: match.mentor },
      { $inc: { currentMentees: -1 } }
    );

    res.json({ message: 'Mentorship ended successfully' });
  } catch (err) {
    next(err);
  }
}

// Submit feedback for mentorship
async function submitMentorshipFeedback(req, res, next) {
  try {
    const userId = req.user.id;
    const { matchId, rating, comment } = req.body;

    const match = await MentorshipMatch.findOne({
      _id: matchId,
      $or: [{ mentor: userId }, { mentee: userId }],
      status: { $in: ['completed', 'accepted'] }
    });

    if (!match) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    const isMentor = match.mentor.toString() === userId;
    const feedbackField = isMentor ? 'mentorFeedback' : 'menteeFeedback';

    match[feedbackField] = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await match.save();

    // Update mentor's overall rating
    if (!isMentor) {
      await updateMentorRating(match.mentor);
    }

    res.json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    next(err);
  }
}

// Helper function to update mentor rating
async function updateMentorRating(mentorId) {
  const matches = await MentorshipMatch.find({
    mentor: mentorId,
    'menteeFeedback.rating': { $exists: true }
  });

  if (matches.length > 0) {
    const totalRating = matches.reduce((sum, match) => sum + match.menteeFeedback.rating, 0);
    const averageRating = totalRating / matches.length;

    await MentorProfile.findOneAndUpdate(
      { user: mentorId },
      { 
        rating: parseFloat(averageRating.toFixed(1)),
        totalReviews: matches.length
      }
    );
  }
}

// ==================== MENTORSHIP SESSION CONTROLLERS ====================

// Schedule a session
async function scheduleSession(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      mentorshipId,
      title,
      description,
      sessionType,
      scheduledDate,
      startTime,
      endTime,
      duration,
      isVirtual,
      meetingLink,
      meetingLocation
    } = req.body;

    // Verify mentorship exists and user is part of it
    const mentorship = await MentorshipMatch.findOne({
      _id: mentorshipId,
      $or: [{ mentor: userId }, { mentee: userId }],
      status: 'accepted'
    });

    if (!mentorship) {
      return res.status(404).json({ error: 'Active mentorship not found' });
    }

    const session = new MentorshipSession({
      mentorship: mentorshipId,
      mentor: mentorship.mentor,
      mentee: mentorship.mentee,
      title,
      description,
      sessionType,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      duration: duration || 60,
      isVirtual,
      meetingLink,
      meetingLocation
    });

    await session.save();

    // Increment total sessions count
    mentorship.totalSessions += 1;
    await mentorship.save();

    res.json({ 
      message: 'Session scheduled successfully',
      session 
    });
  } catch (err) {
    next(err);
  }
}

// Get sessions for a mentorship
async function getMentorshipSessions(req, res, next) {
  try {
    const { mentorshipId } = req.params;
    const userId = req.user.id;
    const { status } = req.query;

    // Verify user is part of this mentorship
    const mentorship = await MentorshipMatch.findOne({
      _id: mentorshipId,
      $or: [{ mentor: userId }, { mentee: userId }]
    });

    if (!mentorship) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    let query = { mentorship: mentorshipId };
    if (status) {
      query.status = status;
    }

    const sessions = await MentorshipSession.find(query)
      .sort({ scheduledDate: 1, startTime: 1 });

    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

// Get my upcoming sessions
async function getMyUpcomingSessions(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await MentorshipSession.find({
      $or: [{ mentor: userId }, { mentee: userId }],
      scheduledDate: { $gte: today },
      status: { $in: ['scheduled', 'rescheduled'] }
    })
      .populate('mentor', 'name email')
      .populate('mentee', 'name email')
      .populate('mentorship', 'goals')
      .sort({ scheduledDate: 1, startTime: 1 });

    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

// Update session
async function updateSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const updateData = req.body;

    const session = await MentorshipSession.findOne({
      _id: sessionId,
      $or: [{ mentor: userId }, { mentee: userId }]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only allow updates to scheduled or rescheduled sessions
    if (!['scheduled', 'rescheduled'].includes(session.status)) {
      return res.status(400).json({ error: 'Cannot update completed or cancelled sessions' });
    }

    Object.assign(session, updateData);
    if (updateData.scheduledDate || updateData.startTime || updateData.endTime) {
      session.status = 'rescheduled';
    }

    await session.save();

    res.json({ 
      message: 'Session updated successfully',
      session 
    });
  } catch (err) {
    next(err);
  }
}

// Cancel session
async function cancelSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await MentorshipSession.findOne({
      _id: sessionId,
      $or: [{ mentor: userId }, { mentee: userId }]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'cancelled';
    session.cancelledBy = userId;
    session.cancellationReason = reason;
    await session.save();

    res.json({ message: 'Session cancelled successfully' });
  } catch (err) {
    next(err);
  }
}

// Complete session and add notes
async function completeSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { notes, menteeNotes, mentorNotes, actionItems } = req.body;

    const session = await MentorshipSession.findOne({
      _id: sessionId,
      $or: [{ mentor: userId }, { mentee: userId }]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'completed';
    if (notes) session.notes = notes;
    if (menteeNotes) session.menteeNotes = menteeNotes;
    if (mentorNotes) session.mentorNotes = mentorNotes;
    if (actionItems) session.actionItems = actionItems;

    await session.save();

    // Increment completed sessions count
    await MentorshipMatch.findByIdAndUpdate(
      session.mentorship,
      { $inc: { completedSessions: 1 } }
    );

    res.json({ 
      message: 'Session marked as completed',
      session 
    });
  } catch (err) {
    next(err);
  }
}

// ==================== MENTORSHIP MESSAGE CONTROLLERS ====================

// Send message
async function sendMessage(req, res, next) {
  try {
    const senderId = req.user.id;
    const { mentorshipId, content, messageType = 'text', fileUrl, fileName, parentMessage } = req.body;

    // Verify user is part of this mentorship
    const mentorship = await MentorshipMatch.findOne({
      _id: mentorshipId,
      $or: [{ mentor: senderId }, { mentee: senderId }],
      status: 'accepted'
    });

    if (!mentorship) {
      return res.status(404).json({ error: 'Active mentorship not found' });
    }

    const receiverId = mentorship.mentor.toString() === senderId 
      ? mentorship.mentee 
      : mentorship.mentor;

    const message = new MentorshipMessage({
      mentorship: mentorshipId,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      fileUrl,
      fileName,
      parentMessage: parentMessage || null
    });

    await message.save();
    await message.populate('sender', 'name email alumnus_bio.avatar');

    res.json({ 
      message: 'Message sent successfully',
      data: message 
    });
  } catch (err) {
    next(err);
  }
}

// Get messages for a mentorship
async function getMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const { mentorshipId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this mentorship
    const mentorship = await MentorshipMatch.findOne({
      _id: mentorshipId,
      $or: [{ mentor: userId }, { mentee: userId }]
    });

    if (!mentorship) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await MentorshipMessage.find({
      mentorship: mentorshipId,
      isDeleted: false
    })
      .populate('sender', 'name email alumnus_bio.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await MentorshipMessage.updateMany(
      { 
        mentorship: mentorshipId, 
        receiver: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get unread message count
async function getUnreadMessageCount(req, res, next) {
  try {
    const userId = req.user.id;

    const count = await MentorshipMessage.countDocuments({
      receiver: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({ unreadCount: count });
  } catch (err) {
    next(err);
  }
}

// Edit message
async function editMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await MentorshipMessage.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ 
      message: 'Message updated successfully',
      data: message 
    });
  } catch (err) {
    next(err);
  }
}

// Delete message (soft delete)
async function deleteMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await MentorshipMessage.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ==================== ADMIN CONTROLLERS ====================

// Get all mentorships (admin only)
async function getAllMentorships(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const mentorships = await MentorshipMatch.find(query)
      .populate('mentor', 'name email')
      .populate('mentee', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MentorshipMatch.countDocuments(query);

    res.json({
      mentorships,
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

// Get mentorship statistics (admin only)
async function getMentorshipStats(req, res, next) {
  try {
    const totalMentors = await MentorProfile.countDocuments({ isActive: true });
    const totalMentorships = await MentorshipMatch.countDocuments();
    const activeMentorships = await MentorshipMatch.countDocuments({ status: 'accepted' });
    const pendingRequests = await MentorshipMatch.countDocuments({ status: 'pending' });
    const completedMentorships = await MentorshipMatch.countDocuments({ status: 'completed' });
    
    const totalSessions = await MentorshipSession.countDocuments();
    const completedSessions = await MentorshipSession.countDocuments({ status: 'completed' });
    const upcomingSessions = await MentorshipSession.countDocuments({ 
      status: { $in: ['scheduled', 'rescheduled'] },
      scheduledDate: { $gte: new Date() }
    });

    res.json({
      mentors: {
        total: totalMentors
      },
      mentorships: {
        total: totalMentorships,
        active: activeMentorships,
        pending: pendingRequests,
        completed: completedMentorships
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        upcoming: upcomingSessions
      }
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Update mentorship status
async function adminUpdateMentorshipStatus(req, res, next) {
  try {
    const { matchId } = req.params;
    const { status } = req.body;

    const match = await MentorshipMatch.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    const oldStatus = match.status;
    match.status = status;
    
    if (status === 'completed' && oldStatus === 'accepted') {
      match.endDate = new Date();
      // Decrement mentor's current mentees
      await MentorProfile.findOneAndUpdate(
        { user: match.mentor },
        { $inc: { currentMentees: -1 } }
      );
    }

    await match.save();

    res.json({ 
      message: 'Mentorship status updated successfully',
      match 
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Mentor Profile
  createOrUpdateMentorProfile,
  getMentorProfile,
  getMyMentorProfile,
  toggleMentorStatus,
  listMentors,
  getMentorFilterOptions,
  
  // Mentorship Match
  requestMentorship,
  respondToMentorshipRequest,
  getMyMentorships,
  getMentorshipDetails,
  endMentorship,
  submitMentorshipFeedback,
  
  // Mentorship Session
  scheduleSession,
  getMentorshipSessions,
  getMyUpcomingSessions,
  updateSession,
  cancelSession,
  completeSession,
  
  // Mentorship Message
  sendMessage,
  getMessages,
  getUnreadMessageCount,
  editMessage,
  deleteMessage,
  
  // Admin
  getAllMentorships,
  getMentorshipStats,
  adminUpdateMentorshipStatus
};
