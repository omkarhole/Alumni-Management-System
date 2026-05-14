import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';

const PollCreateForm = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { pollId } = useParams();

  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    category: 'General',
    visibility: 'Public',
    anonymous: true,
    allowMultipleVotes: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Feedback', 'Event', 'Decision', 'Interest', 'General'];
  const visibilityOptions = ['Public', 'Alumni Only', 'Admin Only'];

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }

    if (pollId) {
      fetchPoll();
    }
  }, [isLoggedIn, pollId]);

  const fetchPoll = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/polls/${pollId}`);
      const poll = response.data.poll;
      setFormData({
        question: poll.question,
        description: poll.description,
        options: poll.options.map(opt => opt.text),
        category: poll.category,
        visibility: poll.visibility,
        anonymous: poll.anonymous,
        allowMultipleVotes: poll.allowMultipleVotes,
        expiresAt: new Date(poll.expiresAt).toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Failed to load poll');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!formData.question.trim()) {
        setError('Question is required');
        setLoading(false);
        return;
      }

      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options are required');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        question: formData.question,
        description: formData.description,
        options: validOptions,
        category: formData.category,
        visibility: formData.visibility,
        anonymous: formData.anonymous,
        allowMultipleVotes: formData.allowMultipleVotes,
        expiresAt: new Date(formData.expiresAt).toISOString()
      };

      if (pollId) {
        // Update existing poll
        await axios.put(
          `${baseUrl}/api/v1/polls/${pollId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(true);
        setTimeout(() => navigate('/polls'), 2000);
      } else {
        // Create new poll
        const response = await axios.post(
          `${baseUrl}/api/v1/polls`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(true);
        setTimeout(() => navigate('/polls'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {pollId ? 'Edit Poll' : 'Create New Poll'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✓ Poll {pollId ? 'updated' : 'created'} successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Poll Question *
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="What would you like to ask?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide additional context for the poll..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Poll Options * (minimum 2)
              </label>
              <div className="space-y-2 mb-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus /> Add Option
              </button>
            </div>

            {/* Category and Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                >
                  {visibilityOptions.map(vis => (
                    <option key={vis} value={vis}>{vis}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Anonymous voting - Hide voter identities
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowMultipleVotes"
                  checked={formData.allowMultipleVotes}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Allow multiple votes per user
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : (pollId ? 'Update Poll' : 'Create Poll')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/polls')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PollCreateForm;
