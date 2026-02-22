import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiArrowRight,
    FiBook,
    FiBriefcase,
    FiClipboard,
    FiMessageSquare,
    FiTool,
    FiTrendingUp,
    FiUsers
} from 'react-icons/fi';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import imgcs from '../assets/uploads/imgcs.jpg';
import { baseUrl } from '../utils/globalurl';
import Newsletter from './Newsletter';

const benefitCards = [
    {
        key: 'career',
        icon: FiClipboard,
        title: 'Career Support',
        summary: 'Mentorship, interview prep, and alumni-led guidance for every stage.',
        detail: 'Book focused sessions with alumni mentors to review resumes, portfolios, and hiring strategy.'
    },
    {
        key: 'library',
        icon: FiBook,
        title: 'Learning Library',
        summary: 'Access curated playbooks, resources, and community knowledge.',
        detail: 'Explore interview banks, project ideas, and alumni-authored guides in one place.'
    },
    {
        key: 'sports',
        icon: FiTool,
        title: 'Campus Facilities',
        summary: 'Continue using selected campus sports and recreation spaces.',
        detail: 'Stay connected to campus life with alumni facility access and community activities.'
    },
    {
        key: 'network',
        icon: FiUsers,
        title: 'Alumni Network',
        summary: 'Find graduates by role, batch, and domain to unlock opportunities.',
        detail: 'Build relationships that open doors to referrals, collaborations, and long-term support.'
    }
];

const quickLinks = [
    {
        key: 'jobs',
        title: 'Explore Jobs',
        description: 'Discover fresh opportunities shared by alumni and recruiters.',
        to: '/jobs',
        icon: FiBriefcase
    },
    {
        key: 'forums',
        title: 'Join Forums',
        description: 'Ask questions, share wins, and get tactical feedback quickly.',
        to: '/forums',
        icon: FiMessageSquare
    },
    {
        key: 'alumni',
        title: 'Browse Alumni',
        description: 'Search the directory and connect with professionals in your field.',
        to: '/alumni',
        icon: FiTrendingUp
    }
];

