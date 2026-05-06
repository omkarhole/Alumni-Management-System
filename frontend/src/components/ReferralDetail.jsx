import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';

const ReferralDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/referrals/${id}?populate=true`);
      const data = response.data;
      setReferral(data);
      setApplicants(data.applicants || []);
      setIsOwner(user && data.postedBy?._id === user.id);
    } catch (err) {
      toast.error('Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }

    try {
      setApplying(true);
      await apiClient.post(`/api/referrals/${id}/apply`);
      toast.success('Application submitted successfully!');
      fetchReferral(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptApplicant = async (applicantId) => {
    try {
      await apiClient.put(`/api/referrals/${id}/applicants/${applicantId}/accept`);
      toast.success('Applicant accepted!');
      fetchReferral();
    } catch (err) {
      toast.error('Failed to accept applicant');
    }
  };

  const handleRejectApplicant = async (applicantId) => {
    try {
      await apiClient.put(`/api/referrals/${id}/applicants/${applicantId}/reject`);
      toast.success('Applicant rejected!');
      fetchReferral();
    } catch (err) {
      toast.error('Failed to reject applicant');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Referral Not Found</h2>
          <Link to="/referrals" className="text-blue-600 hover:underline">
            ← Back to Referrals
          </Link>
        </div>
      </div>
    );
  }

  const canApply = referral.status === 'open' && 
    !referral.applicants?.some(app => app.user._id === user?.id) &&
    user && 
    !isOwner;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/referrals" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            ← Back to Referrals
          </Link>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">💼</span>
              </div>
              <div className="text-white text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{referral.jobTitle}</h1>
                <p className="text-2xl font-semibold">{referral.company}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className={`px-4 py-2 rounded-full font-semibold ${
                referral.status === 'open' 
                  ? 'bg-green-400/20 text-green-100 border border-green-400/50' 
                  : 'bg-gray-400/20 text-gray-100 border border-gray-400/50'
              }`}>
                {referral.status.toUpperCase()}
              </span>
              {referral.referralBonus > 0 && (
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  💰 ${referral.referralBonus} Bonus
                </span>
              )}
              {referral.deadline && (
                <span className={`px-4 py-2 rounded-full font-semibold ${
                  new Date(referral.deadline) > new Date() ? 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/50' : 'bg-red-400/20 text-red-100 border border-red-400/50'
                }`}>
                  {new Date(referral.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{referral.description}</p>
              </div>
            </div>

            {/* Apply Section */}
            {canApply && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 shadow-2xl mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Apply?</h3>
                <p className="text-green-100 mb-6">Click apply to submit your candidacy for this referral opportunity.</p>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-white text-green-600 font-bold py-4 px-8 rounded-xl text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {applying ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status" />
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold text-yellow-900 mb-4">Login to Apply</h3>
                <p className="text-yellow-800 mb-6">Sign in to your account to apply for this referral opportunity and track your applications.</p>
                <Link 
                  to="/login" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Posted By */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Posted By</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{referral.postedBy?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{referral.postedBy?.name}</p>
                  <p className="text-sm text-gray-600">{referral.postedBy?.alumnus_bio?.batch || 'Alumni'}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applicants</span>
                  <span className="font-bold text-2xl text-blue-600">{applicants.length}</span>
                </div>
                {referral.referralBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus</span>
                    <span className="font-bold text-2xl text-green-600">${referral.referralBonus}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="text-gray-900">{new Date(referral.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Manage Applicants (Owner Only) */}
            {isOwner && applicants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Manage Applicants ({applicants.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {applicants.map((applicant) => (
                    <div key={applicant.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{applicant.user.name}</p>
                        <p className="text-sm text-gray-600">{applicant.user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {applicant.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptApplicant(applicant.user._id)}
                              className="px-4 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectApplicant(applicant.user._id)}
                              className="px-4 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          applicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {applicant.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetail;

