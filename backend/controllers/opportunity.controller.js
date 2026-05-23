const {
  Career,
  JobReferral,
  SavedItem,
  Notification,
  NotificationPreference
} = require('../models/Index');
const {
  normalizeEntityType,
  buildSavedItemSnapshot,
  resolveUserPreferences
} = require('../services/opportunityNotificationService');

async function getSavedItems(req, res, next) {
  try {
    const savedItems = await SavedItem.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ savedItems });
  } catch (error) {
    next(error);
  }
}

async function toggleSavedItem(req, res, next) {
  try {
    const entityType = normalizeEntityType(req.body.entityType);
    const entityId = req.body.entityId;

    if (!entityType || !entityId) {
      return res.status(400).json({ message: 'entityType and entityId are required' });
    }

    const entity = entityType === 'career'
      ? await Career.findById(entityId)
      : await JobReferral.findById(entityId);

    if (!entity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const existing = await SavedItem.findOne({
      user: req.user.id,
      entityType,
      entityId
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false, message: 'Opportunity removed from saved items' });
    }

    const { preferences } = await resolveUserPreferences(req.user.id);
    const entitySnapshot = await buildSavedItemSnapshot(entityType, entity, preferences);

    const savedItem = await SavedItem.create({
      user: req.user.id,
      entityType,
      entityId,
      entitySnapshot,
      savedScore: entitySnapshot.matchScore || null,
      lastKnownStatus: entitySnapshot.status || '',
      lastKnownDeadlineAt: entitySnapshot.deadline || null
    });

    res.status(201).json({
      saved: true,
      message: 'Opportunity saved successfully',
      savedItem
    });
  } catch (error) {
    next(error);
  }
}

async function getNotifications(req, res, next) {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 20, 100));
    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';

    const query = { user: req.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit),
      Notification.countDocuments({ user: req.user.id, isRead: false })
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = notification.readAt || new Date();
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
}

async function getNotificationPreferences(req, res, next) {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.user.id });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id
      });
    }

    res.json(preferences);
  } catch (error) {
    next(error);
  }
}

async function updateNotificationPreferences(req, res, next) {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.user.id });

    if (!preferences) {
      preferences = new NotificationPreference({ user: req.user.id });
    }

    const { enabled, deadlineApproaching, statusChanges, betterRecommendations, deadlineWindowDays } = req.body;

    if (enabled !== undefined) {
      preferences.enabled = Boolean(enabled);
    }
    if (deadlineApproaching !== undefined) {
      preferences.deadlineApproaching = Boolean(deadlineApproaching);
    }
    if (statusChanges !== undefined) {
      preferences.statusChanges = Boolean(statusChanges);
    }
    if (betterRecommendations !== undefined) {
      preferences.betterRecommendations = Boolean(betterRecommendations);
    }
    if (deadlineWindowDays !== undefined) {
      const parsedWindow = Number(deadlineWindowDays);
      if (!Number.isNaN(parsedWindow) && parsedWindow >= 1 && parsedWindow <= 30) {
        preferences.deadlineWindowDays = parsedWindow;
      }
    }

    await preferences.save();

    res.json({
      message: 'Notification preferences updated',
      preferences
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSavedItems,
  toggleSavedItem,
  getNotifications,
  markNotificationRead,
  getNotificationPreferences,
  updateNotificationPreferences
};