import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sessionTypes = [
  { value: 'career_guidance', label: 'Career Guidance', icon: '💼' },
  { value: 'mock_interview', label: 'Mock Interview', icon: '🎯' },
  { value: 'resume_review', label: 'Resume Review', icon: '📄' },
  { value: 'skill_development', label: 'Skill Development', icon: '📚' },
  { value: 'networking', label: 'Networking', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '💡' }
];

const ScheduleSession = () => {
  const { mentorshipId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [mentorship, setMentorship] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    sessionType: 'career_guidance',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    duration: 60,
    isVirtual: true,
    meetingLink: '',
    meetingLocation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchMentorshipDetails();
    fetchSessions();
  }, [isLoggedIn, mentorshipId]);

  const fetchMentorshipDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/mentorships/${mentorshipId}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setMentorship(data);
      } else {
        toast.error('Failed to fetch mentorship details');
        navigate('/mentorship/my');
      }
    } catch (error) {
      console.error('Error fetching mentorship:', error);
      toast.error('Error loading mentorship');
      navigate('/mentorship/my');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/mentorship/mentorships/${mentorshipId}/sessions`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (response.ok) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/mentorship/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          mentorshipId,
          ...scheduleForm
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Session scheduled successfully!');
        setShowScheduleModal(false);
        fetchSessions();
        resetForm();
      } else {
        toast.error(data.error || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Error scheduling session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = async (sessionId, reason) => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Session cancelled successfully');
        fetchSessions();
      } else {
        toast.error('Failed to cancel session');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Error cancelling session');
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/sessions/${sessionId}/complete`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Session marked as completed');
        fetchSessions();
      } else {
        toast.error('Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Error completing session');
    }
  };

  const resetForm = () => {
    setScheduleForm({
      title: '',
      description: '',
      sessionType: 'career_guidance',
      scheduledDate: '',
      startTime: '',
      endTime: '',
      duration: 60,
      isVirtual: true,
      meetingLink: '',
      meetingLocation: ''
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const getSessionTypeLabel = (type) => {
    return sessionTypes.find(t => t.value === type)?.label || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (session) => {
    const sessionDate = new Date(session.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate >= today && ['scheduled', 'rescheduled'].includes(session.status);
  };

  const getOtherPerson = () => {
    if (!mentorship || !user) return null;
    return mentorship.mentor._id === user.id ? mentorship.mentee : mentorship.mentor;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const otherPerson = getOtherPerson();
  const upcomingSessions = sessions.filter(isUpcoming);
  const pastSessions = sessions.filter(s => !isUpcoming(s));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mentorship/my')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Mentorship
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h1>
              <p className="text-gray-600">
                Manage your sessions with {otherPerson?.name}
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Schedule Session
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-500">{getSessionTypeLabel(session.sessionType)}</p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                    {session.isVirtual ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Video className="w-4 h-4" />
                        <span>Virtual</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{session.meetingLocation || 'In Person'}</span>
                      </div>
                    )}
                  </div>

                  {session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 mb-4"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </a>
                  )}

                  {session.description && (
                    <p className="text-gray-600 text-sm mb-4">{session.description}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCompleteSession(session._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for cancellation:');
                        if (reason) handleCancelSession(session._id, reason);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Past Sessions
            </h2>
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div key={session._id} className="bg-white rounded-lg shadow p-6 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-500">{getSessionTypeLabel(session.sessionType)}</p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {session.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Session</h2>
              
              <form onSubmit={handleScheduleSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Career Planning Discussion"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={scheduleForm.sessionType}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, sessionType: e.target.value }))}
                  >
                    {sessionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="What would you like to discuss?"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={scheduleForm.isVirtual}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, isVirtual: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Virtual Session</span>
                  </label>
                </div>

                {scheduleForm.isVirtual ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://zoom.us/j/..."
                      value={scheduleForm.meetingLink}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Location
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., Conference Room A, Coffee Shop"
                      value={scheduleForm.meetingLocation}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, meetingLocation: e.target.value }))}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Scheduling...' : 'Schedule Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSession;
