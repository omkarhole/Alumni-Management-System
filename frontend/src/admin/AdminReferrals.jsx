import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

const statusColors = {
    pending: 'warning',
    reviewed: 'info',
    shortlisted: 'primary',
    interviewed: 'primary',
    offered: 'success',
    accepted: 'success',
    rejected: 'danger',
    withdrawn: 'secondary'
};

const moderationStatusColors = {
    visible: 'success',
    flagged: 'warning',
    hidden: 'danger',
    removed: 'dark'
};

const moderationActionLabels = {
    flag: 'Flag spam',
    hide: 'Hide content',
    restore: 'Restore content',
    suspend_poster: 'Suspend poster'
};

const AdminReferrals = () => {
    const [jobReferrals, setJobReferrals] = useState([]);
    const [jobLoading, setJobLoading] = useState(true);
    const [jobError, setJobError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [moderationReferrals, setModerationReferrals] = useState([]);
    const [moderationLoading, setModerationLoading] = useState(true);
    const [moderationError, setModerationError] = useState('');
    const [moderationFilter, setModerationFilter] = useState('all');
    const [selectedModerationReferralId, setSelectedModerationReferralId] = useState('');
    const [moderationActions, setModerationActions] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    useEffect(() => {
        fetchJobReferrals();
        fetchModerationReferrals();
    }, []);

    const fetchJobReferrals = async () => {
        try {
            setJobLoading(true);
            const res = await apiClient.get('/admin/jobs/all-referrals');
            setJobReferrals(res.data);
        } catch (err) {
            setJobError('Failed to load job referrals');
            console.error(err);
        } finally {
            setJobLoading(false);
        }
    };

    const fetchModerationReferrals = async () => {
        try {
            setModerationLoading(true);
            const res = await apiClient.get('/admin/referrals');
            const referrals = res.data?.referrals || [];
            setModerationReferrals(referrals);

            if (!selectedModerationReferralId && referrals.length > 0) {
                setSelectedModerationReferralId(referrals[0]._id);
                fetchModerationActions(referrals[0]._id);
            }
        } catch (err) {
            setModerationError('Failed to load referral moderation data');
            console.error(err);
        } finally {
            setModerationLoading(false);
        }
    };

    const fetchModerationActions = async (referralId) => {
        if (!referralId) {
            setModerationActions([]);
            return;
        }

        try {
            setAuditLoading(true);
            const res = await apiClient.get(`/admin/referrals/${referralId}/moderation-actions`);
            setModerationActions(res.data?.actions || []);
            setSelectedModerationReferralId(referralId);
        } catch (err) {
            console.error(err);
            setModerationActions([]);
            alert('Failed to load moderation audit log');
        } finally {
            setAuditLoading(false);
        }
    };

    const handleStatusUpdate = async (referralId, newStatus) => {
        try {
            await apiClient.put(
                `/admin/jobs/referrals/${referralId}/status`,
                { status: newStatus }
            );
            fetchJobReferrals();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleModerationAction = async (referralId, actionType, defaultReason) => {
        const reason = window.prompt(`Reason for ${moderationActionLabels[actionType] || actionType}`, defaultReason || '');

        if (reason === null) {
            return;
        }

        try {
            await apiClient.post(`/admin/referrals/${referralId}/${actionType}`, {
                reason: reason.trim() || defaultReason || ''
            });

            await Promise.all([
                fetchModerationReferrals(),
                fetchJobReferrals()
            ]);

            fetchModerationActions(referralId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update moderation state');
        }
    };

    const filteredJobReferrals = statusFilter === 'all'
        ? jobReferrals
        : jobReferrals.filter(r => r.status === statusFilter);

    const filteredModerationReferrals = moderationFilter === 'all'
        ? moderationReferrals
        : moderationReferrals.filter((referral) => (referral.moderation?.status || 'visible') === moderationFilter);

    const selectedModerationReferral = moderationReferrals.find(
        (referral) => referral._id === selectedModerationReferralId
    ) || null;

    const renderJobSection = () => {
        if (jobLoading) {
            return <div className="text-center mt-4">Loading job referrals...</div>;
        }

        return (
            <div className="card">
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <h5 className="mb-0">Job Referrals Management</h5>
                    <select 
                        className="form-select" 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '220px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="offered">Offered</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Job</th>
                                    <th>Referred By</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobError && (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="alert alert-danger mb-0">{jobError}</div>
                                        </td>
                                    </tr>
                                )}
                                {!jobError && filteredJobReferrals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No referrals found</td>
                                    </tr>
                                ) : (
                                    filteredJobReferrals.map((referral) => (
                                        <tr key={referral._id}>
                                            <td>
                                                <strong>{referral.candidateName}</strong><br />
                                                <small className="text-muted">{referral.candidateEmail}</small><br />
                                                {referral.candidatePhone && (
                                                    <small className="text-muted">{referral.candidatePhone}</small>
                                                )}
                                            </td>
                                            <td>
                                                <strong>{referral.job?.job_title}</strong><br />
                                                <small className="text-muted">{referral.job?.company}</small>
                                            </td>
                                            <td>
                                                {referral.referrer?.name}<br />
                                                <small className="text-muted">{referral.referrer?.type}</small>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${statusColors[referral.status]}`}>
                                                    {referral.status}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(referral.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="dropdown">
                                                    <button 
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                        type="button" 
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        Update Status
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        {Object.keys(statusColors).map((status) => (
                                                            <li key={status}>
                                                                <button 
                                                                    className="dropdown-item" 
                                                                    onClick={() => handleStatusUpdate(referral._id, status)}
                                                                >
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {referral.candidateLinkedIn && (
                                                    <a 
                                                        href={referral.candidateLinkedIn} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary ms-1"
                                                        title="View LinkedIn"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderModerationSection = () => {
        return (
            <div className="card mt-4">
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <h5 className="mb-1">Referral Moderation & Audit Trail</h5>
                        <small className="text-muted">Flag spam, hide content, restore posts, and suspend the poster from referral publishing.</small>
                    </div>
                    <select
                        className="form-select"
                        value={moderationFilter}
                        onChange={(e) => setModerationFilter(e.target.value)}
                        style={{ width: '220px' }}
                    >
                        <option value="all">All moderation states</option>
                        <option value="visible">Visible</option>
                        <option value="flagged">Flagged</option>
                        <option value="hidden">Hidden</option>
                        <option value="removed">Removed</option>
                    </select>
                </div>

                <div className="card-body">
                    {moderationError && (
                        <div className="alert alert-danger" role="alert">
                            {moderationError}
                        </div>
                    )}

                    {moderationLoading ? (
                        <div className="text-center py-4">Loading moderation queue...</div>
                    ) : (
                        <div className="row g-4">
                            <div className="col-12 col-xl-7">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Referral</th>
                                                <th>Poster</th>
                                                <th>State</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredModerationReferrals.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center">No referrals found</td>
                                                </tr>
                                            ) : (
                                                filteredModerationReferrals.map((referral) => {
                                                    const moderationStatus = referral.moderation?.status || 'visible';
                                                    const isSelected = selectedModerationReferralId === referral._id;

                                                    return (
                                                        <tr key={referral._id} className={isSelected ? 'table-primary' : ''}>
                                                            <td>
                                                                <strong>{referral.jobTitle}</strong><br />
                                                                <small className="text-muted">{referral.company}</small><br />
                                                                <small className="text-muted">Created {new Date(referral.createdAt).toLocaleDateString()}</small>
                                                            </td>
                                                            <td>
                                                                <strong>{referral.postedBy?.name || 'Unknown'}</strong><br />
                                                                <small className="text-muted">{referral.postedBy?.email}</small><br />
                                                                {referral.postedBy?.referralPostingSuspended && (
                                                                    <span className="badge bg-danger mt-1">Poster suspended</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className={`badge bg-${moderationStatusColors[moderationStatus] || 'secondary'}`}>
                                                                    {moderationStatus}
                                                                </span>
                                                                {referral.moderation?.reason && (
                                                                    <div className="small text-muted mt-1">{referral.moderation.reason}</div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleModerationAction(referral._id, 'flag', 'Spam review')}>
                                                                        Flag
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleModerationAction(referral._id, 'hide', 'Hidden after moderation review')}>
                                                                        Hide
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-success" onClick={() => handleModerationAction(referral._id, 'restore', 'Restored after review')}>
                                                                        Restore
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-dark" onClick={() => handleModerationAction(referral._id, 'suspend-poster', 'Poster suspended for abusive referral content')}>
                                                                        Suspend poster
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchModerationActions(referral._id)}>
                                                                        Audit log
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="col-12 col-xl-5">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                            <div>
                                                <h6 className="mb-1">Audit trail</h6>
                                                <small className="text-muted">
                                                    {selectedModerationReferral ? `${selectedModerationReferral.jobTitle} at ${selectedModerationReferral.company}` : 'Select a referral to review history'}
                                                </small>
                                            </div>
                                            {selectedModerationReferral && (
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchModerationActions(selectedModerationReferral._id)}>
                                                    Refresh
                                                </button>
                                            )}
                                        </div>

                                        {auditLoading ? (
                                            <div className="text-center py-4">Loading audit trail...</div>
                                        ) : moderationActions.length === 0 ? (
                                            <div className="text-muted">No moderation actions recorded yet.</div>
                                        ) : (
                                            <div className="list-group list-group-flush">
                                                {moderationActions.map((action) => (
                                                    <div key={action._id} className="list-group-item bg-transparent px-0">
                                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                                            <div>
                                                                <div className="fw-semibold">{moderationActionLabels[action.actionType] || action.actionType}</div>
                                                                <div className="small text-muted">
                                                                    by {action.adminId?.name || 'Admin'}
                                                                    {action.adminId?.email ? ` (${action.adminId.email})` : ''}
                                                                </div>
                                                                {action.reason && <div className="small mt-1">{action.reason}</div>}
                                                            </div>
                                                            <div className="text-end small text-muted">
                                                                {new Date(action.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Job Referrals Management</h2>
            </div>

            {renderJobSection()}
            {renderModerationSection()}
        </div>
    );
};

export default AdminReferrals;
