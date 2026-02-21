import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Star, 
  Briefcase, 
  Award, 
  Clock, 
  Users, 
  CheckCircle,
  Plus,
  Trash2,
  Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const expertiseOptions = [
  'Software Development', 'Data Science', 'Machine Learning', 'Product Management',
  'Project Management', 'UX/UI Design', 'Marketing', 'Sales', 'Finance',
  'Consulting', 'Entrepreneurship', 'Leadership', 'Career Development',
  'Interview Preparation', 'Resume Building', 'Networking', 'Public Speaking',
  'Business Strategy', 'Operations', 'Human Resources', 'Other'
];

const industryOptions = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Consulting',
  'Manufacturing', 'Retail', 'Media', 'Government', 'Non-profit',
  'Startups', 'E-commerce', 'Real Estate', 'Energy', 'Transportation',
  'Agriculture', 'Entertainment', 'Legal', 'Research', 'Other'
];

const sessionTypeOptions = [
  { value: 'career_guidance', label: 'Career Guidance' },
  { value: 'mock_interview', label: 'Mock Interview' },
  { value: 'resume_review', label: 'Resume Review' },
  { value: 'skill_development', label: 'Skill Development' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' }
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BecomeMentor = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    expertise: [],
    industries: [],
    yearsOfExperience: '',
    currentPosition: '',
    currentCompany: '',
    maxMentees: 3,
    preferredMenteeLevel: 'both',
    sessionTypes: ['career_guidance'],
    linkedInUrl: '',
    achievements: '',
    availability: [],
    isActive: true
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (user?.type !== 'alumnus') {
      toast.error('Only alumni can become mentors');
      navigate('/mentorship');
      return;
    }

    fetchExistingProfile();
  }, [isLoggedIn, user]);

  const fetchExistingProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/my-profile`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setExistingProfile(data);
        setFormData({
          bio: data.bio || '',
          expertise: data.expertise || [],
          industries: data.industries || [],
          yearsOfExperience: data.yearsOfExperience || '',
          currentPosition: data.currentPosition || '',
          currentCompany: data.currentCompany || '',
          maxMentees: data.maxMentees || 3,
          preferredMenteeLevel: data.preferredMenteeLevel || 'both',
          sessionTypes: data.sessionTypes || ['career_guidance'],
          linkedInUrl: data.linkedInUrl || '',
          achievements: data.achievements || '',
          availability: data.availability || [],
          isActive: data.isActive !== false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.expertise.length === 0) {
      toast.error('Please select at least one area of expertise');
      return;
    }

    if (formData.bio.length < 50) {
      toast.error('Please provide a more detailed bio (at least 50 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/mentorship/mentor-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(existingProfile ? 'Profile updated successfully!' : 'You are now a mentor!');
        navigate('/mentorship/my');
      } else {
        toast.error(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const addAvailabilitySlot = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const removeAvailabilitySlot = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const updateAvailabilitySlot = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleProfileStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/mentor-profile/toggle-status`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, isActive: data.isActive }));
        toast.success(`Profile ${data.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mentorship')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Mentorship
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {existingProfile ? 'Edit Mentor Profile' : 'Become a Mentor'}
              </h1>
              <p className="text-gray-600">
                {existingProfile 
                  ? 'Update your mentor profile and availability.'
                  : 'Share your experience and help guide the next generation of professionals.'}
              </p>
            </div>
            {existingProfile && (
              <button
                onClick={toggleProfileStatus}
                className={`px-4 py-2 rounded-lg font-medium ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formData.isActive ? 'Active' : 'Inactive'}
              </button>
            )}
          </div>
        </div>

        {/* Benefits Section (for new mentors) */}
        {!existingProfile && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <h2 className="text-xl font-semibold mb-4">Why Become a Mentor?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Give Back</h3>
                  <p className="text-sm text-blue-100">Help students and fellow alumni navigate their career paths.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Expand Network</h3>
                  <p className="text-sm text-blue-100">Connect with talented individuals and build relationships.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Recognition</h3>
                  <p className="text-sm text-blue-100">Get recognized as a thought leader in your field.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Position *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.currentPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPosition: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Company *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Google"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedInUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedInUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio * (Tell us about yourself and your professional journey)
              </label>
              <textarea
                required
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Share your background, expertise, and what you can offer as a mentor..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.bio.length} characters</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Achievements
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Highlight your major accomplishments, awards, or notable projects..."
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              />
            </div>
          </div>

          {/* Expertise & Industries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Expertise & Industries
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Expertise * (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map((expertise) => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => handleMultiSelect('expertise', expertise)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.expertise.includes(expertise)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industries (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleMultiSelect('industries', industry)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.industries.includes(industry)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mentorship Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Mentorship Preferences
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Mentees
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.maxMentees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMentees: Number(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} mentees</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Mentee Level
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.preferredMenteeLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredMenteeLevel: e.target.value }))}
                >
                  <option value="student">Students only</option>
                  <option value="alumnus">Alumni only</option>
                  <option value="both">Both students and alumni</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Types Offered
              </label>
              <div className="flex flex-wrap gap-2">
                {sessionTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleMultiSelect('sessionTypes', type.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.sessionTypes.includes(type.value)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Availability
            </h2>
            
            <div className="space-y-3">
              {formData.availability.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    className="border border-gray-300 rounded px-3 py-1"
                    value={slot.day}
                    onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="border border-gray-300 rounded px-3 py-1"
                    value={slot.startTime}
                    onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    className="border border-gray-300 rounded px-3 py-1"
                    value={slot.endTime}
                    onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeAvailabilitySlot(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAvailabilitySlot}
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Add Time Slot
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/mentorship')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Become a Mentor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeMentor;
