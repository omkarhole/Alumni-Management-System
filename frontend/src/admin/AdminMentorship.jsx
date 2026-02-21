import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Star, 
  ChevronRight, 
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserPlus
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminMentorship = () => {
  const [stats, setStats] = useState(null);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchStats();
    fetchMentorships();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/admin/stats`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mentorship/admin/mentorships`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setMentorships(data.mentorships);
      } else {
        toast.error('Failed to fetch mentorships');
      }
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast.error('Error loading mentorships');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (matchId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/admin/mentorships/${matchId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Mentorship ${status} successfully`);
        fetchMentorships();
        fetchStats();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const filteredMentorships = mentorships.filter(m => {
    if (activeTab === 'all') return true;
    return m.status === activeTab;
  });

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Mentorship Program Management</h1>
        <p className="text-gray-600">Monitor and manage all mentorship activities</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Active Mentors</h6>
                    <h2 className="mb-0">{stats.mentors.total}</h2>
                  </div>
                  <UserCheck className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Active Mentorships</h6>
                    <h2 className="mb-0">{stats.mentorships.active}</h2>
                  </div>
                  <Users className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Pending Requests</h6>
                    <h2 className="mb-0">{stats.mentorships.pending}</h2>
                  </div>
                  <UserPlus className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Total Sessions</h6>
                    <h2 className="mb-0">{stats.sessions.total}</h2>
                  </div>
                  <Calendar className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Mentorship Overview</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <h4 className="text-primary">{stats.mentorships.total}</h4>
                    <small className="text-muted">Total</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-success">{stats.mentorships.completed}</h4>
                    <small className="text-muted">Completed</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-info">{stats.mentorships.active}</h4>
                    <small className="text-muted">Active</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Session Statistics</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <h4 className="text-primary">{stats.sessions.total}</h4>
                    <small className="text-muted">Total</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-success">{stats.sessions.completed}</h4>
                    <small className="text-muted">Completed</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-warning">{stats.sessions.upcoming}</h4>
                    <small className="text-muted">Upcoming</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            {['all', 'pending', 'accepted', 'completed'].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mentor</th>
                    <th>Mentee</th>
                    <th>Status</th>
                    <th>Sessions</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentorships.map((mentorship) => (
                    <tr key={mentorship._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                            {mentorship.mentor?.name?.charAt(0) || 'M'}
                          </div>
                          <span>{mentorship.mentor?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                            {mentorship.mentee?.name?.charAt(0) || 'M'}
                          </div>
                          <span>{mentorship.mentee?.name}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(mentorship.status)}</td>
                      <td>
                        <span className="badge bg-info">
                          {mentorship.completedSessions}/{mentorship.totalSessions}
                        </span>
                      </td>
                      <td>
                        {mentorship.startDate 
                          ? new Date(mentorship.startDate).toLocaleDateString() 
                          : 'Not started'}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {mentorship.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleUpdateStatus(mentorship._id, 'accepted')}
                                title="Accept"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleUpdateStatus(mentorship._id, 'rejected')}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {mentorship.status === 'accepted' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUpdateStatus(mentorship._id, 'completed')}
                              title="Mark Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMentorships.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No mentorships found in this category
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMentorship;
