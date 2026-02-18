import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaSearch, FaFilter, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import defaultavatar from "../assets/uploads/defaultavatar.jpg"
import { baseUrl } from '../utils/globalurl';


const AlumniList = () => {
    const [alumniList, setAlumniList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filter states
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        batches: [],
        courses: [],
        companies: [],
        locations: [],
        skills: []
    });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAlumni, setTotalAlumni] = useState(0);
    const itemsPerPage = 12;

    // Show/hide filters
    const [showFilters, setShowFilters] = useState(false);

    // Fetch filter options on mount
    useEffect(() => {
        axios.get(`${baseUrl}/alumni/filter-options`)
            .then((res) => {
                setFilterOptions(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    // Fetch alumni with filters and pagination
    const fetchAlumni = () => {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (searchQuery) params.append('search', searchQuery);
        if (selectedBatches.length > 0) params.append('batch', selectedBatches.join(','));
        if (selectedCourses.length > 0) params.append('course', selectedCourses.join(','));
        if (selectedCompanies.length > 0) params.append('company', selectedCompanies.join(','));
        if (selectedLocations.length > 0) params.append('location', selectedLocations.join(','));
        if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));
        
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);

        axios.get(`${baseUrl}/alumni/search?${params.toString()}`)
            .then((res) => {
                setAlumniList(res.data.alumni);
                setTotalPages(res.data.pagination.pages);
                setTotalAlumni(res.data.pagination.total);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    // Fetch alumni when filters or page changes
    useEffect(() => {
        fetchAlumni();
    }, [currentPage, selectedBatches, selectedCourses, selectedCompanies, selectedLocations, selectedSkills]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchAlumni();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleBatchChange = (batch) => {
        setSelectedBatches(prev => 
            prev.includes(batch) ? prev.filter(b => b !== batch) : [...prev, batch]
        );
        setCurrentPage(1);
    };

    const handleCourseChange = (courseId) => {
        setSelectedCourses(prev => 
            prev.includes(courseId) ? prev.filter(c => c !== courseId) : [...prev, courseId]
        );
        setCurrentPage(1);
    };

    const handleCompanyChange = (company) => {
        setSelectedCompanies(prev => 
            prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
        );
        setCurrentPage(1);
    };

    const handleLocationChange = (location) => {
        setSelectedLocations(prev => 
            prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
        );
        setCurrentPage(1);
    };

    const handleSkillChange = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedBatches([]);
        setSelectedCourses([]);
        setSelectedCompanies([]);
        setSelectedLocations([]);
        setSelectedSkills([]);
        setCurrentPage(1);
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        
        if (searchQuery) params.append('search', searchQuery);
        if (selectedBatches.length > 0) params.append('batch', selectedBatches.join(','));
        if (selectedCourses.length > 0) params.append('course', selectedCourses.join(','));
        if (selectedCompanies.length > 0) params.append('company', selectedCompanies.join(','));
        if (selectedLocations.length > 0) params.append('location', selectedLocations.join(','));
        if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));

        window.open(`${baseUrl}/alumni/export?${params.toString()}`, '_blank');
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                    onClick={() => goToPage(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="d-flex justify-content-center align-items-center mt-4">
                <button 
                    className="btn btn-sm btn-outline-primary mx-1"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FaChevronLeft />
                </button>
                {startPage > 1 && <span className="mx-2">...</span>}
                {pages}
                {endPage < totalPages && <span className="mx-2">...</span>}
                <button 
                    className="btn btn-sm btn-outline-primary mx-1"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <FaChevronRight />
                </button>
                <span className="ml-3 text-muted">
                    Page {currentPage} of {totalPages} ({totalAlumni} total)
                </span>
            </div>
        );
    };

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Alumnus/Alumnae List</h3>
                            <hr className="divider my-4" />
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="container mt-4">
                <div className="card mb-4">
                    <div className="card-body">
                        {/* Search Bar */}
                        <div className="row mb-3">
                            <div className="col-md-8">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <FaSearch />
                                        </span>
                                    </div>
                                    <input
                                        value={searchQuery} 
                                        onChange={handleSearchInputChange}
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name or email..."
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex gap-2">
                                    <button 
                                        className="btn btn-outline-secondary flex-fill"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <FaFilter /> Filters {showFilters ? '▲' : '▼'}
                                    </button>
                                    <button 
                                        className="btn btn-success"
                                        onClick={handleExport}
                                        title="Export to CSV"
                                    >
                                        <FaDownload />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="row mt-3 border-top pt-3">
                                {/* Batch Filter */}
                                <div className="col-md-6 col-lg-2 mb-3">
                                    <h6 className="font-weight-bold">Batch</h6>
                                    <div className="filter-scroll" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                        {filterOptions.batches.map(batch => (
                                            <div key={batch} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`batch-${batch}`}
                                                    checked={selectedBatches.includes(batch)}
                                                    onChange={() => handleBatchChange(batch)}
                                                />
                                                <label className="form-check-label" htmlFor={`batch-${batch}`}>
                                                    {batch}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Course Filter */}
                                <div className="col-md-6 col-lg-3 mb-3">
                                    <h6 className="font-weight-bold">Course</h6>
                                    <div className="filter-scroll" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                        {filterOptions.courses.map(course => (
                                            <div key={course._id} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`course-${course._id}`}
                                                    checked={selectedCourses.includes(course._id)}
                                                    onChange={() => handleCourseChange(course._id)}
                                                />
                                                <label className="form-check-label" htmlFor={`course-${course._id}`}>
                                                    {course.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Company Filter */}
                                <div className="col-md-6 col-lg-3 mb-3">
                                    <h6 className="font-weight-bold">Company</h6>
                                    <div className="filter-scroll" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                        {filterOptions.companies.map(company => (
                                            <div key={company} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`company-${company}`}
                                                    checked={selectedCompanies.includes(company)}
                                                    onChange={() => handleCompanyChange(company)}
                                                />
                                                <label className="form-check-label" htmlFor={`company-${company}`}>
                                                    {company}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Location Filter */}
                                <div className="col-md-6 col-lg-2 mb-3">
                                    <h6 className="font-weight-bold">Location</h6>
                                    <div className="filter-scroll" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                        {filterOptions.locations.map(location => (
                                            <div key={location} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`location-${location}`}
                                                    checked={selectedLocations.includes(location)}
                                                    onChange={() => handleLocationChange(location)}
                                                />
                                                <label className="form-check-label" htmlFor={`location-${location}`}>
                                                    {location}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Filter */}
                                <div className="col-md-6 col-lg-2 mb-3">
                                    <h6 className="font-weight-bold">Skills</h6>
                                    <div className="filter-scroll" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                        {filterOptions.skills.map(skill => (
                                            <div key={skill} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`skill-${skill}`}
                                                    checked={selectedSkills.includes(skill)}
                                                    onChange={() => handleSkillChange(skill)}
                                                />
                                                <label className="form-check-label" htmlFor={`skill-${skill}`}>
                                                    {skill}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <div className="col-12 mt-2">
                                    <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={clearAllFilters}
                                    >
                                        Clear All Filters
                                    </button>
                                    {(selectedBatches.length > 0 || selectedCourses.length > 0 || 
                                      selectedCompanies.length > 0 || selectedLocations.length > 0 || 
                                      selectedSkills.length > 0) && (
                                        <span className="ml-2 text-muted">
                                            Active filters: {
                                                selectedBatches.length + selectedCourses.length + 
                                                selectedCompanies.length + selectedLocations.length + 
                                                selectedSkills.length
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="container-fluid mt-3 pt-2 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">Loading alumni...</p>
                </div>
            )}

            {/* Alumni Grid */}
            {!loading && (
                <div className="container-fluid mt-3 pt-2">
                    {alumniList.length > 0 ? <>
                        <div className="row">
                            {alumniList.map((a, index) => (
                                <div className="col-md-4 col-lg-3 mb-4" key={index}>
                                    <div className="card h-100 shadow-sm">
                                        <center>
                                            {a.alumnus_bio?.avatar ?
                                                <img
                                                    src={`${baseUrl}/${a.alumnus_bio.avatar}`}
                                                    className="card-img-top img-fluid alimg"
                                                    alt="avatar"
                                                /> : <>
                                                    <img
                                                        src={defaultavatar}
                                                        className="card-img-top img-fluid alimg"
                                                        alt="avatar"
                                                    />
                                                </>}
                                        </center>
                                        <div className="card-body">
                                            <h5 className="card-title text-center pad-zero">
                                                {a.name} 
                                                <small>
                                                    <i className={`badge badge-primary ${a.alumnus_bio?.status === 1 ? '' : 'd-none'}`}>
                                                        Verified
                                                    </i>
                                                    <i className={`badge badge-warning ${a.alumnus_bio?.status === 0 ? '' : 'd-none'}`}>
                                                        Unverified
                                                    </i>
                                                </small>
                                            </h5>

                                            <p className="card-text">
                                                <strong>Email:</strong> {a.email}
                                            </p>
                                            {a.alumnus_bio?.course?.course && <p className="card-text">
                                                <strong>Course:</strong> {a.alumnus_bio.course.course}
                                            </p>}
                                            {a.alumnus_bio?.batch && a.alumnus_bio.batch != "0000" && <p className="card-text">
                                                <strong>Batch:</strong> {a.alumnus_bio.batch}
                                            </p>}
                                            {a.alumnus_bio?.skills && a.alumnus_bio.skills.length > 0 && (
                                                <p className="card-text">
                                                    <strong>Skills:</strong> {a.alumnus_bio.skills.join(', ')}
                                                </p>
                                            )}
                                            {a.alumnus_bio?.connected_to && <p className="card-text">
                                                <strong>Currently working in/as:</strong> {a.alumnus_bio.connected_to}
                                            </p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && renderPagination()}
                    </> : <>
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <h4 className='text-info-emphasis'>No Alumni Found</h4>
                            <p className="text-muted">Try adjusting your search or filters</p>
                            {(selectedBatches.length > 0 || selectedCourses.length > 0 || 
                              selectedCompanies.length > 0 || selectedLocations.length > 0 || 
                              selectedSkills.length > 0 || searchQuery) && (
                                <button 
                                    className="btn btn-outline-primary mt-2"
                                    onClick={clearAllFilters}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </>}
                </div>
            )}
        </>
    );
};

export default AlumniList;
