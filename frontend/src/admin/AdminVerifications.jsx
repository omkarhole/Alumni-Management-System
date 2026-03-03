import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheck, FaTimes, FaClock, FaUserGraduate, FaSearch } from 'react-icons/fa';
import { badgeUrl } from '../utils/globalurl';

const AdminVerifications = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${badgeUrl}/verification/requests?status=${filter}`, {
                withCredentials: true
            });
            setRequests(response.data.requests || []);
        } catch (error) {
            console.error('Error fetching verification requests:', error);
            toast.error('Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            const data = {
                status,
                reviewNotes,
                rejectionReason: status === 'rejected' ? rejectionReason : ''
            };
            
            await axios.put(`${badgeUrl}/verification/requests/${requestId}/review`, data, {
                withCredentials: true
            });
            
            toast.success(`Verification ${status} successfully`);
            setSelectedRequest(null);
            setReviewNotes('');
            setRejectionReason('');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to review request');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge bg-warning">Pending</span>;
            case 'under_review':
                return <span className="badge bg-info">Under Review</span>;
            case 'approved':
                return <span className="badge bg-success">Approved</span>;
            case 'rejected':
                return <span className="badge bg-danger">Rejected</span>;
            default:
                return <span className="badge bg-secondary">{status}</span>;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid py-4">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><FaUserGraduate className="me-2" />Verification Requests</h2>
                <div className="btn-group">
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`btn ${filter === 'under_review' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('under_review')}
                    >
                        Under Review
                    </button>
                    <button
                        className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Verification Request List */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : requests.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Alumni</th>
                                <th>Credentials</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr key={request._id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle me-2">
                                                {request.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{request.user?.name}</div>
                                                <small className="text-muted">{request.user?.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>Batch:</strong> {request.credentials?.batch}
                                        </div>
                                        <div>
                                            <strong>Course:</strong> {request.credentials?.course?.course}
                                        </div>
                                        {request.credentials?.degree && (
                                            <div>
                                                <strong>Degree:</strong> {request.credentials.degree}
                                            </div>
                                        )}
                                    </td>
                                    <td>{getStatusBadge(request.status)}</td>
                                    <td>
                                        <small>{formatDate(request.createdAt)}</small>
                                    </td>
                                    <td>
                                        {request.status === 'pending' || request.status === 'under_review' ? (
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => setSelectedRequest({ ...request, action: 'approve' })}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => setSelectedRequest({ ...request, action: 'reject' })}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setSelectedRequest(request)}
                                            >
                                                View
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-5">
                    <FaClock size={50} className="text-muted mb-3" />
                    <h4 className="text-muted">No verification requests</h4>
                    <p className="text-muted">There are no verification requests to review.</p>
                </div>
            )}

            {/* Review Modal */}
            {selectedRequest && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedRequest.action === 'approve' ? 'Approve' : selectedRequest.action === 'reject' ? 'Reject' : 'View'} Verification Request
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setReviewNotes('');
                                        setRejectionReason('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* User Info */}
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <h6>Alumni Information</h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p className="mb-1"><strong>Name:</strong> {selectedRequest.user?.name}</p>
                                                <p className="mb-1"><strong>Email:</strong> {selectedRequest.user?.email}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="mb-1"><strong>Batch:</strong> {selectedRequest.credentials?.batch}</p>
                                                <p className="mb-1"><strong>Course:</strong> {selectedRequest.credentials?.course?.course}</p>
                                                <p className="mb-0"><strong>Graduation Year:</strong> {selectedRequest.credentials?.graduationYear}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <h6>Uploaded Documents</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {selectedRequest.documents.map((doc, index) => (
                                                    <a
                                                        key={index}
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Document {index + 1} ({doc.type})
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Review Form */}
                                {(selectedRequest.action === 'approve' || selectedRequest.action === 'reject') && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Review Notes</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={reviewNotes}
                                                onChange={(e) => setReviewNotes(e.target.value)}
                                                placeholder="Add internal notes about this verification..."
                                            ></textarea>
                                        </div>
                                        {selectedRequest.action === 'reject' && (
                                            <div className="mb-3">
                                                <label className="form-label">Rejection Reason *</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Reason for rejection (will be shown to user)..."
                                                    required
                                                ></textarea>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* View Mode - Show Review Info */}
                                {selectedRequest.status !== 'pending' && selectedRequest.status !== 'under_review' && !selectedRequest.action && (
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <h6>Review Information</h6>
                                            <p className="mb-1">
                                                <strong>Reviewed By:</strong> {selectedRequest.reviewedBy?.name || 'Admin'}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Reviewed At:</strong> {formatDate(selectedRequest.reviewedAt)}
                                            </p>
                                            {selectedRequest.reviewNotes && (
                                                <p className="mb-1">
                                                    <strong>Notes:</strong> {selectedRequest.reviewNotes}
                                                </p>
                                            )}
                                            {selectedRequest.rejectionReason && (
                                                <p className="mb-0">
                                                    <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setReviewNotes('');
                                        setRejectionReason('');
                                    }}
                                >
                                    Cancel
                                </button>
                                {selectedRequest.action === 'approve' && (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => handleReview(selectedRequest._id, 'approved')}
                                    >
                                        <FaCheck className="me-1" /> Approve Verification
                                    </button>
                                )}
                                {selectedRequest.action === 'reject' && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleReview(selectedRequest._id, 'rejected')}
                                        disabled={!rejectionReason}
                                    >
                                        <FaTimes className="me-1" /> Reject Verification
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
