import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaChartBar} from 'react-icons/fa';
import { baseUrl } from '../utils/globalurl';

const PollResults = ({ poll, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [poll._id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/polls/${poll._id}/results`);
      setResults(response.data.stats);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <FaChartBar /> Poll Results
            </h2>
            <p className="text-green-100 text-sm">{poll.question}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <FaX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Votes</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {results?.totalVotes || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className={`text-xl font-bold ${
                results?.status === 'Closed'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {results?.status}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expires</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {new Date(results?.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Poll Description */}
          {poll.description && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{poll.description}</p>
            </div>
          )}

          {/* Results Visualization */}
          <div className="space-y-6">
            {results?.options && results.options.map((option, index) => (
              <div key={option._id || index}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {option.text}
                  </h3>
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {option.percentage}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${option.percentage}%` }}
                  >
                    {option.percentage > 10 && (
                      <span className="text-white font-semibold text-sm">
                        {option.percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual indicator for zero votes */}
                {option.votes === 0 && (
                  <div className="text-xs text-gray-400 mt-1">No votes yet</div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {(!results?.options || results.options.length === 0) && (
            <div className="text-center py-8">
              <FaChartBar className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No votes yet</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Created by:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{poll.createdBy?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Created on:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(poll.createdAt).toLocaleDateString()}
              </span>
            </div>
            {poll.anonymous && (
              <div className="flex justify-between">
                <span>Voting Method:</span>
                <span className="font-semibold text-gray-900 dark:text-white">Anonymous</span>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollResults;
