import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Star, 
  Briefcase, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Linkedin,
  Award,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MentorProfile = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    requestMessage: '',
    goals: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingMentorship, setExistingMentorship] = useState(null);

  useEffect(() => {
    fetchMentorProfile();
    if (isLoggedIn) {
      checkExistingMentorship();
    }
  }, [mentorId, isLoggedIn]);

  const fetchMentorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mentorship/mentors/${mentorId}`);
      const data = await response.json();

      if (response.ok) {
        setMentor(data);
      } else {
        toast.error('Failed to fetch mentor profile');
        navigate('/mentorship');
      }
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast.error('Error loading mentor profile');
      navigate('/mentorship');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingMentorship = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/my-mentorships?role=mentee`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        const existing = data.find(m => m.mentor._id === mentorId && ['pending', 'accepted'].includes(m.status));
        setExistingMentorship(existing);
      }
    } catch (error) {
      console.error('Error checking existing mentorship:', error);
    }
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Please login to request mentorship');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/mentorship/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          mentorId,
          ...requestForm
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Mentorship request sent successfully!');
        setShowRequestModal(false);
        checkExistingMentorship();
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast.error('Error sending request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-lg font-medium text-gray-700 ml-2">({rating || 0})</span>
      </div>
    );
  };

  const getRequestButtonState = () => {
    if (!isLoggedIn) return { text: 'Login to Request', disabled: false, action: () => navigate('/login') };
    if (existingMentorship?.status === 'pending') return { text: 'Request Pending', disabled: true };
    if (existingMentorship?.status === 'accepted') return { text: 'Already Mentoring', disabled: true };
    if (mentor?.currentMentees >= mentor?.maxMentees) return { text: 'Mentor Full', disabled: true };
    return { text: 'Request Mentorship', disabled: false, action: () => setShowRequestModal(true) };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mentor not found</h2>
          <Link to="/mentorship" className="text-blue-600 hover:text-blue-800">
            Back to Mentorship
          </Link>
        </div>
      </div>
    );
  }

  const buttonState = getRequestButtonState();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/mentorship')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Mentors
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
              <img
                src={mentor.user?.alumnus_bio?.avatar ? `${API_URL}/${mentor.user.alumnus_bio.avatar}` : '/default-avatar.jpg'}
                alt={mentor.user?.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="flex-1 pt-4 md:pt-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{mentor.user?.name}</h1>
                <p className="text-xl text-gray-600 mb-2">{mentor.currentPosition}</p>
                <p className="text-gray-500">{mentor.currentCompany}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {renderStars(mentor.rating)}
                <p className="text-sm text-gray-500">{mentor.totalReviews} reviews</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>{mentor.yearsOfExperience} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{mentor.currentMentees}/{mentor.maxMentees} mentees</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{mentor.availability?.length || 0} availability slots</span>
              </div>
              {mentor.linkedInUrl && (
                <a
                  href={mentor.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

            <button
              onClick={buttonState.action}
              disabled={buttonState.disabled}
              className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold ${
                buttonState.disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {buttonState.text}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{mentor.bio}</p>
            </div>

            {/* Achievements */}
            {mentor.achievements && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Achievements
                </h2>
                <p className="text-gray-600 leading-relaxed">{mentor.achievements}</p>
              </div>
            )}

            {/* Session Types */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Types Offered</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.sessionTypes?.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize"
                  >
                    {type.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Expertise */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise?.map((exp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Industries</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.industries?.map((ind, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Availability
              </h2>
              {mentor.availability?.length > 0 ? (
                <div className="space-y-2">
                  {mentor.availability.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{slot.day}</span>
                      <span className="text-gray-600 text-sm">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No availability set</p>
              )}
            </div>

            {/* Preferred Mentee Level */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Preferred Mentee</h2>
              <p className="text-gray-600 capitalize">{mentor.preferredMenteeLevel?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Mentorship</h2>
            <p className="text-gray-600 mb-6">
              Send a request to {mentor.user?.name} to become your mentor. 
              Please provide some information about yourself and your goals.
            </p>

            <form onSubmit={handleRequestMentorship} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Introduction Message *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Introduce yourself and explain why you'd like this mentor..."
                  value={requestForm.requestMessage}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, requestMessage: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Goals *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What do you hope to achieve through this mentorship?"
                  value={requestForm.goals}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, goals: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfile;
