const { JobReferral, User, Badge, UserBadge, ReferralMessage } = require('../models/Index');
const logger = require('../utils/logger');

async function getCurrentUserSummary(userId) {
  return User.findById(userId).select('_id name type');
}

function appendTimelineEvent(referral, event) {
  if (!referral.timeline) {
    referral.timeline = [];
  }

  referral.timeline.push({
    action: event.action,
    status: event.status,
    scope: event.scope || 'referral',
    timestamp: event.timestamp || new Date(),
    actor: event.actor?._id || event.actor,
    actorName: event.actorName,
    actorType: event.actorType,
    applicant: event.applicant?._id || event.applicant,
    applicantName: event.applicantName,
    details: event.details
  });
}

async function getReferralAccess(referralId, userId) {
  const referral = await JobReferral.findById(referralId)
    .populate('postedBy', 'name email alumnus_bio')
    .populate('applicants.user', 'name email alumnus_bio');

  if (!referral) {
    return { referral: null, access: false, currentUser: null, isOwner: false, isApplicant: false };
  }

  const currentUser = await getCurrentUserSummary(userId);
  const isOwner = referral.postedBy?._id?.toString() === userId;
  const isApplicant = referral.applicants?.some((applicant) => applicant.user?._id?.toString() === userId);
  const isAdmin = currentUser?.type === 'admin';

  return {
    referral,
    currentUser,
    access: Boolean(isOwner || isApplicant || isAdmin),
    isOwner,
    isApplicant,
    isAdmin
  };
}

// Create a new job referral opportunity
async function createReferral(req, res, next) {
  try {
    const currentUser = await getCurrentUserSummary(req.user.id);
    const referralData = {
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      description: req.body.description,
      referralBonus: req.body.referralBonus || 0,
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      postedBy: req.user.id,
      timeline: []
    };

    appendTimelineEvent(referralData, {
      action: 'posted',
      status: 'open',
      scope: 'referral',
      actor: currentUser,
      actorName: currentUser?.name,
      actorType: currentUser?.type,
      details: 'Referral posted'
    });

    const referral = await JobReferral.create(referralData);

    // Populate for response
    await referral.populate('postedBy', 'name email alumnus_bio');

    // Check if this is user's first referral (award badge)
    const userReferralsCount = await JobReferral.countDocuments({ postedBy: req.user.id });
    if (userReferralsCount === 1) {
      await awardFirstReferralBadge(req.user.id);
    }

    res.status(201).json({
      message: 'Referral opportunity created successfully',
      referral
    });
  } catch (err) {
    next(err);
  }
}

// Helper to award first referral badge
async function awardFirstReferralBadge(userId) {
  try {
    // Find or create badge
    let badge = await Badge.findOne({ slug: 'first-referral-given' });
    if (!badge) {
      badge = await Badge.create({
        name: 'First Referral Given',
        slug: 'first-referral-given',
        description: 'Awarded for posting your first job referral opportunity',
        icon: 'fa-share-alt',
        color: '#17a2b8',
        category: 'referrals',
        points: 25,
        criteria: 'Post first referral opportunity'
      });
    }

    // Check if user already has badge
    const hasBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
    if (!hasBadge) {
      await UserBadge.create({
        user: userId,
        badge: badge._id,
        source: { type: 'automatic', referenceId: badge._id }
      });
      logger.info(`First referral badge awarded to user ${userId}`);
    }
  } catch (err) {
    logger.logError(err, { operation: 'award-first-referral-badge', userId });
  }
}

