import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import { FaBriefcase, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${baseUrl}/jobs`, { withCredentials: true });
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await axios.get(`${baseUrl}/jobs/my-applications`, { withCredentials: true });
      const appliedJobIds = new Set(res.data.map(app => app._id));
      setAppliedJobs(appliedJobIds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await axios.post(`${baseUrl}/jobs/${jobId}/apply`, 
        { user_id: userId }, 
        { withCredentials: true }
      );
      toast.success('Application submitted successfully!');
      setAppliedJobs(prev => new Set([...prev, jobId]));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading jobs...</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-center" />

      <div className="row">
        <div className="col-lg-12">
          <h3 className="mb-4">
            <FaBriefcase className="me-2" />
            Available Jobs
          </h3>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              {jobs.length === 0 ? (
                <div className="text-center py-5">
                  <FaBriefcase size={50} className="text-muted mb-3" />
                  <p className="text-muted">No jobs available at the moment</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">#</th>
                        <th>Company</th>
                        <th>Job Title</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Posted By</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, index) => {
                        const hasApplied = appliedJobs.has(job._id || job.id);
                        return (
                          <tr key={job._id || job.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              <strong>{job.company}</strong>
                            </td>
                            <td>{job.job_title}</td>
                            <td>
                              <FaMapMarkerAlt className="text-muted me-1" />
                              {job.location}
                            </td>
                            <td>
                              <div 
                                style={{ 
                                  maxWidth: '300px', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={job.description}
                              >
                                {job.description}
                              </div>
                            </td>
                            <td>
                              <FaUser className="text-muted me-1" />
                              {job.user?.name || 'N/A'}
                            </td>
                            <td className="text-center">
                              {hasApplied ? (
                                <span className="badge bg-success">Applied ✓</span>
                              ) : (
                                <button
                                  onClick={() => handleApply(job._id || job.id)}
                                  className="btn btn-primary btn-sm"
                                >
                                  Apply Now
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentJobs;