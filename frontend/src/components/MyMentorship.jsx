import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Star, 
  ChevronRight, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  MoreVertical,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyMentorship = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('asMentee');
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: 'accepted',
    responseMessage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchMentorships();
    fetchUpcomingSessions();
  }, [isLoggedIn, activeTab]);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const role = activeTab === 'asMentor' ? 'mentor' : 'mentee';
      const response = await fetch(`${API_URL}/api/mentorship/my-mentorships?role=${role}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setMentorships(data);
      } else {
        toast.error('Failed to fetch mentorships');
      }
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast.error('Error loading mentorships');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/my-sessions`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setUpcomingSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleRespondToRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/mentorship/respond-request`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          matchId: selectedMentorship._id,
          ...responseForm
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Request ${responseForm.status} successfully!`);
        setShowResponseModal(false);
        setSelectedMentorship(null);
        fetchMentorships();
      } else {
        toast.error(data.error || 'Failed to respond to request');
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Error processing response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndMentorship = async (mentorshipId) => {
    if (!confirm('Are you sure you want to end this mentorship?')) return;

    try {
      const response = await fetch(`${API_URL}/api/mentorship/mentorships/${mentorshipId}/end`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Mentorship ended successfully');
        fetchMentorships();
      } else {
        toast.error('Failed to end mentorship');
      }
    } catch (error) {
      console.error('Error ending mentorship:', error);
      toast.error('Error ending mentorship');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const openResponseModal = (mentorship) => {
    setSelectedMentorship(mentorship);
    setResponseForm({ status: 'accepted', responseMessage: '' });
    setShowResponseModal(true);
  };

  const renderMentorshipCard = (mentorship) => {
    const isMentor = activeTab === 'asMentor';
    const otherPerson = isMentor ? mentorship.mentee : mentorship.mentor;

    return (
      <div key={mentorship._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={otherPerson?.alumnus_bio?.avatar ? `${API_URL}/${otherPerson.alumnus_bio.avatar}` : '/default-avatar.jpg'}
                alt={otherPerson?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{otherPerson?.name}</h3>
                <p className="text-sm text-gray-500">{isMentor ? 'Mentee' : 'Mentor'}</p>
              </div>
            </div>
            {getStatusBadge(mentorship.status)}
          </div>

          {mentorship.goals && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-medium">Goals:</span> {mentorship.goals}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{mentorship.totalSessions} sessions</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>{mentorship.completedSessions} completed</span>
            </div>
          </div>

          <div className="flex gap-2">
            {mentorship.status === 'pending' && isMentor && (
              <button
                onClick={() => openResponseModal(mentorship)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Respond
              </button>
            )}

            {mentorship.status === 'accepted' && (
              <>
                <Link
                  to={`/mentorship/chat/${mentorship._id}`}
                  className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Link>
                <Link
                  to={`/mentorship/sessions/${mentorship._id}`}
                  className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Sessions
                </Link>
                <button
                  onClick={() => handleEndMentorship(mentorship._id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                >
                  End
                </button>
              </>
            )}

            {mentorship.status === 'completed' && !isMentor && !mentorship.menteeFeedback?.submittedAt && (
              <Link
                to={`/mentorship/feedback/${mentorship._id}`}
                className="flex-1 text-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-sm font-medium"
              >
                Leave Feedback
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentorship</h1>
          <p className="text-gray-600">
            Manage your mentorships, sessions, and connections.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('asMentee')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'asMentee'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              As Mentee
            </button>
            {user?.type === 'alumnus' && (
              <button
                onClick={() => setActiveTab('asMentor')}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === 'asMentor'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                As Mentor
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {mentorships.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No mentorships found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {activeTab === 'asMentee'
                        ? "You haven't requested any mentorships yet."
                        : "You don't have any mentees yet."}
                    </p>
                    {activeTab === 'asMentee' ? (
                      <Link
                        to="/mentorship"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Find a Mentor
                      </Link>
                    ) : (
                      <Link
                        to="/mentorship/become-mentor"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Become a Mentor
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mentorships.map(renderMentorshipCard)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Sessions
              </h2>
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div key={session._id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.scheduledDate).toLocaleDateString()} at {session.startTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {upcomingSessions.length > 0 && (
                <Link
                  to="/mentorship/sessions"
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View all sessions
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/mentorship"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Browse Mentors</span>
                </Link>
                {user?.type === 'alumnus' && (
                  <Link
                    to="/mentorship/become-mentor"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">Become a Mentor</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedMentorship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Respond to Request</h2>
            <p className="text-gray-600 mb-6">
              {selectedMentorship.mentee?.name} has requested mentorship from you.
            </p>

            <form onSubmit={handleRespondToRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="accepted"
                      checked={responseForm.status === 'accepted'}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="rejected"
                      checked={responseForm.status === 'rejected'}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="flex items-center gap-1 text-red-700">
                      <XCircle className="w-4 h-4" />
                      Decline
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a message to your response..."
                  value={responseForm.responseMessage}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, responseMessage: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMentorship;
