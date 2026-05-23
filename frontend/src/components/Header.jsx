import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaAngleDown, FaBell, FaCog, FaPowerOff, FaBars } from 'react-icons/fa'; // Import FaBars from react-icons
import { MdDashboard } from "react-icons/md";
import logo from "../assets/uploads/logo.png";
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import axios from 'axios';
import { Fade as Hamburger } from 'hamburger-react'
import { authUrl, messagesUrl } from '../utils/globalurl';
import apiClient from '../api/client';
import { FaMessage } from "react-icons/fa6";
import ThemeToggle from './ThemeToggle';

const Header = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { logout, isLoggedIn, isAdmin, isStudent } = useAuth();

const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [name, setName] = useState();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'headnavactive' : '';
    };

useEffect(() => {
        const user_name = localStorage.getItem("user_name");
        setName(user_name);
        
        // Fetch unread message count if logged in
        if (isLoggedIn) {
            fetchUnreadCount();
            fetchNotifications();
        }
    }, [location.state, isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            setNotifications([]);
            setUnreadNotifications(0);
            return;
        }

        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 60000);

        return () => clearInterval(intervalId);
    }, [isLoggedIn]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${messagesUrl}/messages/unread-count`, {
                withCredentials: true
            });
            if (response.data?.unreadCount) {
                setUnreadMessages(response.data.unreadCount);
            }
        } catch (error) {
            setUnreadMessages(0);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/notifications', { params: { limit: 5 } });
            setNotifications(response.data?.notifications || []);
            setUnreadNotifications(response.data?.unreadCount || 0);
        } catch (error) {
            setNotifications([]);
            setUnreadNotifications(0);
        }
    };

    const handleNotificationOpen = async (notification) => {
        try {
            if (!notification.isRead) {
                await apiClient.patch(`/notifications/${notification._id || notification.id}/read`);
            }
        } catch (error) {
            // Ignore mark-read failures and still navigate.
        }

        setIsNotificationsOpen(false);

        if (notification.entityType === 'referral' && notification.entityId) {
            navigate(`/referrals/${notification.entityId}`);
            return;
        }

        if (notification.entityType === 'career') {
            navigate('/jobs');
            return;
        }

        navigate('/notifications');
    };

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (navRef.current && !navRef.current.contains(event.target)) {
    //             setIsMenuOpen(false);
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, [navRef]);

    const handleLogout = () => {
        axios.post(`${authUrl}/logout`, {}, { withCredentials: true })
            .then((res) => {
                navigate("/", { state: { action: "homelogout" } })
                localStorage.clear();
                logout();
            });
    };

    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-${theme} fixed-top`} id="mainNav">
                <div className="container">
                    <Link className="navbar-brand js-scroll-trigger" to="/"><img src={logo} className='logoimg' /></Link>
                    <button className="navbar-toggler navbar-light" type="button"  >
                        <Hamburger  hideOutline={false} rounded color="#FFFFFF" toggled={isMenuOpen} toggle={setIsMenuOpen}  />
                    </button>
                    <div ref={navRef} className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarResponsive">
                        <ul className="navbar-nav ml-auto my-2 my-lg-0">
                            <li className="nav-item">
                                <ThemeToggle />
                            </li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/")}`} to="/">Home</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/alumni")}`} to="/alumni">Alumni</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/gallery")}`} to="/gallery">Gallery</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/jobs")}`} to="/jobs">Jobs</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/job-recommendations")}`} to="/job-recommendations">Job Recommendations</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/mentorship")}`} to="/mentorship">Mentorship</Link></li>
                            {isLoggedIn && (
                                <li className="nav-item dropdown position-relative">
                                    <button
                                        type="button"
                                        className={`nav-link js-scroll-trigger btn btn-link text-decoration-none ${isNotificationsOpen ? 'headnavactive' : ''}`}
                                        onClick={() => setIsNotificationsOpen((currentValue) => !currentValue)}
                                    >
                                        <span className="d-flex align-items-center gap-1">
                                            <FaBell />
                                            Alerts
                                            {unreadNotifications > 0 && (
                                                <span className="badge bg-danger rounded-pill ms-1">
                                                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                    {isNotificationsOpen && (
                                        <div className="dropdown-menu dropdown-menu-end show p-0 shadow-lg" style={{ minWidth: '340px', maxWidth: '92vw' }}>
                                            <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                                                <strong>Smart notifications</strong>
                                                <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="small text-primary text-decoration-none">Open page</Link>
                                            </div>
                                            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div className="p-3 text-muted small">No notifications yet.</div>
                                                ) : notifications.map((notification) => (
                                                    <button
                                                        key={notification._id || notification.id}
                                                        type="button"
                                                        className={`dropdown-item text-start py-3 ${notification.isRead ? '' : 'bg-light'}`}
                                                        onClick={() => handleNotificationOpen(notification)}
                                                    >
                                                        <div className="d-flex align-items-start justify-content-between gap-2">
                                                            <div>
                                                                <div className="small text-uppercase text-muted mb-1">{notification.type}</div>
                                                                <div className="fw-semibold">{notification.title}</div>
                                                                <div className="small text-muted">{notification.message}</div>
                                                            </div>
                                                            {!notification.isRead && <span className="badge bg-warning text-dark">New</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="px-3 py-2 border-top bg-light">
                                                <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="btn btn-sm btn-primary w-100">View all notifications</Link>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            )}
                            {isLoggedIn && (
                                <li className="nav-item">
                                    <Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/messages")}`} to="/messages">
                                        <span className="d-flex align-items-center gap-1">
                                            <FaMessage />
                                            Messages
                                            {unreadMessages > 0 && (
                                                <span className="badge bg-danger rounded-pill ms-1">
                                                    {unreadMessages > 99 ? '99+' : unreadMessages}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            )}
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/forums")}`} to="/forums">Forums</Link></li>

                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/news")}`} to="/news">News</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/businesses")}`} to="/businesses">Businesses</Link></li>
                            <li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/about")}`} to="/about">About</Link></li>
                            {isLoggedIn ? <></> : (<li className="nav-item"><Link onClick={toggleMenu} className={`nav-link js-scroll-trigger ${isActive("/login")}`} to="/login" id="login">Login</Link></li>)}
                            {isLoggedIn ? (<li className="nav-item dropdown">
                                <Link className="nav-link " role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {name}<FaAngleDown />
                                </Link>
                                <ul className="dropdown-menu ">
                                    {isStudent && <li><Link onClick={toggleMenu} className="dropdown-item " to="student-dashboard" ><MdDashboard /> Dashboard</Link></li>}
                                    {isAdmin && <li><Link onClick={toggleMenu} className="dropdown-item " to="dashboard" ><MdDashboard /> Dashboard</Link></li>}
                                    {!isAdmin && <li><Link onClick={toggleMenu} className="dropdown-item" to="account" ><FaCog /> Manage Account</Link></li>}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}><FaPowerOff /> Logout</button></li>
                                </ul>
                            </li>) : <></>}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header;
