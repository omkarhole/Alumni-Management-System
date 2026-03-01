import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toPublicUrl } from '../utils/globalurl';
import { 
  Building2, 
  Star, 
  Eye, 
  EyeOff, 
  Award,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  Gift,
  BarChart3,
  TrendingUp,
  Shield,
  ShieldOff
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORY_LABELS = {
  technology: 'Technology',
  consulting: 'Consulting',
  finance: 'Finance',
  marketing: 'Marketing',
  healthcare: 'Healthcare',
  education: 'Education',
  retail: 'Retail',
  food: 'Food & Beverages',
  real_estate: 'Real Estate',
  legal: 'Legal',
  manufacturing: 'Manufacturing',
  hospitality: 'Hospitality',
  creative: 'Creative & Design',
  freelance: 'Freelance',
  other: 'Other'
};

const AdminBusinesses = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchStats();
    fetchBusinesses();
  }, [statusFilter, categoryFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/admin/stats`, {
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

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
        limit: 50
      });

      const response = await fetch(`${API_URL}/api/business/admin/all?${queryParams}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setBusinesses(data.businesses);
      } else {
        toast.error('Failed to fetch businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Error loading businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/api/business/admin/${businessId}/featured`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchBusinesses();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Error updating business');
    }
  };

  const handleToggleVerify = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/api/business/admin/${businessId}/verify`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchBusinesses();
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Error toggling verify:', error);
      toast.error('Error updating business');
    }
  };

  const handleToggleStatus = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/api/business/admin/${businessId}/status`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchBusinesses();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error updating business');
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return b.businessName.toLowerCase().includes(search) || 
             b.description?.toLowerCase().includes(search);
    }
    return true;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating || 0})</span>
      </div>
    );
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Business Directory Management</h1>
        <p className="text-gray-600">Manage alumni businesses and listings</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Total Businesses</h6>
                    <h2 className="mb-0">{stats.businesses.total}</h2>
                  </div>
                  <Building2 className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Active Listings</h6>
                    <h2 className="mb-0">{stats.businesses.active}</h2>
                  </div>
                  <Eye className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">Featured</h6>
                    <h2 className="mb-0">{stats.businesses.featured}</h2>
                  </div>
                  <Award className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-0">With Discounts</h6>
                    <h2 className="mb-0">{stats.businesses.withDiscount}</h2>
                  </div>
                  <Gift className="w-8 h-8 opacity-75" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && stats.categoryBreakdown && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Category Breakdown</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {stats.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="col-md-2 col-4 text-center mb-2">
                  <h5 className="text-primary">{cat.count}</h5>
                  <small className="text-muted">{CATEGORY_LABELS[cat._id] || cat._id}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-primary w-100"
                onClick={fetchBusinesses}
              >
                <Filter className="w-4 h-4 me-1" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Businesses</h5>
          <span className="badge bg-secondary">{filteredBusinesses.length} results</span>
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
                    <th>Business</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((business) => (
                    <tr key={business._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {business.logo ? (
                            <img
                              src={toPublicUrl(business.logo)}
                              alt={business.businessName}
                              className="rounded me-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="fw-medium">{business.businessName}</div>
                            <small className="text-muted">
                              {business.location?.city || 'No location'}
                              {business.hasAlumniDiscount && (
                                <span className="ms-2 badge bg-success">Discount</span>
                              )}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{business.user?.name || 'Unknown'}</div>
                        <small className="text-muted">{business.user?.email}</small>
                      </td>
                      <td>{CATEGORY_LABELS[business.category] || business.category}</td>
                      <td>{renderStars(business.rating)}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${business.isActive ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleToggleStatus(business._id)}
                          title={business.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {business.isActive ? (
                            <><Eye className="w-4 h-4" /> Active</>
                          ) : (
                            <><EyeOff className="w-4 h-4" /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${business.isFeatured ? 'btn-warning' : 'btn-outline-warning'}`}
                          onClick={() => handleToggleFeatured(business._id)}
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${business.isVerified ? 'btn-info' : 'btn-outline-info'}`}
                          onClick={() => handleToggleVerify(business._id)}
                        >
                          {business.isVerified ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td>
                        <Link
                          to={`/business/${business._id}`}
                          className="btn btn-sm btn-outline-primary"
                          target="_blank"
                        >
                          View <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBusinesses.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No businesses found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBusinesses;
