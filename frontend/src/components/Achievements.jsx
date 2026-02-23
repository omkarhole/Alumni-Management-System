import React, { useEffect, useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaTrophy, FaCalendar, FaUser, FaFilter, FaBriefcase, FaCertification, FaAward, FaArrowUp } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';
import PostAchievement from './PostAchievement';

const Achievements = () => {
    const { theme } = useTheme();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [showPostForm, setShowPostForm] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const limit = 12;

    useEffect(() => {
        fetchAchievements(true);
    }, [selectedType]);

    const fetchAchievements = async (reset = false) => {
        try {
            setLoading(true);
            const currentSkip = reset ? 0 : skip;
            const url = `${baseUrl}/achievements?type=${selectedType}&limit=${limit}&skip=${currentSkip}`;
            const response = await axios.get(url);
            
            if (reset) {
                setAchievements(response.data.achievements);
                setSkip(limit);
            } else {
                setAchievements(prev => [...prev, ...response.data.achievements]);
                setSkip(prev => prev + limit);
            }
            
            setHasMore(response.data.hasMore);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            toast.error('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchAchievements(false);
        }
    };

    const formatDate = (timestamp) => {
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        };
        return new Date(timestamp).toLocaleDateString('en-US', options);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'promotion':
                return <FaArrowUp />;
            case 'job_change':
                return <FaBriefcase />;
            case 'certification':
                return <FaCertification />;
            case 'award':
                return <FaAward />;
            default:
                return <FaTrophy />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'promotion':
                return 'bg-success';
            case 'job_change':
                return 'bg-primary';
            case 'certification':
                return 'bg-info';
            case 'award':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'promotion':
                return 'Promotion';
            case 'job_change':
                return 'New Job';
            case 'certification':
                return 'Certification';
            case 'award':
                return 'Award';
            default:
                return 'Achievement';
        }
    };

    const handleAchievementPosted = () => {
        setShowPostForm(false);
        fetchAchievements(true);
    };

    return (
        <div className={`page-section bg-${theme}`} id="achievements">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading text-uppercase">Alumni Achievements</h2>
                    <h3 className="section-subheading text-muted">Celebrate career milestones and successes from our alumni community</h3>
                </div>

                {/* Filter and Post Button */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="btn-group" role="group">
                            <button 
                                className={`btn ${selectedType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedType('all')}
                            >
                                <FaFilter className="me-1" /> All
                            </button>
                            <button 
                                className={`btn ${selectedType === 'promotion' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedType('promotion')}
                            >
                                <FaArrowUp className="me-1" /> Promotions
                            </button>
                            <button 
                                className={`btn ${selectedType === 'job_change' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedType('job_change')}
                            >
                                <FaBriefcase className="me-1" /> New Jobs
                            </button>
                            <button 
                                className={`btn ${selectedType === 'certification' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedType('certification')}
                            >
                                <FaCertification className="me-1" /> Certifications
                            </button>
                            <button 
                                className={`btn ${selectedType === 'award' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedType('award')}
                            >
                                <FaAward className="me-1" /> Awards
                            </button>
                        </div>
                    </div>
                    <div className="col-md-6 text-md-end mt-3 mt-md-0">
                        <button 
                            className="btn btn-success"
                            onClick={() => setShowPostForm(!showPostForm)}
                        >
                            <FaTrophy className="me-1" />
                            {showPostForm ? 'Cancel' : 'Share Achievement'}
                        </button>
                    </div>
                </div>

                {/* Post Achievement Form */}
                {showPostForm && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <PostAchievement 
                                onSuccess={handleAchievementPosted} 
                                onCancel={() => setShowPostForm(false)}
                            />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : achievements.length > 0 ? (
                    <>
                        <div className="row">
                            {achievements.map((item, index) => (
                                <div className="col-lg-4 col-md-6 mb-4" key={index}>
                                    <div className="card h-100 achievement-card shadow-sm">
                                        {item.mediaUrl && (
                                            <div className="achievement-media-container">
                                                <img 
                                                    src={item.mediaUrl} 
                                                    alt={item.title}
                                                    className="card-img-top achievement-media"
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className={`badge ${getTypeColor(item.type)}`}>
                                                    {getTypeIcon(item.type)}
                                                    <span className="ms-1">{getTypeLabel(item.type)}</span>
                                                </span>
                                                <small className="text-muted">
                                                    <FaCalendar className="me-1" />
                                                    {formatDate(item.date)}
                                                </small>
                                            </div>
                                            <h5 className="card-title">{item.title}</h5>
                                            {item.company && (
                                                <p className="card-text text-muted">
                                                    <FaBriefcase className="me-1" />
                                                    {item.company}
                                                </p>
                                            )}
                                            <p className="card-text text-muted small">
                                                <FaUser className="me-1" />
                                                By {item.user?.name || 'Alumni'}
                                                {item.user?.alumnus_bio?.batch && ` (Batch ${item.user.alumnus_bio.batch})`}
                                            </p>
                                            <p className="card-text">
                                                {item.description.substring(0, 120)}
                                                {item.description.length > 120 ? '...' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {hasMore && (
                            <div className="text-center mt-4">
                                <button 
                                    className="btn btn-outline-primary"
                                    onClick={loadMore}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <FaTrophy size={50} className="text-muted mb-3" />
                        <h4 className="text-muted">No achievements yet</h4>
                        <p className="text-muted">Be the first to share your achievement!</p>
                        <button 
                            className="btn btn-success mt-2"
                            onClick={() => setShowPostForm(true)}
                        >
                            Share Achievement
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;
