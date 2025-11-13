
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// import { baseUrl } from '../../utils/globalurl
import { useAuth } from '../../AuthContext';

const ManageJobs = ({ setHandleAdd }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    company: '',
    job_title: '',
    location: '',
    description: '',
    user_id: uid,
  });
  
  const [jobId, setJobId] = useState(null); // Store job ID separately
  const [loading, setLoading] = useState(false);
  const toastId = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (location.state?.action === 'edit') {
      const data = location.state.data;
      setJobId(data._id || data.id); // Store the ID separately
      setFormData({
        company: data.company || '',
        job_title: data.job_title || '',
        location: data.location || '',
        description: data.description || '',
        user_id: data.user_id || data.user || uid,
      });
    }
  }, [location.state, isLoggedIn, navigate, uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleBack = () => {
    if (location.pathname.startsWith("/dashboard")) {
      navigate("/dashboard/jobs");
    } else {
      setHandleAdd(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const { company, job_title, location: loc, description } = formData;
    if (!company || !job_title || !loc || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    toastId.current = toast.loading("Submitting job...", { position: "top-center" });

    try {
      // Include auth token if required
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      let response;
      if (location.state?.action === 'edit' && jobId) {
        response = await axios.put(`http://localhost:5000/api/admin/jobs/${jobId}`, formData, config);
      } else {
        response = await axios.post(`http://localhost:5000/api/admin/jobs/`, formData, config);
      }

      toast.success(response.data.message || "Job saved successfully");

      // Reset form
      setJobId(null);
      setFormData({
        company: '',
        job_title: '',
        location: '',
        description: '',
        user_id: uid,
      });

      // Navigate back to dashboard jobs
    


    } catch (error) {
      console.error("Error submitting job:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please check backend logs.");
      }
    } finally {
      setLoading(false);
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="container-fluid">
        <form onSubmit={handleSubmit}>
          <div className="row form-group">
            <div className="col-md-8">
              <label>Company</label>
              <input type="text" name="company" className="form-control" value={formData.company} onChange={handleChange} required />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-8">
              <label>Job Title</label>
              <input type="text" name="job_title" className="form-control" value={formData.job_title} onChange={handleChange} required />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-8">
              <label>Location</label>
              <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} required />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-8">
              <label>Description</label>
              <ReactQuill value={formData.description} onChange={handleDescriptionChange} />
            </div>
          </div>
          <div className="col-md-8 mt-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button type="button" className="btn btn-outline-danger float-end" onClick={handleBack}>Back</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ManageJobs;
