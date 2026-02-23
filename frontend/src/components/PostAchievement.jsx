import React, { useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaTrophy, FaTimes } from 'react-icons/fa';
import { baseUrl } from '../utils/globalurl';
import { useAuth } from '../AuthContext';

const PostAchievement = ({ onSuccess, onCancel }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        type: 'promotion',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        company: '',
        mediaUrl: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Please enter a description');
            return;
        }
        if (!formData.date) {
            toast.error('Please select a date');
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                `${baseUrl}/achievements`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            toast.success('Achievement shared successfully!');
            setFormData({
                type: 'promotion',
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                company: '',
                mediaUrl: ''
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error posting achievement:', error);
            const message = error.response?.data?.message || 'Failed to share achievement';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <FaTrophy className="me-2" />
                    Share Your Achievement
                </h5>
                {onCancel && (
                    <button 
                        className="btn btn-sm btn-outline-light"
                        onClick={onCancel}
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
                    
                    <div className="mb-3">
                        <label htmlFor="type" className="form-label">Achievement Type *</label>
                        <select
                            className="form-select"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="promotion">Promotion</option>
                            <option value="job_change">New Job</option>
                            <option value="certification">Certification</option>
                            <option value="award">Award</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Promoted to Senior Software Engineer"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="company" className="form-label">Company / Organization</label>
                        <input
                            type="text"
                            className="form-control"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="e.g., Google, Microsoft, etc."
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date *</label>
                        <input
                            type="date"
                            className="form-control"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description *</label>
                        <textarea
                            className="form-control"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tell us about your achievement..."
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="mediaUrl" className="form-label">Media URL (optional)</label>
                        <input
                            type="url"
                            className="form-control"
                            id="mediaUrl"
                            name="mediaUrl"
                            value={formData.mediaUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                        <small className="text-muted">Add a link to an image, certificate, or news article</small>
                    </div>

                    <div className="d-flex gap-2">
                        <button 
                            type="submit" 
                            className="btn btn-success"
                            disabled={loading}
                        >
                            {loading ? 'Sharing...' : 'Share Achievement'}
                        </button>
                        {onCancel && (
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostAchievement;
