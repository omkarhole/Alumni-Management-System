import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { studentUrl } from '../utils/globalurl';
import { FaBriefcase, FaBuilding, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const StudentsApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${studentUrl}/my-applications`, { withCredentials: true });
      setApplications(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications');
      setLoading(false);
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

  if (loading) {
    return <div className="text-center mt-5">Loading applications...</div>;
  }

  return (
    <div className="container-fluid mt-4">
<div className="row">
        <div className="col-lg-12">
          <h3 className="mb-4">
            <FaBriefcase className="me-2" />
            My Job Applications
          </h3>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              {applications.length === 0 ? (
                <div className="text-center py-5">
                  <FaBriefcase size={50} className="text-muted mb-3" />
                  <p className="text-muted">You haven't applied to any jobs yet</p>
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
                        <th>Applied Date</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app, index) => {
                        // Find the current user's application status
                        const userId = localStorage.getItem('user_id');
                        const myApplication = app.applicants?.find(
                          applicant => applicant.user?._id === userId || applicant.user === userId
                        );
                        
                        return (
                          <tr key={app._id || index}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              <FaBuilding className="text-muted me-2" />
                              <strong>{app.company}</strong>
                            </td>
                            <td>{app.job_title}</td>
                            <td>{app.location}</td>
                            <td>{myApplication ? formatDate(myApplication.appliedAt) : 'N/A'}</td>
                            <td className="text-center">
                              {myApplication ? getStatusBadge(myApplication.status) : getStatusBadge('pending')}
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

export default StudentsApplications;
