import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { FaBuilding, FaMapMarker, FaPlus } from 'react-icons/fa';
import ViewJobs from '../admin/view/ViewJobs';
import ManageJobs from '../admin/save/ManageJobs';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';
import SmartSearchBar from './SmartSearchBar';
import SmartFilterDropdown from './SmartFilterDropdown';


const Careers = () => {
    const { isLoggedIn, isStudent } = useAuth();
    const [filteredJob, setFilteredJob] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [handleAdd, setHandleAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [locationFilter, setLocationFilter] = useState('all');
    const [modeFilter, setModeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

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
                const safeJobs = Array.isArray(res.data)
                    ? res.data.filter((job) => job && typeof job === 'object')
                    : [];
                setJobs(safeJobs);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [handleAdd]);

    const locationOptions = useMemo(() => {
        const uniqueLocations = new Set();
        jobs.forEach((job) => {
            const location = (job?.location || '').trim();
            if (location) {
                uniqueLocations.add(location);
            }
        });
        return Array.from(uniqueLocations).sort((a, b) => a.localeCompare(b));
    }, [jobs]);

    const detectWorkMode = (job) => {
        const source = `${job?.location || ''} ${job?.description || ''}`.toLowerCase();
        if (source.includes('remote')) return 'remote';
        if (source.includes('hybrid')) return 'hybrid';
        if (source.includes('on-site') || source.includes('onsite') || source.includes('on site')) return 'onsite';
        return 'unspecified';
    };

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        let filteredCareer = jobs.filter((career) => {
            const title = (career?.job_title || career?.title || '').toLowerCase();
            const company = (career?.company || '').toLowerCase();
            const description = (career?.description || '').toLowerCase();
            const location = (career?.location || '').toLowerCase();
            const postedBy = (career?.user?.name || '').toLowerCase();
            if (!query) return true;
            return (
                title.includes(query) ||
                company.includes(query) ||
                description.includes(query) ||
                location.includes(query) ||
                postedBy.includes(query)
            );
        });

        if (locationFilter !== 'all') {
            filteredCareer = filteredCareer.filter((career) => (career?.location || '').trim() === locationFilter);
        }

        if (modeFilter !== 'all') {
            filteredCareer = filteredCareer.filter((career) => detectWorkMode(career) === modeFilter);
        }

        const getTimestamp = (career) => {
            const raw = career?.createdAt || career?.created_at || '';
            const parsed = Date.parse(raw);
            return Number.isNaN(parsed) ? 0 : parsed;
        };

        if (sortBy === 'title-asc') {
            filteredCareer = [...filteredCareer].sort((a, b) =>
                (a?.job_title || a?.title || '').localeCompare(b?.job_title || b?.title || '')
            );
        } else if (sortBy === 'company-asc') {
            filteredCareer = [...filteredCareer].sort((a, b) =>
                (a?.company || '').localeCompare(b?.company || '')
            );
        } else if (sortBy === 'oldest') {
            filteredCareer = [...filteredCareer].sort((a, b) => getTimestamp(a) - getTimestamp(b));
        } else {
            filteredCareer = [...filteredCareer].sort((a, b) => getTimestamp(b) - getTimestamp(a));
        }

        setFilteredJob(filteredCareer);
    }, [jobs, locationFilter, modeFilter, searchQuery, sortBy]);

    const resetFilters = () => {
        setSearchQuery('');
        setLocationFilter('all');
        setModeFilter('all');
        setSortBy('recent');
    };

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
                                <SmartSearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search jobs by title, description, or location..."
                                    inputId="jobs-filter"
                                    buttonId="jobs-search"
                                    entityLabel="jobs"
                                    resultsCount={filteredJob.length}
                                    totalCount={jobs.length}
                                >
                                    <SmartFilterDropdown
                                        label="Location"
                                        value={locationFilter}
                                        onChange={setLocationFilter}
                                        options={[
                                            { value: 'all', label: 'All' },
                                            ...locationOptions.map((location) => ({ value: location, label: location }))
                                        ]}
                                    />
                                    <SmartFilterDropdown
                                        label="Sort"
                                        value={sortBy}
                                        onChange={setSortBy}
                                        options={[
                                            { value: 'recent', label: 'Most Recent' },
                                            { value: 'oldest', label: 'Oldest' },
                                            { value: 'title-asc', label: 'Title A-Z' },
                                            { value: 'company-asc', label: 'Company A-Z' },
                                        ]}
                                    />
                                    <div className="smart-chip-group" role="group" aria-label="Work mode filter">
                                        {[
                                            { label: 'All', value: 'all' },
                                            { label: 'Remote', value: 'remote' },
                                            { label: 'Hybrid', value: 'hybrid' },
                                            { label: 'On-site', value: 'onsite' },
                                        ].map((mode) => (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                className={`smart-filter-chip ${modeFilter === mode.value ? 'active' : ''}`}
                                                onClick={() => setModeFilter(mode.value)}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" className="btn btn-outline-secondary btn-sm smart-filter-reset" onClick={resetFilters}>
                                        Reset
                                    </button>
                                </SmartSearchBar>
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
