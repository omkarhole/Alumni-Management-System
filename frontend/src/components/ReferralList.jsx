import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';

const ReferralList = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, page]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { status: statusFilter, page, limit };
      if (search) params.search = search;
      
      const response = await apiClient.get('/api/referrals', { params });
      setReferrals(response.data.referrals || []);
    } catch (err) {
      setError('Failed to load referrals');
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReferrals();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading referrals...</div>
      </div>
    );
  }

  const filteredReferrals = referrals.filter(ref => 
    ref.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    ref.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Referral Opportunities</h1>
          <p className="text-gray-600">
            Discover referral opportunities posted by fellow alumni. Earn bonuses for successful referrals!
          </p>
        </div>
        {user && (
          <Link 
            to="/referrals/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Post Referral
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow-sm border rounded-xl p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="open">Open Referrals</option>
            <option value="filled">Filled</option>
            <option value="closed">Closed</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      {/* Referrals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReferrals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No referrals found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter</p>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">Browse other sections →</Link>
          </div>
        ) : (
          filteredReferrals.map((referral) => (
            <div key={referral._id} className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">💼</span>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      referral.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {referral.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {referral.deadline && (
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    new Date(referral.deadline) > new Date() 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {new Date(referral.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{referral.jobTitle}</h3>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-1">{referral.company}</h4>
                {referral.referralBonus > 0 && (
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    <span>💰 ${referral.referralBonus}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-3">{referral.description}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/referrals/${referral._id}`}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View Details
                </Link>
                {user && (
                  <button
                    onClick={() => {
                      // Quick apply confirmation
                      if (confirm('Apply for this referral?')) {
                        // Will be handled in detail page
                        window.location.href = `/referrals/${referral._id}`;
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Apply Now
                  </button>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Posted by {referral.postedBy?.name}</span>
                  <span>•</span>
                  <span>{new Date(referral.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}

      </div>

      {/* Pagination */}
      {referrals.length > 0 && (
        <div className="flex justify-center mt-12">
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-medium">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={referrals.length < limit}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralList;