// Get all referrals (open first)
async function getReferrals(req, res, next) {
  try {
    const { status = 'open', search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { status };
    if (search) {
      query.$text = { $search: search };
    }

    const referrals = await JobReferral.find(query)
      .populate('postedBy', 'name email alumnus_bio')
      .populate('applicants.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip * 1)
      .limit(limit * 1);

    const total = await JobReferral.countDocuments(query);

    res.json({
      referrals,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    next(err);
  }
}

// Apply for a referral
async function applyForReferral(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = await getCurrentUserSummary(req.user.id);

    if (!currentUser || currentUser.type !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for referrals' });
    }

    const referral = await JobReferral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (referral.status !== 'open') {
      return res.status(400).json({ message: 'Referral is no longer open' });
    }

    if (referral.deadline && new Date() > new Date(referral.deadline)) {
      return res.status(400).json({ message: 'Referral deadline has passed' });
    }

    // Check if already applied
    const alreadyApplied = referral.applicants.some(
      app => app.user.toString() === req.user.id
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this referral' });
    }

    referral.applicants.push({
      user: req.user.id
    });

    appendTimelineEvent(referral, {
      action: 'applied',
      status: 'pending',
      scope: 'applicant',
      actor: currentUser,
      actorName: currentUser.name,
      actorType: currentUser.type,
      applicant: currentUser,
      applicantName: currentUser.name,
      details: `${currentUser.name} applied for this referral`
    });

    await referral.save();

    await referral.populate('applicants.user', 'name email alumnus_bio');

    res.status(201).json({
      message: 'Application submitted successfully',
      referral
    });
  } catch (err) {
    next(err);
  }
}

// Accept a referral applicant
async function acceptReferral(req, res, next) {
  try {
    const { id, applicantId } = req.params;
    const currentUser = await getCurrentUserSummary(req.user.id);

    const referral = await JobReferral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    const isOwner = referral.postedBy.toString() === req.user.id;
    const isAdmin = currentUser?.type === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applicantIndex = referral.applicants.findIndex(
      app => app.user.toString() === applicantId
    );
    if (applicantIndex === -1) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    const applicantUser = await User.findById(applicantId).select('_id name');

    referral.applicants[applicantIndex].status = 'accepted';
    referral.status = 'filled'; // Close after accept

    appendTimelineEvent(referral, {
      action: 'accepted',
      status: 'accepted',
      scope: 'applicant',
      actor: currentUser,
      actorName: currentUser?.name,
      actorType: currentUser?.type,
      applicant: applicantUser?._id || applicantId,
      applicantName: applicantUser?.name,
      details: `${applicantUser?.name || 'Applicant'} was accepted`
    });

    appendTimelineEvent(referral, {
      action: 'filled',
      status: 'filled',
      scope: 'referral',
      actor: currentUser,
      actorName: currentUser?.name,
      actorType: currentUser?.type,
      applicant: applicantUser?._id || applicantId,
      applicantName: applicantUser?.name,
      details: 'Referral marked as filled'
    });

    await referral.save();

    await referral.populate('applicants.user', 'name email');

    res.json({
      message: 'Applicant accepted successfully',
      referral
    });
  } catch (err) {
    next(err);
  }
}

// Reject a referral applicant
async function rejectReferral(req, res, next) {
  try {
    const { id, applicantId } = req.params;
    const currentUser = await getCurrentUserSummary(req.user.id);

    const referral = await JobReferral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    const isOwner = referral.postedBy.toString() === req.user.id;
    const isAdmin = currentUser?.type === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applicantIndex = referral.applicants.findIndex(
      app => app.user.toString() === applicantId
    );
    if (applicantIndex === -1) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    const applicantUser = await User.findById(applicantId).select('_id name');

    referral.applicants[applicantIndex].status = 'rejected';

    appendTimelineEvent(referral, {
      action: 'rejected',
      status: 'rejected',
      scope: 'applicant',
      actor: currentUser,
      actorName: currentUser?.name,
      actorType: currentUser?.type,
      applicant: applicantUser?._id || applicantId,
      applicantName: applicantUser?.name,
      details: `${applicantUser?.name || 'Applicant'} was rejected`
    });

    await referral.save();

    await referral.populate('applicants.user', 'name email');

    res.json({
      message: 'Applicant rejected successfully',
      referral
    });
  } catch (err) {
    next(err);
  }
}

// Get single referral by ID
async function getReferralById(req, res, next) {
  try {
    const referral = await JobReferral.findById(req.params.id)
      .populate('postedBy', 'name email alumnus_bio')
      .populate('applicants.user', 'name email alumnus_bio');
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.json(referral);
  } catch (err) {
    next(err);
  }
}

async function getReferralTimeline(req, res, next) {
  try {
    const referral = await JobReferral.findById(req.params.id).select('timeline');
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    const timeline = [...(referral.timeline || [])].sort(
      (left, right) => new Date(left.timestamp) - new Date(right.timestamp)
    );

    res.json({ timeline });
  } catch (err) {
    next(err);
  }
}

async function closeReferral(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = await getCurrentUserSummary(req.user.id);

    const referral = await JobReferral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    const isOwner = referral.postedBy.toString() === req.user.id;
    const isAdmin = currentUser?.type === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (referral.status === 'closed' || referral.status === 'filled') {
      return res.status(400).json({ message: 'Referral is already closed' });
    }

    referral.status = 'closed';

    appendTimelineEvent(referral, {
      action: 'closed',
      status: 'closed',
      scope: 'referral',
      actor: currentUser,
      actorName: currentUser?.name,
      actorType: currentUser?.type,
      details: 'Referral closed'
    });

    await referral.save();

    res.json({
      message: 'Referral closed successfully',
      referral
    });
  } catch (err) {
    next(err);
  }
}

async function getReferralMessages(req, res, next) {
  try {
    const { id } = req.params;
    const { referral, access } = await getReferralAccess(id, req.user.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (!access) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await ReferralMessage.find({ referralId: id })
      .populate('sender', 'name email alumnus_bio')
      .populate('recipient', 'name email alumnus_bio')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

async function sendReferralMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { body, recipientId } = req.body;
    const { referral, currentUser, access, isOwner, isApplicant } = await getReferralAccess(id, req.user.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (!access) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const trimmedBody = String(body || '').trim();
    if (!trimmedBody) {
      return res.status(400).json({ message: 'Message body is required' });
    }

    let recipientUser = null;

    if (isOwner) {
      if (!recipientId) {
        return res.status(400).json({ message: 'Recipient is required for poster messages' });
      }

      const applicant = referral.applicants.find((entry) => entry.user?._id?.toString() === recipientId);
      if (!applicant) {
        return res.status(400).json({ message: 'Recipient must be an applicant on this referral' });
      }

      recipientUser = applicant.user;
    } else if (isApplicant) {
      recipientUser = referral.postedBy;
    } else if (currentUser?.type === 'admin') {
      if (!recipientId) {
        return res.status(400).json({ message: 'Recipient is required for admin messages' });
      }

      const posterId = referral.postedBy?._id?.toString() || referral.postedBy?.toString();
      if (recipientId === posterId) {
        recipientUser = referral.postedBy;
      } else {
        const applicant = referral.applicants.find((entry) => entry.user?._id?.toString() === recipientId);
        if (!applicant) {
          return res.status(400).json({ message: 'Recipient must belong to this referral' });
        }
        recipientUser = applicant.user;
      }
    }

    if (!recipientUser?._id && !recipientUser?.toString) {
      return res.status(400).json({ message: 'Unable to resolve recipient' });
    }

    const message = await ReferralMessage.create({
      referralId: id,
      sender: req.user.id,
      recipient: recipientUser._id || recipientUser,
      body: trimmedBody
    });

    const populatedMessage = await ReferralMessage.findById(message._id)
      .populate('sender', 'name email alumnus_bio')
      .populate('recipient', 'name email alumnus_bio');

    const io = req.app.get('io');
    if (io) {
      io.to(`referral:${id}`).emit('referralMessageCreated', {
        referralId: id,
        message: populatedMessage
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (err) {
    next(err);
  }
}

// Get my referrals (posted by me)
async function getMyReferrals(req, res, next) {
  try {
    const referrals = await JobReferral.find({ postedBy: req.user.id })
      .populate('applicants.user', 'name email alumnus_bio')
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReferral,
  getReferrals,
  applyForReferral,
  acceptReferral,
  rejectReferral,
  closeReferral,
  getReferralMessages,
  sendReferralMessage,
  getMyReferrals,
  getReferralById,
  getReferralTimeline
};

