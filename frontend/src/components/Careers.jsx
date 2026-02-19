import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaBuilding, FaMapMarker, FaPlus, FaSearch, FaStar, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ViewJobs from '../admin/view/ViewJobs';
// import { useNavigate } from 'react-router-dom';
import ManageJobs from '../admin/save/ManageJobs';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';



const Careers = () => {
    const { isLoggedIn, isAdmin, isStudent } = useAuth();
    const [filteredJob, setFilteredJob] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [handleAdd, setHandleAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);


    const openModal = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        axios.get(`${baseUrl}/jobs`, { withCredentials: true })
            .then((res) => {
                console.log(res.data);
                setJobs(res.data);
                setLoading(false);
            })
            .catch((err) => console.log(err));
    }, []);

    // Fetch recommendations for logged in users
    useEffect(() => {
        if (isLoggedIn) {
            axios.get(`${baseUrl}/jobs/recommendations`, { withCredentials: true })
                .then((res) => {
                    setRecommendations(res.data.slice(0, 3)); // Show top 3 recommendations
                })
                .catch((err) => console.log('Error fetching recommendations:', err));
        }
    }, [isLoggedIn]);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    }

    useEffect(() => {
        // Filter the forum topics based on the search query
        const filteredCareer = jobs.filter(career =>
            career.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            career.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            career.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
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
            {/* Recommended Jobs Section */}
            {isLoggedIn && recommendations.length > 0 && !handleAdd && (
                <div className="container mt-3 pt-2">
                    <div className="card mb-4 border-warning">
                        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <FaStar className="me-2" />
                                Recommended For You
                            </h5>
                            <Link to="/job-recommendations" className="btn btn-sm btn-dark">
                                View All <FaArrowRight />
                            </Link>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {recommendations.map((job, index) => (
                                    <div className="col-md-4 mb-3" key={index}>
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="card-title mb-0">{job.job_title}</h6>
                                                    <span className="badge bg-success">{job.matchPercentage}% Match</span>
                                                </div>
                                                <p className="card-text text-muted small mb-2">
                                                    <FaBuilding className="me-1" />{job.company}
                                                </p>
                                                {job.matchedSkills && job.matchedSkills.length > 0 && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">Matched: </small>
                                                        {job.matchedSkills.slice(0, 3).map((skill, idx) => (
                                                            <span key={idx} className="badge bg-success me-1">{skill}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <button 
                                                    className="btn btn-sm btn-outline-primary w-100"
                                                    onClick={() => openModal(job)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {handleAdd ?
                (<>
                    <div className="container mt-5  pt-2">

                        <div className="col-lg-12">
                            <div className="card mb-4">
                                <div className="card-body">
                                    <div className="row justify-content-center">
                                        <ManageJobs setHandleAdd={setHandleAdd} />
                                    </div></div></div></div></div>
                </>) : (<>
                    <div className="container mt-3 pt-2">
                        <div className="card mb-4">
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
                                <div className="card job-list" key={index}>
                                    <div className="card-body">
                                        <div className="row  align-items-center justify-content-center text-center h-100">
                                            <div className="">
                                                <h3><b className="filter-txt">{j.title}</b></h3>
                                                <div>
                                                    <span className="filter-txt"><small><b><FaBuilding />{j.company}</b></small></span>{" "}
                                                    <span className="filter-txt"><small><b><FaMapMarker />{j.location}</b></small></span>
                                                </div>
                                                <hr />
                                                <p dangerouslySetInnerHTML={{ __html: j.description }} className="truncate filter-txt" ></p>
                                                <br />
                                                <hr className="divider" style={{ maxWidth: "calc(80%)" }} />
                                                <div className='jobbtn d-flex justify-content-between align-items-center '>
                                                    <span className="badge badge-info ">
                                                        <b><i>Posted by: {j.user.name}</i></b>
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
