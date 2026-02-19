import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBuilding, FaMapMarker, FaBriefcase, FaPercentage, FaBell, FaBellSlash, FaCog } from 'react-icons/fa';
import { baseUrl } from '../utils/globalurl';
import { useAuth } from '../AuthContext';
import ViewJobs from '../admin/view/ViewJobs';

const JobRecommendations = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        preferredSkills: [],
        preferredJobTypes: ['full-time', 'part-time'],
        preferredExperienceLevels: ['entry', 'mid', 'senior'],
        emailNotifications: true,
        notificationFrequency: 'immediate'
    });

    useEffect(() => {
        fetchRecommendations();
        fetchSubscription();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get(`${baseUrl}/jobs/recommendations`, {
                withCredentials: true
            });
            setRecommendations(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setLoading(false);
        }
    };

    const fetchSubscription = async () => {
        try {
            const response = await axios.get(`${baseUrl}/jobs/subscription`, {
                withCredentials: true
            });
            setSubscription(response.data);
            if (response.data.isSubscribed) {
                setSettingsForm({
                    preferredSkills: response.data.preferredSkills || [],
                    preferredJobTypes: response.data.preferredJobTypes || ['full-time', 'part-time'],
                    preferredExperienceLevels: response.data.preferredExperienceLevels || ['entry', 'mid', 'senior'],
                    emailNotifications: response.data.emailNotifications !== false,
                    notificationFrequency: response.data.notificationFrequency || 'immediate'
                });
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
        }
    };

    const handleSubscribe = async () => {
        try {
            const response = await axios.post(`${baseUrl}/jobs/subscribe`, settingsForm, {
                withCredentials: true
            });
            setSubscription({ ...response.data.subscription, isSubscribed: true });
            setShowSettings(false);
            alert('Successfully subscribed to job notifications!');
        } catch (err) {
            console.error('Error subscribing:', err);
            alert('Failed to subscribe. Please try again.');
        }
    };

    const handleUnsubscribe = async () => {
        try {
            await axios.post(`${baseUrl}/jobs/unsubscribe`, {}, {
                withCredentials: true
            });
            setSubscription({ isSubscribed: false });
            alert('Successfully unsubscribed from job notifications.');
        } catch (err) {
            console.error('Error unsubscribing:', err);
            alert('Failed to unsubscribe. Please try again.');
        }
    };

    const openModal = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
    };

    const getMatchColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    const getMatchLabel = (percentage) => {
        if (percentage >= 80) return 'Excellent Match';
        if (percentage >= 60) return 'Good Match';
        if (percentage >= 40) return 'Fair Match';
        return 'Low Match';
    };

    if (loading) {
        return <div className="text-center mt-5">Loading recommendations...</div>;
    }

    return (
        <div className="container mt-5 pt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary">
                    <FaBriefcase className="me-2" />
                    Recommended Jobs For You
                </h2>
                <div>
                    {subscription?.isSubscribed ? (
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-outline-primary"
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <FaCog className="me-1" /> Settings
                            </button>
                            <button 
                                className="btn btn-outline-danger"
                                onClick={handleUnsubscribe}
                            >
                                <FaBellSlash className="me-1" /> Unsubscribe
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowSettings(true)}
                        >
                            <FaBell className="me-1" /> Subscribe to Notifications
                        </button>
                    )}
                </div>
            </div>

            {/* Subscription Settings Panel */}
            {showSettings && (
                <div className="card mb-4 border-primary">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Notification Preferences</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Preferred Skills (comma-separated)</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={settingsForm.preferredSkills.join(', ')}
                                    onChange={(e) => setSettingsForm({
                                        ...settingsForm, 
                                        preferredSkills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    })}
                                    placeholder="e.g., JavaScript, React, Node.js"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Job Types</label>
                                <select 
                                    multiple 
                                    className="form-select"
                                    value={settingsForm.preferredJobTypes}
                                    onChange={(e) => {
                                        const options = Array.from(e.target.selectedOptions, option => option.value);
                                        setSettingsForm({...settingsForm, preferredJobTypes: options});
                                    }}
                                >
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="internship">Internship</option>
                                    <option value="contract">Contract</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Experience Levels</label>
                                <select 
                                    multiple 
                                    className="form-select"
                                    value={settingsForm.preferredExperienceLevels}
                                    onChange={(e) => {
                                        const options = Array.from(e.target.selectedOptions, option => option.value);
                                        setSettingsForm({...settingsForm, preferredExperienceLevels: options});
                                    }}
                                >
                                    <option value="entry">Entry Level</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior Level</option>
                                    <option value="lead">Lead/Manager</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Notification Frequency</label>
                                <select 
                                    className="form-select"
                                    value={settingsForm.notificationFrequency}
                                    onChange={(e) => setSettingsForm({...settingsForm, notificationFrequency: e.target.value})}
                                >
                                    <option value="immediate">Immediate</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="weekly">Weekly Summary</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-check mb-3">
                            <input 
                                type="checkbox" 
                                className="form-check-input"
                                id="emailNotifications"
                                checked={settingsForm.emailNotifications}
                                onChange={(e) => setSettingsForm({...settingsForm, emailNotifications: e.target.checked})}
                            />
                            <label className="form-check-label" htmlFor="emailNotifications">
                                Enable Email Notifications
                            </label>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={handleSubscribe}>
                                {subscription?.isSubscribed ? 'Update Preferences' : 'Subscribe'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations List */}
            {recommendations.length > 0 ? (
                <div className="row">
                    {recommendations.map((job, index) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={index}>
                            <div className="card h-100 job-list">
                                <div className="card-body">
                                    {/* Match Percentage Badge */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <span className={`badge ${getMatchColor(job.matchPercentage)} text-white`}>
                                            <FaPercentage className="me-1" />
                                            {job.matchPercentage}% Match
                                        </span>
                                        <small className="text-muted">{getMatchLabel(job.matchPercentage)}</small>
                                    </div>

                                    <h5 className="card-title">{job.job_title}</h5>
                                    <div className="mb-2">
                                        <span className="text-muted me-3">
                                            <FaBuilding className="me-1" />
                                            {job.company}
                                        </span>
                                        <span className="text-muted">
                                            <FaMapMarker className="me-1" />
                                            {job.location}
                                        </span>
                                    </div>
                                    
                                    {/* Job Type & Experience */}
                                    <div className="mb-3">
                                        <span className="badge bg-secondary me-1">{job.job_type}</span>
                                        <span className="badge bg-info">{job.experience_level}</span>
                                    </div>

                                    {/* Matched Skills */}
                                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                                        <div className="mb-3">
                                            <small className="text-muted">Matched Skills:</small>
                                            <div className="d-flex flex-wrap gap-1 mt-1">
                                                {job.matchedSkills.map((skill, idx) => (
                                                    <span key={idx} className="badge bg-success">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Required Skills */}
                                    {job.skills && job.skills.length > 0 && (
                                        <div className="mb-3">
                                            <small className="text-muted">Required Skills:</small>
                                            <div className="d-flex flex-wrap gap-1 mt-1">
                                                {job.skills.map((skill, idx) => (
                                                    <span key={idx} className={`badge ${job.matchedSkills?.includes(skill) ? 'bg-success' : 'bg-light text-dark'}`}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="card-text text-muted truncate">
                                        {job.description?.substring(0, 100)}...
                                    </p>

                                    <button 
                                        className="btn btn-primary btn-sm w-100"
                                        onClick={() => openModal(job)}
                                    >
                                        View Details & Apply
                                    </button>
                                </div>
                                <div className="card-footer text-muted">
                                    <small>Posted by: {job.user?.name || 'Unknown'}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <FaBriefcase size={48} className="text-muted" />
                    </div>
                    <h4 className="text-muted">No Job Recommendations Yet</h4>
                    <p className="text-muted">
                        {user?.alumnus_bio?.skills?.length > 0 
                            ? "We couldn't find any jobs matching your current skills. Try updating your profile with more skills or check back later!"
                            : "Add skills to your profile to get personalized job recommendations."}
                    </p>
                    {!subscription?.isSubscribed && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowSettings(true)}
                        >
                            <FaBell className="me-1" /> Subscribe to Get Notified
                        </button>
                    )}
                </div>
            )}

            {/* Job Detail Modal */}
            {isModalOpen && selectedJob && (
                <ViewJobs job={selectedJob} closeModal={closeModal} />
            )}
        </div>
    );
};

export default JobRecommendations;
