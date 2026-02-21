import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import { FaBriefcase, FaUser, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const AdminJobApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobsWithApplications();
  }, []);

  const fetchJobsWithApplications = async () => {
    try {
      const res = await axios.get(`${baseUrl}/jobs`, { withCredentials: true });
      // Filter only jobs that have applicants
      const jobsWithApplicants = res.data.filter(job => job.applicants && job.applicants.length > 0);
      setJobs(jobsWithApplicants);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load job applications');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, userId, newStatus) => {
    try {
      await axios.patch(
        `${baseUrl}/jobs/${jobId}/applicants/${userId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Application ${newStatus} successfully!`);
      fetchJobsWithApplications(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="badge bg-success"><FaCheckCircle /> Accepted</span>;
      case 'rejected':
        return <span className="badge bg-danger"><FaTimesCircle /> Rejected</span>;
      case 'pending':
      default:
        return <span className="badge bg-warning text-dark"><FaClock /> Pending</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTotalApplicationsCount = () => {
    return jobs.reduce((total, job) => total + (job.applicants?.length || 0), 0);
  };

  const getPendingApplicationsCount = () => {
    return jobs.reduce((total, job) => {
      const pending = job.applicants?.filter(app => app.status === 'pending').length || 0;
      return total + pending;
    }, 0);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading applications...</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-center" />

      <div className="row mb-4">
        <div className="col-lg-12">
          <h3 className="mb-4">
            <FaBriefcase className="me-2" />
            Job Applications Management
          </h3>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Total Applications</h5>
              <h2>{getTotalApplicationsCount()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5>Pending Review</h5>
              <h2>{getPendingApplicationsCount()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5>Total Jobs</h5>
              <h2>{jobs.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List with Applications */}
      <div className="row">
        <div className="col-lg-12">
          {jobs.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="text-center py-5">
                  <FaBriefcase size={50} className="text-muted mb-3" />
                  <p className="text-muted">No job applications found</p>
                </div>
              </div>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="card mb-4">
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">{job.job_title}</h5>
                      <small className="text-muted">
                        {job.company} • {job.location}
                      </small>
                    </div>
                    <span className="badge bg-primary">
                      {job.applicants?.length || 0} Applicants
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Current Year</th>
                          <th>Applied Date</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.applicants?.map((applicant, index) => (
                          <tr key={applicant.user?._id || index}>
                            <td>{index + 1}</td>
                            <td>
                              <FaUser className="text-muted me-2" />
                              {applicant.user?.name || 'N/A'}
                            </td>
                            <td>{applicant.user?.email || 'N/A'}</td>
                            <td>{applicant.user?.student_bio?.course?.course || applicant.user?.student_bio?.course?.name || 'N/A'}</td>
                            <td>{applicant.user?.student_bio?.current_year || 'N/A'}</td>
                            <td>{formatDate(applicant.appliedAt)}</td>
                            <td className="text-center">
                              {getStatusBadge(applicant.status)}
                            </td>
                            <td className="text-center">
                              {applicant.status === 'pending' ? (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    onClick={() => handleStatusUpdate(job._id, applicant.user?._id, 'accepted')}
                                    className="btn btn-success"
                                    title="Accept"
                                  >
                                    <FaCheckCircle /> Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(job._id, applicant.user?._id, 'rejected')}
                                    className="btn btn-danger"
                                    title="Reject"
                                  >
                                    <FaTimesCircle /> Reject
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStatusUpdate(job._id, applicant.user?._id, 'pending')}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  Reset to Pending
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobApplications;
