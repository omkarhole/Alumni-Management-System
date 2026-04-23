import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaMedal, FaTrophy } from 'react-icons/fa';

const AdminBadges = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '#6c757d',
        category: 'community',
        points: 0,
        criteria: ''
    });

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const response = await apiClient.get('/badges/badges');
            setBadges(response.data);
        } catch (error) {
            console.error('Error fetching badges:', error);
            toast.error('Failed to load badges');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBadge) {
                await apiClient.put(`/badges/badges/${editingBadge._id}`, formData);
                toast.success('Badge updated successfully');
            } else {
                await apiClient.post('/badges/badges', formData);
                toast.success('Badge created successfully');
            }
            fetchBadges();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save badge');
        }
    };

    const handleEdit = (badge) => {
        setEditingBadge(badge);
        setFormData({
            name: badge.name,
            description: badge.description,
            icon: badge.icon || '',
            color: badge.color || '#6c757d',
            category: badge.category,
            points: badge.points || 0,
            criteria: badge.criteria || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (badge) => {
        if (!window.confirm(`Are you sure you want to delete "${badge.name}"?`)) {
            return;
        }
        try {
            await axios.delete(`${badgeUrl}/badges/${badge._id}`, {
                withCredentials: true
            });
            toast.success('Badge deleted successfully');
            fetchBadges();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete badge');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingBadge(null);
        setFormData({
            name: '',
            description: '',
            icon: '',
            color: '#6c757d',
            category: 'community',
            points: 0,
            criteria: ''
        });
    };

    const initializeDefaultBadges = async () => {
        try {
            await axios.post(`${badgeUrl}/badges/initialize`, {}, {
                withCredentials: true
            });
            toast.success('Default badges initialized');
            fetchBadges();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initialize badges');
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            verification: 'bg-success',
            career: 'bg-primary',
            mentorship: 'bg-purple',
            community: 'bg-info',
            donation: 'bg-danger',
            events: 'bg-warning'
        };
        return colors[category] || 'bg-secondary';
    };

    return (
        <div className="container-fluid py-4">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><FaMedal className="me-2" />Badge Management</h2>
                <div>
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={initializeDefaultBadges}
                    >
                        Initialize Default Badges
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <FaPlus className="me-1" /> Add Badge
                    </button>
                </div>
            </div>

            {/* Badge Form */}
            {showForm && (
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                            {editingBadge ? 'Edit Badge' : 'Create New Badge'}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Badge Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Category *</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="verification">Verification</option>
                                        <option value="career">Career</option>
                                        <option value="mentorship">Mentorship</option>
                                        <option value="community">Community</option>
                                        <option value="donation">Donation</option>
                                        <option value="events">Events</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description *</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="2"
                                    required
                                ></textarea>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Icon (FontAwesome class)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleChange}
                                        placeholder="e.g., fa-star"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Color</label>
                                    <input
                                        type="color"
                                        className="form-control"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Points</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="points"
                                        value={formData.points}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Criteria</label>
                                <textarea
                                    className="form-control"
                                    name="criteria"
                                    value={formData.criteria}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="How to earn this badge"
                                ></textarea>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary">
                                    {editingBadge ? 'Update Badge' : 'Create Badge'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Badges List */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : badges.length > 0 ? (
                <div className="row">
                    {badges.map((badge) => (
                        <div key={badge._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-start">
                                        <div
                                            className="badge-icon me-3"
                                            style={{
                                                backgroundColor: badge.color || '#6c757d',
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '1.5rem',
                                                flexShrink: 0
                                            }}
                                        >
                                            {badge.icon ? (
                                                <i className={`fas ${badge.icon}`}></i>
                                            ) : (
                                                <FaTrophy />
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-1">{badge.name}</h5>
                                            <p className="text-muted small mb-2">{badge.description}</p>
                                            <div className="d-flex flex-wrap gap-1">
                                                <span className={`badge ${getCategoryColor(badge.category)}`}>
                                                    {badge.category}
                                                </span>
                                                <span className="badge bg-dark">{badge.points} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent">
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary flex-grow-1"
                                            onClick={() => handleEdit(badge)}
                                        >
                                            <FaEdit className="me-1" /> Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger flex-grow-1"
                                            onClick={() => handleDelete(badge)}
                                        >
                                            <FaTrash className="me-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <FaMedal size={50} className="text-muted mb-3" />
                    <h4 className="text-muted">No badges yet</h4>
                    <p className="text-muted">Create your first badge to start rewarding alumni!</p>
                </div>
            )}
        </div>
    );
};

export default AdminBadges;
