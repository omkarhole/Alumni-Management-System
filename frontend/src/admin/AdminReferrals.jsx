import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import { useAuth } from '../AuthContext';

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

const AdminReferrals = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseUrl}/jobs/all-referrals`, { withCredentials: true });
            setReferrals(res.data);
        } catch (err) {
            setError('Failed to load referrals');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (referralId, newStatus) => {
        try {
            await axios.put(
                `${baseUrl}/jobs/referrals/${referralId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            fetchReferrals();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredReferrals = statusFilter === 'all' 
        ? referrals 
        : referrals.filter(r => r.status === statusFilter);

    if (loading) {
        return <div className="text-center mt-5">Loading referrals...</div>;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Job Referrals Management</h2>
                <div>
                    <select 
                        className="form-select" 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '200px' }}
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
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="card">
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
                                {filteredReferrals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No referrals found</td>
                                    </tr>
                                ) : (
                                    filteredReferrals.map((referral) => (
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
        </div>
    );
};

export default AdminReferrals;
