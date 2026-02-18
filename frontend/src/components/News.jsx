import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaNewspaper, FaCalendar, FaUser, FaTag } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

const News = () => {
    const { theme } = useTheme();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNews();
    }, [selectedCategory]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            let url = `${baseUrl}/api/news`;
            if (selectedCategory !== 'all') {
                url = `${baseUrl}/api/news/category/${selectedCategory}`;
            }
            const response = await axios.get(url);
            setNews(response.data);
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news');
        } finally {
            setLoading(false);
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

    const getCategoryColor = (category) => {
        switch (category) {
            case 'institutional':
                return 'bg-primary';
            case 'achievement':
                return 'bg-success';
            case 'announcement':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'institutional':
                return 'Institutional';
            case 'achievement':
                return 'Alumni Achievement';
            case 'announcement':
                return 'Announcement';
            default:
                return 'News';
        }
    };

    return (
        <div className={`page-section bg-${theme}`} id="news">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading text-uppercase">News & Announcements</h2>
                    <h3 className="section-subheading text-muted">Stay updated with the latest from our alumni community</h3>
                </div>

                {/* Category Filter */}
                <div className="row mb-4">
                    <div className="col-12 text-center">
                        <div className="btn-group" role="group">
                            <button 
                                className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`btn ${selectedCategory === 'institutional' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedCategory('institutional')}
                            >
                                Institutional
                            </button>
                            <button 
                                className={`btn ${selectedCategory === 'achievement' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedCategory('achievement')}
                            >
                                Achievements
                            </button>
                            <button 
                                className={`btn ${selectedCategory === 'announcement' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedCategory('announcement')}
                            >
                                Announcements
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : news.length > 0 ? (
                    <div className="row">
                        {news.map((item, index) => (
                            <div className="col-lg-4 col-md-6 mb-4" key={index}>
                                <div className="card h-100 news-card shadow-sm">
                                    {item.banner && (
                                        <div className="news-banner-container">
                                            <img 
                                                src={item.banner} 
                                                alt={item.title}
                                                className="card-img-top news-banner"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className={`badge ${getCategoryColor(item.category)}`}>
                                                <FaTag className="me-1" />
                                                {getCategoryLabel(item.category)}
                                            </span>
                                            <small className="text-muted">
                                                <FaCalendar className="me-1" />
                                                {formatDate(item.createdAt)}
                                            </small>
                                        </div>
                                        <h5 className="card-title">{item.title}</h5>
                                        <p className="card-text text-muted">
                                            <FaUser className="me-1" />
                                            By {item.author?.name || 'Admin'}
                                        </p>
                                        <div 
                                            className="card-text news-content"
                                            dangerouslySetInnerHTML={{ 
                                                __html: item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '') 
                                            }}
                                        />
                                    </div>
                                    <div className="card-footer bg-transparent border-0">
                                        <button 
                                            className="btn btn-primary btn-sm w-100"
                                            onClick={() => navigate(`/news/${item._id}`)}
                                        >
                                            Read More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <FaNewspaper size={50} className="text-muted mb-3" />
                        <h4 className="text-muted">No news available</h4>
                        <p className="text-muted">Check back later for updates</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
