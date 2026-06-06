import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { useSocket, useSocketListener } from '../SocketContext';

const ReferralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthReady, user: authUser } = useAuth();
  const [referral, setReferral] = useState(null);

  const { joinReferral, leaveReferral } = useSocket();

  useEffect(() => {
    if (id) {
      joinReferral(id);
      return () => {
        leaveReferral(id);
      };
    }
  }, [id, joinReferral, leaveReferral]);

  useSocketListener('referralMessageCreated', (payload) => {
    if (payload && String(payload.referralId) === String(id)) {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === payload.message?._id);
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, payload.message];
      });
    }
  });
  const [timeline, setTimeline] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicants, setApplicants] = useState([]);

  const authUserId = authUser?._id || authUser?.id || '';
  const authUserType = (authUser?.type || '').toLowerCase();
  const storedUserId = localStorage.getItem('user_id') || '';
  const storedUserType = (localStorage.getItem('user_type') || '').toLowerCase();
  const hasAuthIdentity = Boolean(authUserId || authUserType);
  const hasStoredIdentity = Boolean(storedUserId || storedUserType);
  const identitiesMatch = !isAuthReady || !hasAuthIdentity || !hasStoredIdentity || (
    String(authUserId || '') === String(storedUserId) &&
    String(authUserType || '') === String(storedUserType)
  );
  const currentUserId = identitiesMatch ? (authUserId || (isAuthReady ? storedUserId : '')) : '';
  const currentUserType = identitiesMatch ? (authUserType || (isAuthReady ? storedUserType : '')) : '';
  const isAdmin = currentUserType === 'admin';

  const getDocId = (value) => value?._id || value?.id || value;

  const getCurrentConversationRecipient = () => {
    if (!referral) {
      return '';
    }

    if (isOwner) {
      return selectedRecipientId || getDocId(applicants[0]?.user) || '';
    }

    return getDocId(referral.postedBy) || '';
  };

  const isOwner = Boolean(
    currentUserId && getDocId(referral?.postedBy) === currentUserId
  );

  const isApplicant = Boolean(
    currentUserId && applicants.some((applicant) => getDocId(applicant.user) === currentUserId)
  );

  const canMessage = Boolean(currentUserId && (isOwner || isApplicant));

  useEffect(() => {
    fetchReferral();
  }, [id]);

  useEffect(() => {
    if (!referral) {
      return;
    }

    if (isOwner) {
      if (applicants.length > 0 && !selectedRecipientId) {
        setSelectedRecipientId(getDocId(applicants[0].user));
      }
      return;
    }

    setSelectedRecipientId(getDocId(referral.postedBy));
  }, [referral, applicants, isOwner]);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      const [referralResponse, timelineResponse] = await Promise.all([
        apiClient.get(`/api/referrals/${id}`),
        apiClient.get(`/api/referrals/${id}/timeline`)
      ]);

      const data = referralResponse.data;
      setReferral(data);
      setApplicants(data.applicants || []);
      setTimeline(timelineResponse.data?.timeline || []);

      if (currentUserId && (getDocId(data.postedBy) === currentUserId || (data.applicants || []).some((applicant) => getDocId(applicant.user) === currentUserId))) {
        const messagesResponse = await apiClient.get(`/api/referrals/${id}/messages`);
        setMessages(messagesResponse.data?.messages || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      toast.error('Failed to load referral details');
      setTimeline([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      if (!canMessage) {
        setMessages([]);
        return;
      }

      const response = await apiClient.get(`/api/referrals/${id}/messages`);
      setMessages(response.data?.messages || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load referral messages');
    }
  };

  const handleApply = async () => {
    if (!currentUserId) {
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

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const trimmedBody = messageBody.trim();
    if (!trimmedBody) {
      toast.error('Enter a message before sending');
      return;
    }

    const recipientId = getCurrentConversationRecipient();
    if (isOwner && !recipientId) {
      toast.error('Select an applicant to message');
      return;
    }

    try {
      setSendingMessage(true);
      await apiClient.post(`/api/referrals/${id}/messages`, {
        body: trimmedBody,
        ...(isOwner ? { recipientId } : {})
      });
      setMessageBody('');
      await fetchMessages();
      toast.success('Message sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
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
    !referral.applicants?.some(app => (app.user?._id || app.user?.id || app.user) === currentUserId) &&
    currentUserId && 
    currentUserType === 'student' &&
    (referral.postedBy?._id || referral.postedBy?.id || referral.postedBy) !== currentUserId;

  const describeTimelineEvent = (event) => {
    const actionMap = {
      posted: 'Referral posted',
      applied: 'Application submitted',
      accepted: 'Applicant accepted',
      rejected: 'Applicant rejected',
      filled: 'Referral filled',
      closed: 'Referral closed'
    };

    return actionMap[event.action] || event.action;
  };

  const timelineTone = (event) => {
    if (event.status === 'accepted' || event.status === 'filled') return 'from-green-500 to-emerald-600';
    if (event.status === 'rejected' || event.status === 'closed') return 'from-red-500 to-rose-600';
    if (event.status === 'pending') return 'from-yellow-500 to-amber-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getMessageSide = (message) => {
    // Harden against missing/failed populations (message.sender might be null/undefined).
    const senderId = getDocId(message?.sender);
    if (!currentUserId) return 'other';
    if (!senderId) return 'other';
    return String(senderId) === String(currentUserId) ? 'self' : 'other';
  };

  const bonusComputation = referral?.bonusComputation || {};
  const bonusStatus = bonusComputation.status || 'pending';
  const bonusAmount = Number(bonusComputation.amount || 0);
  const bonusBadgeClass = bonusStatus === 'eligible'
    ? 'bg-green-100 text-green-800'
    : bonusStatus === 'not-eligible'
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800';

  const handleComputeBonus = async () => {
    try {
      const response = await apiClient.post(`/api/referrals/${id}/compute-bonus`);
      setReferral(response.data?.referral || referral);
      toast.success('Referral bonus computed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to compute bonus');
    }
  };

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

        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Referral Bonus</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bonusBadgeClass}`}>
                    {bonusStatus.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Payout on {String(referral.bonusPolicy?.payoutOn || 'filled').toUpperCase()} with company rules for {referral.company}.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <span className="px-3 py-1 rounded-full bg-gray-100">Base: ${Number(referral.referralBonus || 0)}</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100">Computed: ${bonusAmount}</span>
                  {bonusComputation.deadlinePenaltyPercent > 0 && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Deadline penalty: {bonusComputation.deadlinePenaltyPercent}%
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {bonusComputation.reason || 'Bonus has not been computed yet.'}
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleComputeBonus}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
                >
                  Compute Bonus
                </button>
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

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Status Timeline</h2>
                <span className="text-sm text-gray-500">Chronological activity feed</span>
              </div>
              {timeline.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-gray-500">
                  No timeline events yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="flex gap-4">
                      <div className={`mt-1 h-3 w-3 rounded-full bg-gradient-to-r ${timelineTone(event)} shadow-sm`} />
                      <div className="flex-1 pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{describeTimelineEvent(event)}</p>
                            <p className="text-sm text-gray-600">
                              {event.actorName ? `by ${event.actorName}` : 'System'}
                              {event.applicantName ? ` for ${event.applicantName}` : ''}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {String(event.status || '').toUpperCase()}
                          </span>
                          {event.scope && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                              {event.scope}
                            </span>
                          )}
                        </div>
                        {event.details && (
                          <p className="mt-3 text-sm text-gray-600">{event.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messaging */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Candidate Q&amp;A</h2>
                  <p className="text-sm text-gray-500 mt-1">Private clarification thread for the poster and applicants</p>
                </div>
                {canMessage && (
                  <button
                    type="button"
                    onClick={fetchMessages}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Refresh
                  </button>
                )}
              </div>

              {!canMessage ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-gray-500">
                  Only the referral poster and applicants can exchange messages here.
                </div>
              ) : (
                <div className="grid gap-6">
                  <div className="max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-gray-500">
                        No messages yet. Start the conversation below.
                      </div>
                    ) : (
                      messages.map((message) => {
                        const side = getMessageSide(message);
                        return (
                          <div
                            key={message._id}
                            className={`flex ${side === 'self' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${side === 'self' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                              <div className="flex items-center justify-between gap-4 mb-2 text-xs opacity-80">
                                <span className="font-semibold">
                                  {String(getDocId(message?.sender)) === String(currentUserId) ? 'You' : message.sender?.name || 'Member'}
                                  {' '}→{' '}
                                  {message.recipient?.name || 'Recipient'}
                                </span>
                                <span>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</span>
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="space-y-4">
                    {isOwner && applicants.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reply to applicant</label>
                        <select
                          value={selectedRecipientId}
                          onChange={(e) => setSelectedRecipientId(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          {applicants.map((applicant) => (
                            <option key={getDocId(applicant.user)} value={getDocId(applicant.user)}>
                              {applicant.user?.name || 'Applicant'} - {applicant.status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                      <textarea
                        rows="4"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder={isOwner ? 'Ask a question or reply to an applicant...' : 'Ask the poster a clarification question...'}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingMessage || (isOwner && !selectedRecipientId)}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}
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

            {!currentUserId && (
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

