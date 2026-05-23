const { Career, JobReferral, User, JobPreference, JobSubscription, SavedItem, Notification, NotificationPreference } = require('../models/Index');
const logger = require('../utils/logger');

let scanTimer = null;

function normalizeEntityType(entityType = '') {
  const normalized = String(entityType).trim().toLowerCase();

  if (['career', 'job', 'jobs'].includes(normalized)) {
    return 'career';
  }

  if (['referral', 'referrals'].includes(normalized)) {
    return 'referral';
  }

  return null;
}

function normalizeStatus(status, fallback = '') {
  return String(status || fallback || '').trim().toLowerCase();
}

function calculateCareerMatchScore(preferences = {}, career = {}) {
  const userSkills = preferences?.preferredSkills || [];
  const preferredJobTypes = preferences?.preferredJobTypes || [];
  const preferredLocations = preferences?.preferredLocations || [];
  const preferredExperienceLevels = preferences?.preferredExperienceLevels || [];

  let skillsScore = 0;
  const matchedSkills = [];

  if (userSkills.length > 0 && career.skills && career.skills.length > 0) {
    const normalizedUserSkills = userSkills.map((skill) => skill.toLowerCase().trim());
    const normalizedCareerSkills = career.skills.map((skill) => skill.toLowerCase().trim());

    normalizedCareerSkills.forEach((careerSkill) => {
      if (normalizedUserSkills.some((userSkill) => userSkill.includes(careerSkill) || careerSkill.includes(userSkill))) {
        matchedSkills.push(careerSkill);
      }
    });

    const matchedCount = matchedSkills.length;
    skillsScore = normalizedCareerSkills.length > 0
      ? Math.round((matchedCount / normalizedCareerSkills.length) * 100)
      : 0;
  }

  let jobTypeScore = 0;
  if (preferredJobTypes.length > 0 && career.job_type) {
    jobTypeScore = preferredJobTypes.includes(career.job_type) ? 100 : 0;
  }

  let locationScore = 0;
  if (preferredLocations.length > 0 && career.location) {
    const careerLocation = career.location.toLowerCase();
    const locationMatch = preferredLocations.some((preferredLocation) => (
      careerLocation.includes(preferredLocation.toLowerCase()) || preferredLocation.toLowerCase().includes(careerLocation)
    ));
    locationScore = locationMatch ? 100 : 0;
  }

  let experienceScore = 0;
  if (preferredExperienceLevels.length > 0 && career.experience_level) {
    experienceScore = preferredExperienceLevels.includes(career.experience_level) ? 100 : 0;
  }

  const totalScore = Math.round(
    (skillsScore * 0.5)
    + (jobTypeScore * 0.2)
    + (locationScore * 0.2)
    + (experienceScore * 0.1)
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

async function resolveUserPreferences(userId) {
  const user = await User.findById(userId);
  const userSkills = user?.alumnus_bio?.skills || [];

  let preferences = await JobPreference.findOne({ user: userId });
  if (preferences) {
    return {
      user,
      userSkills,
      preferences: preferences.toObject ? preferences.toObject() : preferences
    };
  }

  const subscription = await JobSubscription.findOne({ user: userId, isActive: true });
  if (subscription) {
    return {
      user,
      userSkills,
      preferences: {
        preferredSkills: subscription.preferredSkills || userSkills,
        preferredJobTypes: subscription.preferredJobTypes || ['full-time', 'part-time'],
        preferredLocations: subscription.preferredLocations || [],
        preferredExperienceLevels: subscription.preferredExperienceLevels || ['entry', 'mid', 'senior']
      }
    };
  }

  return {
    user,
    userSkills,
    preferences: {
      preferredSkills: userSkills,
      preferredJobTypes: ['full-time', 'part-time'],
      preferredLocations: [],
      preferredExperienceLevels: ['entry', 'mid', 'senior']
    }
  };
}

async function buildSavedItemSnapshot(entityType, entity, preferences = {}) {
  if (entityType === 'career') {
    const matchScore = calculateCareerMatchScore(preferences, entity).totalScore;

    return {
      title: entity.job_title,
      company: entity.company,
      location: entity.location,
      status: normalizeStatus(entity.status, 'open'),
      deadline: entity.deadline || null,
      matchScore,
      jobType: entity.job_type || '',
      description: entity.description || ''
    };
  }

  return {
    title: entity.jobTitle,
    company: entity.company,
    location: '',
    status: normalizeStatus(entity.status, 'open'),
    deadline: entity.deadline || null,
    matchScore: null,
    description: entity.description || ''
  };
}

function isDeadlineApproaching(deadline, windowDays = 3) {
  if (!deadline) {
    return false;
  }

  const targetDate = new Date(deadline);
  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  const now = new Date();
  if (targetDate <= now) {
    return false;
  }

  const windowMs = Math.max(1, Number(windowDays) || 3) * 24 * 60 * 60 * 1000;
  return (targetDate.getTime() - now.getTime()) <= windowMs;
}

async function createNotificationIfMissing(payload) {
  const existing = await Notification.findOne({ dedupeKey: payload.dedupeKey });
  if (existing) {
    return existing;
  }

  return Notification.create(payload);
}

async function scanOpportunityNotifications() {
  const preferencesList = await NotificationPreference.find({ enabled: true });
  let createdCount = 0;

  for (const preference of preferencesList) {
    const savedItems = await SavedItem.find({ user: preference.user });
    if (!savedItems.length) {
      continue;
    }

    const { preferences } = await resolveUserPreferences(preference.user);

    let topRecommendation = null;
    if (preference.betterRecommendations) {
      const openCareers = await Career.find({ status: 'open' }).sort({ createdAt: -1 }).limit(150);
      const scoredCareers = openCareers
        .map((career) => ({
          career,
          score: calculateCareerMatchScore(preferences, career).totalScore
        }))
        .sort((left, right) => right.score - left.score);

      topRecommendation = scoredCareers[0] || null;
    }

    for (const savedItem of savedItems) {
      const entity = savedItem.entityType === 'career'
        ? await Career.findById(savedItem.entityId)
        : await JobReferral.findById(savedItem.entityId);

      if (!entity) {
        continue;
      }

      const currentStatus = normalizeStatus(entity.status, savedItem.lastKnownStatus || 'open');
      const currentDeadline = entity.deadline ? new Date(entity.deadline) : null;

      if (preference.statusChanges && savedItem.lastKnownStatus && currentStatus !== savedItem.lastKnownStatus) {
        const dedupeKey = `status:${preference.user}:${savedItem._id}:${currentStatus}`;
        const notification = await createNotificationIfMissing({
          user: preference.user,
          type: 'status-change',
          title: 'Saved opportunity status changed',
          message: `${entity.job_title || entity.jobTitle || 'A saved opportunity'} changed from ${savedItem.lastKnownStatus} to ${currentStatus}.`,
          entityType: savedItem.entityType,
          entityId: savedItem.entityId,
          metadata: {
            previousStatus: savedItem.lastKnownStatus,
            currentStatus
          },
          dedupeKey
        });

        if (notification) {
          createdCount += 1;
        }

        savedItem.lastKnownStatus = currentStatus;
      }

      if (
        preference.deadlineApproaching
        && currentDeadline
        && isDeadlineApproaching(currentDeadline, preference.deadlineWindowDays)
      ) {
        const lastNotifiedFor = savedItem.lastDeadlineReminderFor ? new Date(savedItem.lastDeadlineReminderFor) : null;
        const alreadyNotified = lastNotifiedFor && !Number.isNaN(lastNotifiedFor.getTime())
          && lastNotifiedFor.getTime() === currentDeadline.getTime();

        if (!alreadyNotified) {
          const dedupeKey = `deadline:${preference.user}:${savedItem._id}:${currentDeadline.toISOString()}`;
          const notification = await createNotificationIfMissing({
            user: preference.user,
            type: 'deadline',
            title: 'Deadline approaching',
            message: `${entity.job_title || entity.jobTitle || 'A saved opportunity'} at ${entity.company || 'Unknown company'} closes on ${currentDeadline.toLocaleDateString()}.`,
            entityType: savedItem.entityType,
            entityId: savedItem.entityId,
            metadata: {
              deadline: currentDeadline,
              windowDays: preference.deadlineWindowDays
            },
            dedupeKey
          });

          if (notification) {
            createdCount += 1;
          }

          savedItem.lastDeadlineReminderFor = currentDeadline;
        }
      }

      if (preference.betterRecommendations && savedItem.entityType === 'career' && topRecommendation?.career) {
        const savedScore = Number(savedItem.savedScore || savedItem.entitySnapshot?.matchScore || 0);
        const topScore = Number(topRecommendation.score || 0);
        const topCareerId = topRecommendation.career._id.toString();

        if (topScore > savedScore + 10 && topCareerId !== savedItem.entityId.toString()) {
          const dedupeKey = `recommendation:${preference.user}:${savedItem._id}:${topCareerId}:${topScore}`;
          const notification = await createNotificationIfMissing({
            user: preference.user,
            type: 'better-recommendation',
            title: 'A better match appeared',
            message: `${topRecommendation.career.job_title} at ${topRecommendation.career.company} is a ${topScore}% match, which is stronger than your saved job.`,
            entityType: 'career',
            entityId: topRecommendation.career._id,
            metadata: {
              savedItemId: savedItem._id,
              savedScore,
              topScore
            },
            dedupeKey
          });

          if (notification) {
            createdCount += 1;
          }

          savedItem.lastRecommendationEntityId = topRecommendation.career._id;
          savedItem.lastRecommendationScore = topScore;
        }
      }

      if (savedItem.isModified()) {
        await savedItem.save();
      }
    }
  }

  return {
    usersScanned: preferencesList.length,
    createdCount
  };
}

function startOpportunityNotificationScanner() {
  if (scanTimer) {
    return scanTimer;
  }

  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const intervalMs = Number(process.env.OPPORTUNITY_NOTIFICATION_SCAN_MS || 5 * 60 * 1000);

  const runScan = () => {
    scanOpportunityNotifications().catch((error) => {
      logger.logError(error, {
        operation: 'scan-opportunity-notifications'
      });
    });
  };

  runScan();
  scanTimer = setInterval(runScan, intervalMs);

  if (typeof scanTimer.unref === 'function') {
    scanTimer.unref();
  }

  return scanTimer;
}

module.exports = {
  normalizeEntityType,
  normalizeStatus,
  calculateCareerMatchScore,
  resolveUserPreferences,
  buildSavedItemSnapshot,
  scanOpportunityNotifications,
  startOpportunityNotificationScanner
};