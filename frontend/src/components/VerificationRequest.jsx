import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheck, FaClock, FaTimes, FaUpload, FaFileAlt, FaUserGraduate } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

const VerificationRequest = ({ onVerificationComplete }) => {
    const { theme } = useTheme();
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        degree: '',
        batch: new Date().getFullYear() - 4,
        course: '',
        graduationYear: new Date().getFullYear(),
        rollNumber: ''
    });

    useEffect(() => {
        fetchVerificationStatus();
        fetchCourses();
    }, []);

    const fetchVerificationStatus = async () => {
        try {
            const response = await axios.get(`${baseUrl}/verification/status`, {
                withCredentials: true
            });
            setVerificationStatus(response.data);
        } catch (error) {
            console.error('Error fetching verification status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${baseUrl}/courses`);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.post(`${baseUrl}/verification`, formData, {
                withCredentials: true
            });
            setVerificationStatus(response.data);
            toast.success('Verification request submitted successfully!');
            if (onVerificationComplete) {
                onVerificationComplete(response.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit verification request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FaClock className="text-warning" />;
            case 'under_review':
                return <FaClock className="text-info" />;
            case 'approved':
                return <FaCheck className="text-success" />;
            case 'rejected':
                return <FaTimes className="text-danger" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending Review';
            case 'under_review':
                return 'Under Review';
            case 'approved':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'under_review':
                return 'info';
            case 'approved':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // If already verified, show success message
    if (verificationStatus?.status === 'approved') {
        return (
            <div className={`page-section bg-${theme}`} id="verification">
                <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
                <div className="container">
                    <div className="card border-success">
                        <div className="card-body text-center py-5">
                            <div className="mb-4">
                                <div
                                    className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '80px', height: '80px' }}
                                >
                                    <FaCheck className="text-white" style={{ fontSize: '2.5rem' }} />
                                </div>
                            </div>
                            <h3 className="text-success mb-3">You are a Verified Alumni!</h3>
                            <p className="text-muted mb-4">
                                Your credentials have been verified. You now have access to all verified alumni features.
                            </p>
                            <div className="d-inline-block px-4 py-3 bg-light rounded">
                                <p className="mb-1"><strong>Verified since:</strong> {new Date(verificationStatus.reviewedAt).toLocaleDateString()}</p>
                                <p className="mb-0"><strong>Batch:</strong> {verificationStatus.credentials?.batch}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If rejected, show form again with message
    if (verificationStatus?.status === 'rejected') {
        return (
            <div className={`page-section bg-${theme}`} id="verification">
                <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-heading text-uppercase">
                            <FaUserGraduate className="me-2" />
                            Alumni Verification
                        </h2>
                        <h3 className="section-subheading text-muted">
                            Verify your alumni credentials to unlock exclusive features
                        </h3>
                    </div>

                    {/* Rejection Notice */}
                    <div className="alert alert-danger mb-4">
                        <h5><FaTimes className="me-2" />Verification Rejected</h5>
                        <p className="mb-0">{verificationStatus.rejectionReason || 'Your verification request was rejected. Please submit again with correct information.'}</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Degree / Certificate</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="degree"
                                                    value={formData.degree}
                                                    onChange={handleChange}
                                                    placeholder="e.g., B.Tech, B.Sc"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Roll Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="rollNumber"
                                                    value={formData.rollNumber}
                                                    onChange={handleChange}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <label className="form-label">Batch Year</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="batch"
                                                    value={formData.batch}
                                                    onChange={handleChange}
                                                    min="1950"
                                                    max={new Date().getFullYear()}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Course</label>
                                                <select
                                                    className="form-select"
                                                    name="course"
                                                    value={formData.course}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select Course</option>
                                                    {courses.map(c => (
                                                        <option key={c._id} value={c._id}>{c.course}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Graduation Year</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="graduationYear"
                                                    value={formData.graduationYear}
                                                    onChange={handleChange}
                                                    min="1950"
                                                    max={new Date().getFullYear() + 5}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUpload className="me-2" />
                                                        Submit for Re-verification
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If pending or under review, show status
    if (verificationStatus?.status === 'pending' || verificationStatus?.status === 'under_review') {
        return (
            <div className={`page-section bg-${theme}`} id="verification">
                <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-heading text-uppercase">
                            <FaUserGraduate className="me-2" />
                            Alumni Verification
                        </h2>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="card border-warning">
                                <div className="card-body text-center py-5">
                                    <div className="mb-4">
                                        <div
                                            className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center"
                                            style={{ width: '80px', height: '80px' }}
                                        >
                                            <FaClock className="text-white" style={{ fontSize: '2.5rem' }} />
                                        </div>
                                    </div>
                                    <h4 className="mb-3">Verification {getStatusLabel(verificationStatus.status)}</h4>
                                    <p className="text-muted mb-4">
                                        Your verification request is currently being reviewed by our administrators.
                                        You'll be notified once the review is complete.
                                    </p>
                                    <div className="d-inline-block px-4 py-3 bg-light rounded">
                                        <p className="mb-1"><strong>Submitted on:</strong> {new Date(verificationStatus.createdAt).toLocaleDateString()}</p>
                                        <p className="mb-0"><strong>Batch:</strong> {verificationStatus.credentials?.batch}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show form for new verification request
    return (
        <div className={`page-section bg-${theme}`} id="verification">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading text-uppercase">
                        <FaUserGraduate className="me-2" />
                        Alumni Verification
                    </h2>
                    <h3 className="section-subheading text-muted">
                        Verify your alumni credentials to unlock exclusive features and build trust in the network
                    </h3>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Degree / Certificate *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="degree"
                                                value={formData.degree}
                                                onChange={handleChange}
                                                placeholder="e.g., B.Tech, B.Sc, MBA"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Roll Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="rollNumber"
                                                value={formData.rollNumber}
                                                onChange={handleChange}
                                                placeholder="Optional - from college records"
                                            />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Batch Year *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="batch"
                                                value={formData.batch}
                                                onChange={handleChange}
                                                min="1950"
                                                max={new Date().getFullYear()}
                                                required
                                            />
                                            <small className="text-muted">Year you joined</small>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Course *</label>
                                            <select
                                                className="form-select"
                                                name="course"
                                                value={formData.course}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Course</option>
                                                {courses.map(c => (
                                                    <option key={c._id} value={c._id}>{c.course}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Graduation Year *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="graduationYear"
                                                value={formData.graduationYear}
                                                onChange={handleChange}
                                                min="1950"
                                                max={new Date().getFullYear() + 5}
                                                required
                                            />
                                            <small className="text-muted">Year of completion</small>
                                        </div>
                                    </div>

                                    <div className="alert alert-info">
                                        <FaFileAlt className="me-2" />
                                        <strong>Note:</strong> You may be asked to upload supporting documents for verification.
                                        Please ensure your information matches your academic records.
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="me-2" />
                                                    Submit for Verification
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationRequest;
