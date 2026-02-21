import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';
import { FaComments, FaPlus, FaUser, FaClock } from 'react-icons/fa';

const StudentForum = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const res = await axios.get(`${baseUrl}/forums`, { withCredentials: true });
      setForums(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load forums');
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseUrl}/forums`, newTopic, { withCredentials: true });
      toast.success('Topic created successfully!');
      setNewTopic({ title: '', content: '' });
      setShowCreateModal(false);
      fetchForums();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create topic');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return <div className="text-center mt-5">Loading forums...</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-center" />

      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>
              <FaComments className="me-2" />
              Forum Discussions
            </h3>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <FaPlus className="me-1" /> Create New Topic
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              {forums.length === 0 ? (
                <div className="text-center py-5">
                  <FaComments size={50} className="text-muted mb-3" />
                  <p className="text-muted">No forum topics available. Create the first one!</p>
                </div>
              ) : (
                <div className="list-group">
                  {forums.map((forum) => (
                    <div key={forum._id} className="list-group-item list-group-item-action mb-2">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{forum.title}</h5>
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {formatDate(forum.createdAt)}
                        </small>
                      </div>
                      <p className="mb-1">{forum.content?.substring(0, 150)}...</p>
                      <small className="text-muted">
                        <FaUser className="me-1" />
                        Posted by {forum.user?.name || 'Unknown'}
                        <span className="ms-3">💬 {forum.comments?.length || 0} comments</span>
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTopic}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Topic Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForum;