import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaBuilding, FaMapMarker, FaPlus, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ViewJobs from '../admin/view/ViewJobs';
import ManageJobs from '../admin/save/ManageJobs';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';


const previewJobs = [
    {
        id: 1,
        job_title: 'Junior Frontend Developer',
        company: 'Nova Systems',
        location: 'Austin, TX',
        description: 'Build reusable React components, improve page performance, and collaborate with design to ship clean user interfaces for alumni-facing dashboards.'
    },
    {
        id: 2,
        job_title: 'Backend API Engineer',
        company: 'Orbit Labs',
        location: 'Seattle, WA',
        description: 'Design secure REST endpoints, optimize MongoDB queries, and maintain authentication flows for job applications, events, and discussion modules.'
    },
    {
        id: 3,
        job_title: 'Product Support Analyst',
        company: 'Bridgepoint Digital',
        location: 'Chicago, IL',
        description: 'Investigate user issues, document reproducible steps, and coordinate with engineering to ensure smooth releases and reliable platform experience.'
    }
];

const Careers = () => {
    const { isLoggedIn, isAdmin, isStudent } = useAuth();
    const [filteredJob, setFilteredJob] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [handleAdd, setHandleAdd] = useState(false);
    const [loading, setLoading] = useState(true);

    const openModal = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (!isLoggedIn) {
            setJobs([]);
            setFilteredJob([]);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        axios.get(`${baseUrl}/jobs`, { withCredentials: true })
            .then((res) => {
                if (!active) return;
                const safeJobs = Array.isArray(res.data)
                    ? res.data.filter((job) => job && typeof job === 'object')
                    : [];
                setJobs(safeJobs);
            })
            .catch((err) => {
                if (!active) return;
                console.log(err);
                setJobs([]);
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [isLoggedIn]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    }

    useEffect(() => {
        // Filter the forum topics based on the search query
        const query = searchQuery.toLowerCase();
        const filteredCareer = jobs.filter((career) => {
            const title = (career?.job_title || career?.title || '').toLowerCase();
            const description = (career?.description || '').toLowerCase();
            const location = (career?.location || '').toLowerCase();
            return title.includes(query) || description.includes(query) || location.includes(query);
        });
        setFilteredJob(filteredCareer);
    }, [searchQuery, jobs]);

    if (loading) {
        return <div className="text-center mt-5">Loading jobs...</div>;
    }

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Job List</h3>
                            <hr className="divider my-4" />
                            <div className="row col-md-12 mb-2 justify-content-center">
                                {isLoggedIn && !isStudent  ?
                                    <> {handleAdd ? <></> : (<button onClick={() => setHandleAdd(true)} className="btn btn-primary btn-block col-sm-4" type="button" id="new_career"><FaPlus /> Post a Job Opportunity</button>)}
                                    </> : <p className='text-white'></p>}
                                {/* <button onClick={()=>navigate("/jobs/add")} className="btn btn-primary btn-block col-sm-4" type="button" id="new_career"><FaPlus /> Post a Job Opportunity</button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {!isLoggedIn ? (
                <div className="container-fluid mt-4 pt-2 jobs-list-shell">
                    <div className="jobs-preview-stack">
                        {previewJobs.map((job) => (
                            <div className="card job-list" key={job.id}>
                                <div className="card-body">
                                    <div className="row align-items-center justify-content-center text-center h-100">
                                        <div>
                                            <h3><b className="filter-txt">{job.job_title}</b></h3>
                                            <div>
                                                <span className="filter-txt"><small><b><FaBuilding />{job.company}</b></small></span>{" "}
                                                <span className="filter-txt"><small><b><FaMapMarker />{job.location}</b></small></span>
                                            </div>
                                            <hr />
                                            <p className="truncate filter-txt">{job.description}</p>
                                            <br />
                                            <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                            <div className='jobbtn d-flex justify-content-between align-items-center '>
                                                <span className="badge badge-info ">
                                                    <b><i>Posted by: {job.company}</i></b>
                                                </span>
                                                <Link className="btn btn-sm btn-primary" to="/login">Read More</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="glass-login-cover">
                            <div className="glass-login-cover-card text-center">
                                <h4 className="mb-2">Sign in to access complete job opportunities.</h4>
                                <p className="mb-3">This is a limited preview. Log in to view full descriptions, qualifications, and apply directly.</p>
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
                                        <ManageJobs setHandleAdd={setHandleAdd} />
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
                                            <input value={searchQuery} onChange={handleSearchInputChange} type="text" className="form-control" placeholder="Filter" id="filter" aria-label="Filter" aria-describedby="filter-field" />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-primary btn-block btn-sm" id="search">Search</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {filteredJob.length > 0 ? <>
                            {/* $event = $conn->query("SELECT c.*,u.name from careers c inner join users u on u.id = c.user_id order by id desc"); */}
                            {filteredJob.map((j, index) => (
                                <div className="card job-list" key={j._id || j.id || index}>
                                    <div className="card-body">
                                        <div className="row  align-items-center justify-content-center text-center h-100">
                                            <div className="">
                                                <h3><b className="filter-txt">{j.job_title || j.title || 'Untitled Job'}</b></h3>
                                                <div>
                                                    <span className="filter-txt"><small><b><FaBuilding />{j.company || 'Unknown Company'}</b></small></span>{" "}
                                                    <span className="filter-txt"><small><b><FaMapMarker />{j.location || 'Location not specified'}</b></small></span>
                                                </div>
                                                <hr />
                                                <p dangerouslySetInnerHTML={{ __html: j.description || '' }} className="truncate filter-txt" ></p>
                                                <br />
                                                <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                                <div className='jobbtn d-flex justify-content-between align-items-center '>
                                                    <span className="badge badge-info ">
                                                        <b><i>Posted by: {j.user?.name || 'Unknown'}</i></b>
                                                    </span>
                                                    <button className="btn btn-sm  btn-primary " onClick={() => openModal(j)}>Read More</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>))}</> : <>
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <p >{searchQuery}</p>
                                <h4 className='text-info-emphasis'>No Job Available</h4>
                            </div>
                        </>}
                        <br />
                    </div></>)}
            {isModalOpen && (
                selectedJob && <ViewJobs job={selectedJob} closeModal={closeModal} />
            )}
        </>
    )
}

export default Careers
