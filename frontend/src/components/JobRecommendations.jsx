import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBuilding, FaMapMarker, FaBriefcase, FaPercentage, FaBell, FaBellSlash, FaCog, FaHeart, FaTimes, FaEye, FaChartLine, FaLightbulb, FaUsers, FaBrain } from 'react-icons/fa';
import { baseUrl } from '../utils/globalurl';
import { useAuth } from '../AuthContext';
import ViewJobs from '../admin/view/ViewJobs';

const JobRecommendations = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [enhancedRecommendations, setEnhancedRecommendations] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [skillGap, setSkillGap] = useState(null);
    const [similarAlumni, setSimilarAlumni] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [useEnhanced, setUseEnhanced] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        preferredSkills: [],
        preferredJobTypes: ['full-time', 'part-time'],
        preferredExperienceLevels: ['entry', 'mid', 'senior'],
        preferredLocations: [],
        emailNotifications: true,
        notificationFrequency: 'immediate'
    });

    useEffect(() => {
        fetchRecommendations();
        fetchSubscription();
        fetchAnalytics();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const endpoint = useEnhanced ? '/jobs/recommendations/enhanced' : '/jobs/recommendations';
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                withCredentials: true
            });
            
            if (useEnhanced && response.data.recommendations) {
                setEnhancedRecommendations(response.data.recommendations);
                setRecommendations(response.data.recommendations);
            } else {
                setRecommendations(response.data);
            }
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
                    preferredLocations: response.data.preferredLocations || [],
                    emailNotifications: response.data.emailNotifications !== false,
                    notificationFrequency: response.data.notificationFrequency || 'immediate'
                });
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${baseUrl}/jobs/analytics`, {
                withCredentials: true
            });
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    };

    const fetchSkillGap = async (jobId) => {
        try {
            const response = await axios.get(`${baseUrl}/jobs/${jobId}/skill-gap`, {
                withCredentials: true
            });
            setSkillGap(response.data);
        } catch (err) {
            console.error('Error fetching skill gap:', err);
        }
    };

    const fetchSimilarAlumni = async (targetJobTitle, targetSkills) => {
        try {
            const params = new URLSearchParams();
            if (targetJobTitle) params.append('targetJobTitle', targetJobTitle);
            if (targetSkills) params.append('targetSkills', targetSkills);
            
            const response = await axios.get(`${baseUrl}/jobs/similar-alumni?${params}`, {
                withCredentials: true
            });
            setSimilarAlumni(response.data);
        } catch (err) {
            console.error('Error fetching similar alumni:', err);
        }
    };

    const trackInteraction = async (jobId, interactionType, matchScore = 0) => {
        try {
            await axios.post(`${baseUrl}/jobs/interactions`, {
                jobId,
                interactionType,
                matchScore,
                source: 'dashboard'
            }, {
                withCredentials: true
            });
            // Refresh analytics after interaction
            fetchAnalytics();
        } catch (err) {
            console.error('Error tracking interaction:', err);
        }
    };

    const handleSaveJob = (job) => {
        trackInteraction(job._id, 'save', job.matchPercentage);
        alert('Job saved! We\'ll learn from your preferences to improve recommendations.');
    };

    const handleDismissJob = (job) => {
        trackInteraction(job._id, 'dismiss', job.matchPercentage);
        setRecommendations(recommendations.filter(r => r._id !== job._id));
    };

    const handleViewJob = (job) => {
        trackInteraction(job._id, 'view', job.matchPercentage);
        fetchSkillGap(job._id);
        fetchSimilarAlumni(job.job_title, job.skills?.join(','));
    };

    const handleApplyJob = (job) => {
        trackInteraction(job._id, 'apply', job.matchPercentage);
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const handleToggleEnhanced = async () => {
        setUseEnhanced(!useEnhanced);
        await fetchRecommendations();
        if (!useEnhanced) {
            fetchAnalytics();
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
        handleViewJob(job);
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
        setSkillGap(null);
        setSimilarAlumni([]);
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
        <div className="container pt-5 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary">
                    <FaBriefcase className="me-2" />
                    Recommended Jobs For You
                    {useEnhanced && <FaBrain className="ms-2 text-warning" title="AI-Enhanced Recommendations" />}
                </h2>
                <div className="d-flex gap-2">
                    {/* AI Toggle */}
                    <button 
                        className={`btn ${useEnhanced ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={handleToggleEnhanced}
                        title="Toggle AI-Enhanced Recommendations"
                    >
                        <FaBrain className="me-1" /> 
                        {useEnhanced ? 'AI On' : 'AI Off'}
                    </button>
                    
                    {/* Analytics Button */}
                    <button 
                        className={`btn ${showAnalytics ? 'btn-info' : 'btn-outline-info'}`}
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        title="View Recommendation Analytics"
                    >
                        <FaChartLine className="me-1" /> Analytics
                    </button>
                    
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
                            <FaBell className="me-1" /> Subscribe
                        </button>
                    )}
                </div>
            </div>

            {/* Analytics Panel */}
            {showAnalytics && analytics && (
                <div className="card mb-4 border-info">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0"><FaChartLine className="me-2" />Your Recommendation Analytics</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3 text-center">
                                <h3>{analytics.summary.totalInteractions}</h3>
                                <p className="text-muted mb-0">Total Interactions</p>
                            </div>
                            <div className="col-md-3 text-center">
                                <h3>{analytics.summary.savedJobs}</h3>
                                <p className="text-muted mb-0">Saved Jobs</p>
                            </div>
                            <div className="col-md-3 text-center">
                                <h3>{analytics.summary.appliedJobs}</h3>
                                <p className="text-muted mb-0">Applied Jobs</p>
                            </div>
                            <div className="col-md-3 text-center">
                                <h3>{analytics.summary.avgRelevance}/5</h3>
                                <p className="text-muted mb-0">Avg. Relevance</p>
                            </div>
                        </div>
                        
                        {analytics.recommendations?.suggestedSkillsToExplore?.length > 0 && (
                            <div className="mt-3">
                                <h6><FaLightbulb className="me-1 text-warning" />Skills to Explore:</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {analytics.recommendations.suggestedSkillsToExplore.map((skill, idx) => (
                                        <span key={idx} className="badge bg-warning text-dark">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                <label className="form-label">Preferred Locations</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={settingsForm.preferredLocations.join(', ')}
                                    onChange={(e) => setSettingsForm({
                                        ...settingsForm, 
                                        preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    })}
                                    placeholder="e.g., New York, Remote, San Francisco"
                                />
                            </div>
                        </div>
                        <div className="row">
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
                        </div>
                        <div className="row">
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
                            <div className="col-md-6 mb-3 d-flex align-items-center">
                                <div className="form-check mt-4">
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
                            </div>
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

            {/* Skill Gap Analysis & Similar Alumni Panel */}
            {selectedJob && (skillGap || similarAlumni.length > 0) && (
                <div className="card mb-4 border-warning">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0"><FaLightbulb className="me-2" />AI Insights for This Job</h5>
                    </div>
                    <div className="card-body">
                        {skillGap && (
                            <div className="mb-4">
                                <h6>Skill Gap Analysis</h6>
                                <div className="progress mb-2" style={{height: '20px'}}>
                                    <div 
                                        className="progress-bar bg-success" 
                                        style={{width: `${skillGap.analysis.matchPercentage}%`}}
                                    >
                                        {skillGap.analysis.matchPercentage}% Match
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <small className="text-success">Matched Skills:</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {skillGap.analysis.matchedSkills.map((skill, idx) => (
                                                <span key={idx} className="badge bg-success">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-danger">Missing Skills:</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {skillGap.analysis.missingSkills.map((skill, idx) => (
                                                <span key={idx} className="badge bg-danger">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-warning">Partial Match:</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {skillGap.analysis.partialSkills?.map((skill, idx) => (
                                                <span key={idx} className="badge bg-warning text-dark">{skill.skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {similarAlumni.length > 0 && (
                            <div>
                                <h6><FaUsers className="me-1" />Similar Alumni Career Paths</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {similarAlumni.slice(0, 5).map((alumni, idx) => (
                                        <div key={idx} className="card" style={{width: '200px'}}>
                                            <div className="card-body p-2">
                                                <strong>{alumni.alumni?.name || 'Alumni'}</strong>
                                                <p className="mb-0 small text-muted">
                                                    {alumni.careerJourney?.[0]?.job_title}
                                                </p>
                                                <small className="text-muted">
                                                    {alumni.careerJourney?.[0]?.company}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2 mb-2">
                                        <button 
                                            className="btn btn-primary btn-sm flex-grow-1"
                                            onClick={() => handleApplyJob(job)}
                                        >
                                            <FaEye className="me-1" /> View & Apply
                                        </button>
                                        <button 
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => handleSaveJob(job)}
                                            title="Save Job"
                                        >
                                            <FaHeart />
                                        </button>
                                        <button 
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDismissJob(job)}
                                            title="Dismiss"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
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
