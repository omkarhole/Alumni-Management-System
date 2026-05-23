import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaRegBell, FaRegBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiClient from '../api/client';

const defaultPreferences = {
  enabled: false,
  deadlineApproaching: false,
  statusChanges: false,
  betterRecommendations: false,
  deadlineWindowDays: 3
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      const [notificationsResponse, preferencesResponse] = await Promise.all([
        apiClient.get('/notifications', { params: { limit: 50 } }),
        apiClient.get('/notifications/preferences')
      ]);

      setNotifications(notificationsResponse.data?.notifications || []);
      setUnreadCount(notificationsResponse.data?.unreadCount || 0);
      setPreferences({
        ...defaultPreferences,
        ...(preferencesResponse.data || {})
      });
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const persistPreferences = async (nextPreferences) => {
    setSavingPreferences(true);
    try {
      const response = await apiClient.patch('/notifications/preferences', nextPreferences);
      setPreferences({
        ...defaultPreferences,
        ...(response.data?.preferences || nextPreferences)
      });
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update notification preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    const nextPreferences = {
      ...preferences,
      [field]: value
    };

    setPreferences(nextPreferences);
    persistPreferences(nextPreferences);
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications((currentNotifications) => currentNotifications.map((notification) => (
        notification._id === notificationId || notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const openNotification = async (notification) => {
    await markAsRead(notification._id || notification.id);

    if (notification.entityType === 'referral' && notification.entityId) {
      navigate(`/referrals/${notification.entityId}`);
      return;
    }

    if (notification.entityType === 'career') {
      navigate('/jobs');
      return;
    }

    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center mb-4">
        <div className="col-lg-10">
          <div className="card border-0 shadow-lg overflow-hidden">
            <div className="card-body p-4 p-md-5 bg-gradient-primary text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%)' }}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <div>
                  <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-2 rounded-pill mb-3">
                    <FaBell /> Smart notifications
                  </div>
                  <h1 className="display-6 fw-bold mb-2">Notification Center</h1>
                  <p className="mb-0 text-white-75">Saved opportunities, deadline reminders, status changes, and stronger matches land here.</p>
                </div>
                <div className="text-md-end">
                  <div className="fs-3 fw-bold">{unreadCount}</div>
                  <div className="text-white-75">Unread notifications</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0">Notification Preferences</h2>
                <FaRegBell className="text-primary" />
              </div>
              <p className="text-muted small mb-4">Defaults stay off until you turn them on.</p>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={(event) => handlePreferenceChange('enabled', event.target.checked)}
                  disabled={savingPreferences}
                  id="notifications-enabled"
                />
                <label className="form-check-label" htmlFor="notifications-enabled">
                  Enable smart notifications
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={preferences.deadlineApproaching}
                  onChange={(event) => handlePreferenceChange('deadlineApproaching', event.target.checked)}
                  disabled={savingPreferences}
                  id="deadline-approaching"
                />
                <label className="form-check-label" htmlFor="deadline-approaching">
                  Deadline approaching alerts
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={preferences.statusChanges}
                  onChange={(event) => handlePreferenceChange('statusChanges', event.target.checked)}
                  disabled={savingPreferences}
                  id="status-changes"
                />
                <label className="form-check-label" htmlFor="status-changes">
                  Status change alerts
                </label>
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={preferences.betterRecommendations}
                  onChange={(event) => handlePreferenceChange('betterRecommendations', event.target.checked)}
                  disabled={savingPreferences}
                  id="better-recommendations"
                />
                <label className="form-check-label" htmlFor="better-recommendations">
                  Better recommendation alerts
                </label>
              </div>

              <label className="form-label small text-muted" htmlFor="deadline-window-days">
                Deadline window in days
              </label>
              <input
                id="deadline-window-days"
                type="number"
                min="1"
                max="30"
                className="form-control"
                value={preferences.deadlineWindowDays}
                onChange={(event) => handlePreferenceChange('deadlineWindowDays', Number(event.target.value))}
                disabled={savingPreferences}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
                <div>
                  <h2 className="h5 mb-1">Recent notifications</h2>
                  <p className="text-muted small mb-0">Tap an item to mark it read and jump to the related opportunity.</p>
                </div>
                <span className="badge bg-light text-dark border">{notifications.length} total</span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaRegBookmark className="fs-1 mb-3" />
                  <p className="mb-0">No notifications yet. Save a few opportunities to start receiving smart updates.</p>
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {notifications.map((notification) => (
                    <button
                      key={notification._id || notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`text-start border rounded-4 p-4 bg-white w-100 ${notification.isRead ? 'opacity-75' : 'shadow-sm border-primary'}`}
                      style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className={`badge ${notification.isRead ? 'bg-secondary' : 'bg-primary'}`}>
                              {notification.type}
                            </span>
                            {!notification.isRead && <span className="badge bg-warning text-dark">Unread</span>}
                          </div>
                          <h3 className="h6 mb-2">{notification.title}</h3>
                          <p className="mb-0 text-muted">{notification.message}</p>
                        </div>
                        {!notification.isRead && <FaCheck className="text-primary mt-1 flex-shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;