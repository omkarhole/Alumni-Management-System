import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaChartBar, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';
import PollResults from './PollResults';

const PollVote = ({ poll, onClose }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [pollData, setPollData] = useState(poll);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchPollData();
  }, [poll._id]);

  const fetchPollData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/polls/${poll._id}`);
      setPollData(response.data.poll);
      setUserVote(response.data.userVote);
    } catch (error) {
      console.error('Error fetching poll data:', error);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      await axios.post(
        `${baseUrl}/api/v1/polls/${pollData._id}/vote`,
        { optionId: selectedOption },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setUserVote(selectedOption);
      await fetchPollData();
      
      // Show results after successful vote
      setTimeout(() => setShowResults(true), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  if (showResults) {
    return <PollResults poll={pollData} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {pollData.question}
            </h2>
            {pollData.description && (
              <p className="text-blue-100">{pollData.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✓ Your vote has been recorded!
            </div>
          )}

          {/* Poll Status */}
          {pollData.status === 'Closed' && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              This poll has been closed. You can view the results below.
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-6">
            {pollData.options && pollData.options.map(option => (
              <label
                key={option._id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOption === option._id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'
                }`}
              >
                <input
                  type={pollData.allowMultipleVotes ? 'checkbox' : 'radio'}
                  name="poll-option"
                  value={option._id}
                  checked={selectedOption === option._id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={pollData.status === 'Closed'}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 dark:text-white font-medium">
                  {option.text}
                </span>
                <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                  {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                </span>
              </label>
            ))}
          </div>

          {/* Poll Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <div className="flex justify-between">
              <span>Total Responses:</span>
              <span className="font-semibold">{pollData.totalVotes}</span>
            </div>
            <div className="flex justify-between">
              <span>Poll Type:</span>
              <span className="font-semibold">{pollData.category}</span>
            </div>
            {pollData.anonymous && (
              <div className="flex justify-between">
                <span>Voting:</span>
                <span className="font-semibold">Anonymous</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Expires:</span>
              <span className="font-semibold">
                {new Date(pollData.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {pollData.status !== 'Closed' && !success && (
              <button
                onClick={handleVote}
                disabled={loading || !selectedOption}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </button>
            )}
            <button
              onClick={() => setShowResults(true)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              <FaChartBar /> View Results
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              Close
            </button>
          </div>

          {/* User Already Voted Notice */}
          {userVote && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100 rounded-lg text-sm">
              You have already voted on this poll. You can view the current results by clicking "View Results".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollVote;
