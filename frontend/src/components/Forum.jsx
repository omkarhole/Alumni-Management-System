import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaComments, FaPlus, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ManageForum from '../admin/save/ManageForum';
import { baseUrl } from '../utils/globalurl';
import SmartSearchBar from './SmartSearchBar';
import SmartFilterDropdown from './SmartFilterDropdown';

const previewForums = [
    {
        id: 1,
        title: 'How to prepare for campus interviews in 30 days',
        description: 'Share your interview prep roadmap, mock interview resources, and practical tips for final-year students targeting product and service-based companies.',
        author: 'Career Support Team',
        commentsCount: 14
    },
    {
        id: 2,
        title: 'Resume review thread for software roles',
        description: 'Post your resume summary and get actionable feedback on structure, project highlights, ATS readability, and impact-focused bullet points.',
        author: 'Alumni Mentors',
        commentsCount: 22
    },
    {
        id: 3,
        title: 'Remote internship opportunities and referrals',
        description: 'Discuss currently open remote internships, referral requirements, and application timelines for students interested in web and data roles.',
        author: 'Placement Cell',
        commentsCount: 9
    }
];

const Forum = () => {
    const { isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(true);
    const [forum, setForum] = useState([]);
    const [filteredForum, setFilteredForum] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [handleAdd, setHandleAdd] = useState(false);
    const [authorFilter, setAuthorFilter] = useState('all');
    const [commentsFilter, setCommentsFilter] = useState('all');
    const [sortBy, setSortBy] = useState('active');

    useEffect(() => {
        if (!isLoggedIn) {
            setForum([]);
            setFilteredForum([]);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        axios.get(`${baseUrl}/forums`, { withCredentials: true })
            .then((res) => {
                if (!active) return;
                const safeForum = Array.isArray(res.data)
                    ? res.data.filter((topic) => topic && typeof topic === 'object')
                    : [];
                setForum(safeForum);
            })
            .catch((err) => {
                if (!active) return;
                console.log(err);
                setForum([]);
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [isLoggedIn]);

    const handleView = (e) => {
        navigate("/forum/view", { state: { action: "view", data: e } });
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const authorOptions = useMemo(() => {
        const uniqueAuthors = new Set();
        forum.forEach((topic) => {
            const authorName = (topic?.user?.name || '').trim();
            if (authorName) {
                uniqueAuthors.add(authorName);
            }
        });
        return Array.from(uniqueAuthors).sort((a, b) => a.localeCompare(b));
    }, [forum]);

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        let filteredTopics = forum.filter((topic) => {
            const title = (topic?.title || '').toLowerCase();
            const description = (topic?.description || '').toLowerCase();
            const author = (topic?.user?.name || '').toLowerCase();
            if (!query) return true;
            return title.includes(query) || description.includes(query) || author.includes(query);
        });

        if (authorFilter !== 'all') {
            filteredTopics = filteredTopics.filter((topic) => (topic?.user?.name || '') === authorFilter);
        }

        const getCommentsCount = (topic) => (Array.isArray(topic?.comments) ? topic.comments.length : 0);

        if (commentsFilter === '1') {
            filteredTopics = filteredTopics.filter((topic) => getCommentsCount(topic) >= 1);
        } else if (commentsFilter === '5') {
            filteredTopics = filteredTopics.filter((topic) => getCommentsCount(topic) >= 5);
        } else if (commentsFilter === '10') {
            filteredTopics = filteredTopics.filter((topic) => getCommentsCount(topic) >= 10);
        }

        const getTimestamp = (topic) => {
            const raw = topic?.createdAt || topic?.created_at || '';
            const parsed = Date.parse(raw);
            return Number.isNaN(parsed) ? 0 : parsed;
        };

        if (sortBy === 'recent') {
            filteredTopics = [...filteredTopics].sort((a, b) => getTimestamp(b) - getTimestamp(a));
        } else if (sortBy === 'title-asc') {
            filteredTopics = [...filteredTopics].sort((a, b) => (a?.title || '').localeCompare(b?.title || ''));
        } else {
            filteredTopics = [...filteredTopics].sort((a, b) => getCommentsCount(b) - getCommentsCount(a));
        }

        setFilteredForum(filteredTopics);
    }, [authorFilter, commentsFilter, forum, searchQuery, sortBy]);

    const resetFilters = () => {
        setSearchQuery('');
        setAuthorFilter('all');
        setCommentsFilter('all');
        setSortBy('active');
    };
    if (loading) {
        return <div className="text-center mt-5">Loading forums...</div>;
    }

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Forum List</h3>
                            <hr className="divider my-4" />
                            
                            
                        </div>

                    </div>
                </div>
            </header>
            {!isLoggedIn ? (
                <div className="container-fluid mt-4 pt-2 jobs-list-shell">
                    <div className="jobs-preview-stack">
                        {previewForums.map((topic) => (
                            <div className="card job-list" key={topic.id}>
                                <div className="card-body">
                                    <div className="row align-items-center justify-content-center text-center h-100">
                                        <div>
                                            <h3><b className="filter-txt">{topic.title}</b></h3>
                                            <hr />
                                            <p className="truncate filter-txt">{topic.description}</p>
                                            <br />
                                            <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                            <div className='forumbtn d-flex justify-content-between align-items-center'>
                                                <div>
                                                    <span className="badge badge-info me-1 px-3">
                                                        <b><i>Created by: <span className="filter-txt">{topic.author}</span></i></b>
                                                    </span>
                                                    <span className="badge badge-secondary px-3">
                                                        <b><FaComments /> <i> {topic.commentsCount}</i></b>
                                                    </span>
                                                </div>

                                                <Link className="btn btn-primary btn-sm" to="/login">View Topic</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="glass-login-cover">
                            <div className="glass-login-cover-card text-center">
                                <h4 className="mb-2">Sign in to access complete forum discussions.</h4>
                                <p className="mb-3">You are viewing a limited preview. Log in to read full threads, post replies, and join the conversation.</p>
                                <Link className="btn btn-primary btn-sm" to="/login">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : handleAdd ?
                (<>
                    <div className="container mt-5  pt-2">
                        <div className="col-lg-12">
                            <div className="card mb-4">
                                <div className="card-body">
                                    <div className="row justify-content-center">
                                        <ManageForum setHandleAdd={setHandleAdd} />
                                    </div></div></div></div></div>
                </>) : (<>
                    <div className="container-fluid mt-3 pt-2 jobs-list-shell">
                        <div className="card mb-4 jobs-filter-card">
                            <div className="card-body">
                                <SmartSearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search topics by title or content..."
                                    inputId="forums-filter"
                                    buttonId="forums-search"
                                    entityLabel="topics"
                                    resultsCount={filteredForum.length}
                                    totalCount={forum.length}
                                >
                                    <SmartFilterDropdown
                                        label="Author"
                                        value={authorFilter}
                                        onChange={setAuthorFilter}
                                        options={[
                                            { value: 'all', label: 'All' },
                                            ...authorOptions.map((authorName) => ({ value: authorName, label: authorName }))
                                        ]}
                                    />
                                    <SmartFilterDropdown
                                        label="Sort"
                                        value={sortBy}
                                        onChange={setSortBy}
                                        options={[
                                            { value: 'active', label: 'Most Active' },
                                            { value: 'recent', label: 'Most Recent' },
                                            { value: 'title-asc', label: 'Title A-Z' },
                                        ]}
                                    />
                                    <div className="smart-chip-group" role="group" aria-label="Minimum comments filter">
                                        {[
                                            { label: 'All', value: 'all' },
                                            { label: '1+ Comments', value: '1' },
                                            { label: '5+ Comments', value: '5' },
                                            { label: '10+ Comments', value: '10' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={`smart-filter-chip ${commentsFilter === option.value ? 'active' : ''}`}
                                                onClick={() => setCommentsFilter(option.value)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" className="btn btn-outline-secondary btn-sm smart-filter-reset" onClick={resetFilters}>
                                        Reset
                                    </button>
                                </SmartSearchBar>

                            </div>
                        </div>
                        {filteredForum.length > 0 ? <>
                            {filteredForum.map((e, index) => (
                                <div className="card job-list" key={e._id || e.id || index}>
                                    <div className="card-body">
                                        <div className="row align-items-center justify-content-center text-center h-100">
                                            <div>
                                                <h3><b className="filter-txt">{e.title}</b></h3>
                                                <hr />
                                                <p className="truncate filter-txt" dangerouslySetInnerHTML={{ __html: e.description }} ></p>

                                                <br />
                                                <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                                <div className='forumbtn d-flex justify-content-between align-items-center'>
                                                    <div>
                                                        <span className="badge badge-info me-1 px-3">
                                                            <b><i>Created by: <span className="filter-txt">{e.user?.name || 'Unknown'}</span></i></b>
                                                        </span>
                                                        <span className="badge badge-secondary px-3">
                                                            <b><FaComments /> <i> {e.comments?.length || 0}</i></b>
                                                        </span>
                                                    </div>

                                                    <button className="btn btn-primary btn-sm" onClick={() => handleView(e)}>View Topic</button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>))}</> : <>
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <p >{searchQuery}</p>
                                <h4 className='text-info-emphasis'>No Topic Available</h4>
                            </div>
                        </>}
                        <br />
                    </div></>)}
        </>
    )
}

export default Forum
