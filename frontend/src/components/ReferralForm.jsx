import React, { useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';

const ReferralForm = ({ job, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateLinkedIn: '',
        candidateExperience: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(
                `${baseUrl}/jobs/${job._id}/refer`,
                formData,
                { withCredentials: true }
            );
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit referral');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Refer a Candidate</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            
                            <div className="mb-3">
                                <p className="text-muted">
                                    Referring candidate for: <strong>{job.job_title}</strong> at <strong>{job.company}</strong>
                                </p>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="candidateName" className="form-label">Candidate Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="candidateName"
                                        name="candidateName"
                                        value={formData.candidateName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="candidateEmail" className="form-label">Candidate Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="candidateEmail"
                                        name="candidateEmail"
                                        value={formData.candidateEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="candidatePhone" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="candidatePhone"
                                        name="candidatePhone"
                                        value={formData.candidatePhone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="candidateLinkedIn" className="form-label">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        id="candidateLinkedIn"
                                        name="candidateLinkedIn"
                                        value={formData.candidateLinkedIn}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="candidateExperience" className="form-label">Work Experience</label>
                                <textarea
                                    className="form-control"
                                    id="candidateExperience"
                                    name="candidateExperience"
                                    rows="3"
                                    value={formData.candidateExperience}
                                    onChange={handleChange}
                                    placeholder="Brief description of candidate's experience..."
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="notes" className="form-label">Additional Notes</label>
                                <textarea
                                    className="form-control"
                                    id="notes"
                                    name="notes"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Any additional information about the candidate..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Referral'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReferralForm;
