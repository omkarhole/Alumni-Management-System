import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaComments, FaPlus, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ManageForum from '../admin/save/ManageForum';
import { baseUrl } from '../utils/globalurl';

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

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    }

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filteredTopics = forum.filter((topic) => {
            const title = (topic?.title || '').toLowerCase();
            const description = (topic?.description || '').toLowerCase();
            return title.includes(query) || description.includes(query);
        });
        setFilteredForum(filteredTopics);
    }, [searchQuery, forum]);

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
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="input-group mb-3">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="filter-field"><FaSearch /></span>
                                            </div>
                                            <input value={searchQuery} onChange={handleSearchInputChange} type="text" className="form-control" id="filter" placeholder="Filter" aria-label="Filter" aria-describedby="filter-field" />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-primary btn-block btn-sm" id="search">Search</button>
                                    </div>
                                </div>

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