const summarizeHtml = (html = '') =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const Home = () => {
    const { theme } = useTheme();
    const { isLoggedIn, isAdmin } = useAuth();
    const [events, setEvents] = useState([]);
    const [activeBenefit, setActiveBenefit] = useState(0);
    const [eventView, setEventView] = useState('soonest');
    const [benefitTilt, setBenefitTilt] = useState({});
    const [statValues, setStatValues] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn && location.state?.action === 'homelogin') {
            const userName = localStorage.getItem('user_name') || 'back';
            toast.success(`Welcome ${userName}`);
        }
        if (location.state?.action === 'homelogout') {
            toast.info('Logout Success');
        }
    }, [isLoggedIn, location.state]);

    useEffect(() => {
        let active = true;
        axios.get(`${baseUrl}/events/upcoming`)
            .then((res) => {
                if (!active) return;
                const safeEvents = Array.isArray(res.data)
                    ? res.data.filter((event) => event && typeof event === 'object')
                    : [];
                setEvents(safeEvents);
            })
            .catch((err) => console.log(err));

        return () => {
            active = false;
        };
    }, []);

    const statTargets = useMemo(() => ([
        { key: 'members', label: 'Community Members', value: 12000, suffix: '+' },
        { key: 'events', label: 'Live Events', value: Math.max(events.length, 18), suffix: '+' },
        { key: 'tracks', label: 'Benefit Tracks', value: benefitCards.length, suffix: '' },
        { key: 'match', label: 'Mentor Match Rate', value: 92, suffix: '%' }
    ]), [events.length]);

    useEffect(() => {
        let animationFrameId;
        let startTime = null;
        const duration = 920;

        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextValues = {};

            statTargets.forEach((stat) => {
                nextValues[stat.key] = Math.round(stat.value * eased);
            });
            setStatValues(nextValues);

            if (progress < 1) {
                animationFrameId = window.requestAnimationFrame(animate);
            }
        };

        animationFrameId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [statTargets]);

    const sortedEvents = useMemo(() => {
        const list = [...events];
        if (eventView === 'latest') {
            return list.sort((a, b) => {
                const aStamp = Date.parse(a?.createdAt || a?.schedule || '');
                const bStamp = Date.parse(b?.createdAt || b?.schedule || '');
                return (Number.isNaN(bStamp) ? 0 : bStamp) - (Number.isNaN(aStamp) ? 0 : aStamp);
            });
        }
        return list.sort((a, b) => {
            const aStamp = Date.parse(a?.schedule || '');
            const bStamp = Date.parse(b?.schedule || '');
            return (Number.isNaN(aStamp) ? 0 : aStamp) - (Number.isNaN(bStamp) ? 0 : bStamp);
        });
    }, [eventView, events]);

    const featuredEvents = sortedEvents.slice(0, 3);

    const formatDate = (timestamp) => {
        const parsed = Date.parse(timestamp);
        if (Number.isNaN(parsed)) return 'Schedule to be announced';
        return new Date(parsed).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    const handleBenefitMove = (index, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const pointX = (event.clientX - rect.left) / rect.width;
        const pointY = (event.clientY - rect.top) / rect.height;
        const rotateY = (pointX - 0.5) * 12;
        const rotateX = (0.5 - pointY) * 12;
        setBenefitTilt((prev) => ({ ...prev, [index]: { rotateX, rotateY } }));
    };

    const handleBenefitLeave = (index) => {
        setBenefitTilt((prev) => ({ ...prev, [index]: { rotateX: 0, rotateY: 0 } }));
    };

    return (
        <div className={`home-page ${theme === 'dark' ? 'home-theme-dark' : 'home-theme-light'}`}>
<section className="home-hero">
                <img src={imgcs} alt="" className="home-hero-image" />
                <div className="home-hero-mask" />
                <motion.div
                    className="home-orb home-orb-one"
                    animate={{ x: [0, 14, -8, 0], y: [0, -10, 7, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="home-orb home-orb-two"
                    animate={{ x: [0, -16, 10, 0], y: [0, 8, -12, 0] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="container home-hero-container">
                    <div className="row align-items-center g-4">
                        <motion.div
                            className="col-lg-7"
                            initial={{ opacity: 0, y: 26 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                            <span className="home-kicker">ALUMNI HUB</span>
                            <h1 className="home-hero-title">Build connections that outlast graduation.</h1>
                            <p className="home-hero-subtitle">
                                Collaborate with mentors, discover curated opportunities, and stay plugged into
                                events that keep your professional network active.
                            </p>
                            <div className="home-hero-actions">
                                {!isAdmin && (
                                    <Link className="btn btn-primary btn-lg home-pill-btn" to="/about">
                                        Find Out More
                                    </Link>
                                )}
                                {!isLoggedIn && (
                                    <Link className="btn btn-light btn-lg home-pill-btn" to="/login">
                                        Login
                                    </Link>
                                )}
                                {isLoggedIn && isAdmin && (
                                    <Link className="btn btn-primary btn-lg home-pill-btn" to="/dashboard">
                                        Admin Dashboard
                                    </Link>
                                )}
                                {isLoggedIn && !isAdmin && (
                                    <Link className="btn btn-light btn-lg home-pill-btn" to="/account">
                                        My Profile
                                    </Link>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            className="col-lg-5"
                            initial={{ opacity: 0, x: 28 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                            <div className="home-hero-panel">
                                <h3 className="home-panel-heading">Community Pulse</h3>
                                <div className="home-stat-grid">
                                    {statTargets.map((stat) => (
                                        <div key={stat.key} className="home-stat-item">
                                            <span className="home-stat-value">
                                                {statValues[stat.key] ?? 0}
                                                {stat.suffix}
                                            </span>
                                            <span className="home-stat-label">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="home-quick-links">
                                    {quickLinks.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link key={item.key} to={item.to} className="home-quick-link">
                                                <Icon size={18} />
                                                <span className="home-quick-link-copy">
                                                    <strong>{item.title}</strong>
                                                    <small>{item.description}</small>
                                                </span>
                                                <FiArrowRight size={16} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <div className="home-mid-surface">
                <section className="home-section home-benefits" id="alumni-benefits">
                    <div className="container">
                    <motion.div
                        className="home-section-head text-center"
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.55 }}
                    >
                        <span className="home-section-tag">Why Alumni Stay Active</span>
                        <h2 className="section-heading text-uppercase">Alumni Benefits</h2>
                        <p className="home-section-summary">
                            Unlock practical services designed to strengthen your network and career progression.
                        </p>
                    </motion.div>

                    <div className="row g-4">
                        {benefitCards.map((benefit, index) => {
                            const Icon = benefit.icon;
                            const currentTilt = benefitTilt[index] || { rotateX: 0, rotateY: 0 };

                            return (
                                <motion.div
                                    key={benefit.key}
                                    className="col-sm-6 col-xl-3"
                                    initial={{ opacity: 0, y: 22 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.25 }}
                                    transition={{ duration: 0.55, delay: index * 0.08 }}
                                >
                                    <motion.article
                                        className={`home-benefit-card ${activeBenefit === index ? 'active' : ''}`}
                                        animate={{
                                            rotateX: currentTilt.rotateX,
                                            rotateY: currentTilt.rotateY,
                                            y: activeBenefit === index ? -6 : 0
                                        }}
                                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                        onMouseMove={(event) => handleBenefitMove(index, event)}
                                        onMouseLeave={() => handleBenefitLeave(index)}
                                        onMouseEnter={() => setActiveBenefit(index)}
                                        onFocus={() => setActiveBenefit(index)}
                                        tabIndex={0}
                                    >
                                        <div className="home-benefit-icon">
                                            <Icon size={24} />
                                        </div>
                                        <h4>{benefit.title}</h4>
                                        <p>{benefit.summary}</p>
                                    </motion.article>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        className="home-benefit-focus"
                        key={benefitCards[activeBenefit].key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <strong>{benefitCards[activeBenefit].title}</strong>
                        <p>{benefitCards[activeBenefit].detail}</p>
                    </motion.div>
                    </div>
                </section>

                <section className="home-section home-events" id="upcoming-events">
                    <div className="container">
                    <motion.div
                        className="home-events-head"
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55 }}
                    >
                        <div>
                            <h2 className="section-heading">Upcoming Events</h2>
                            <p className="home-section-summary mb-0">
                                Switch views to browse nearest schedules or recently added activities.
                            </p>
                        </div>
                        <div className="home-event-toggle" role="group" aria-label="Event sorting">
                            <button
                                type="button"
                                className={`home-event-toggle-btn ${eventView === 'soonest' ? 'active' : ''}`}
                                onClick={() => setEventView('soonest')}
                            >
                                Soonest
                            </button>
                            <button
                                type="button"
                                className={`home-event-toggle-btn ${eventView === 'latest' ? 'active' : ''}`}
                                onClick={() => setEventView('latest')}
                            >
                                Latest
                            </button>
                        </div>
                    </motion.div>

                    {featuredEvents.length > 0 ? (
                        <div className="row g-4">
                            {featuredEvents.map((event, index) => {
                                const summary = summarizeHtml(event.content);
                                return (
                                    <div className="col-md-6 col-xl-4" key={event._id || event.id || index}>
                                        <motion.article
                                            className="home-event-card"
                                            initial={{ opacity: 0, y: 22 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -8 }}
                                            viewport={{ once: true, amount: 0.25 }}
                                            transition={{ duration: 0.45, delay: index * 0.07 }}
                                        >
                                            <span className="home-event-date">
                                                <FaCalendar className="me-2" />
                                                {formatDate(event.schedule)}
                                            </span>
                                            <h3>{event.title || 'Untitled Event'}</h3>
                                            <p className="home-event-location">
                                                <FaMapMarkerAlt className="me-2" />
                                                {event.location || event.venue || 'Campus / Online'}
                                            </p>
                                            <p className="home-event-content">
                                                {summary.slice(0, 170) || 'Details will be announced soon.'}
                                                {summary.length > 170 ? '...' : ''}
                                            </p>
                                            <button
                                                className="btn btn-primary btn-sm home-read-btn"
                                                onClick={() => navigate('/events/view', { state: { action: 'view', data: event } })}
                                            >
                                                Read More <FiArrowRight className="ms-1" />
                                            </button>
                                        </motion.article>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            className="home-empty-events"
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.45 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h4>No Upcoming Event Available</h4>
                            <p>Check back soon. New gatherings and sessions are published regularly.</p>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/forums')}>
                                Visit Community Forums
                            </button>
                        </motion.div>
                    )}
                    </div>
                </section>
            </div>

            <div className="home-tail-surface">
                <section className="home-section home-cta-band">
                    <div className="container">
                        <motion.div
                            className="home-cta-inner"
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3>Move your alumni journey forward today.</h3>
                            <p>
                                Track opportunities, stay visible in the network, and participate in events that shape your next move.
                            </p>
                            <div className="home-cta-actions">
                                <Link className="btn btn-primary btn-lg home-pill-btn" to="/jobs">Browse Jobs</Link>
                                <Link className="btn btn-outline-light btn-lg home-pill-btn" to="/forums">Join Discussions</Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Newsletter />
            </div>
        </div>
    );
};

export default Home;

