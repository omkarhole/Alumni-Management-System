import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaCrown, FaUsers } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { badgeUrl } from '../utils/globalurl';

const Leaderboard = () => {
    const { theme } = useTheme();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('all');

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/leaderboard?limit=20&timeframe=${timeframe}`, {
                withCredentials: true
            });
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <FaCrown className="text-warning" />;
            case 2:
                return <FaMedal className="text-secondary" />;
            case 3:
                return <FaMedal className="text-danger" />;
            default:
                return <span className="text-muted">#{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return { backgroundColor: '#fff3cd', borderColor: '#ffc107' };
            case 2:
                return { backgroundColor: '#f8f9fa', borderColor: '#6c757d' };
            case 3:
                return { backgroundColor: '#fff5f5', borderColor: '#dc3545' };
            default:
                return {};
        }
    };

    return (
        <div className={`page-section bg-${theme}`} id="leaderboard">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading text-uppercase">
                        <FaTrophy className="me-2" />
                        Top Contributors
                    </h2>
                    <h3 className="section-subheading text-muted">
                        Celebrating our most active alumni community members
                    </h3>
                </div>

                {/* Timeframe Filter */}
                <div className="row mb-4">
                    <div className="col-md-6 mx-auto">
                        <div className="btn-group w-100" role="group">
                            <button
                                className={`btn ${timeframe === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setTimeframe('month')}
                            >
                                This Month
                            </button>
                            <button
                                className={`btn ${timeframe === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setTimeframe('year')}
                            >
                                This Year
                            </button>
                            <button
                                className={`btn ${timeframe === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setTimeframe('all')}
                            >
                                All Time
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
                ) : leaderboard.length > 0 ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            {leaderboard.map((entry, index) => (
                                <div
                                    key={index}
                                    className="card mb-3 leaderboard-card"
                                    style={{
                                        ...getRankStyle(index + 1),
                                        borderWidth: index < 3 ? '2px' : '1px',
                                        borderStyle: index < 3 ? 'solid' : 'none'
                                    }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="rank-icon me-3"
                                                style={{ width: '40px', textAlign: 'center', fontSize: '1.25rem' }}
                                            >
                                                {getRankIcon(index + 1)}
                                            </div>
                                            <div className="user-avatar me-3">
                                                {entry.userAvatar ? (
                                                    <img
                                                        src={entry.userAvatar}
                                                        alt={entry.userName}
                                                        className="rounded-circle"
                                                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                                        style={{ width: '48px', height: '48px', color: '#fff' }}
                                                    >
                                                        {entry.userName?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h5 className="mb-0">{entry.userName}</h5>
                                                {entry.userBatch && (
                                                    <small className="text-muted">Batch {entry.userBatch}</small>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="badge bg-primary fs-6">
                                                        {entry.totalPoints} pts
                                                    </span>
                                                    <span className="badge bg-secondary">
                                                        <FaUsers className="me-1" />
                                                        {entry.badgeCount} badges
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <FaTrophy size={50} className="text-muted mb-3" />
                        <h4 className="text-muted">No data available</h4>
                        <p className="text-muted">Be the first to earn badges and top the leaderboard!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
