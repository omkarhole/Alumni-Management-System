import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaNewspaper, FaEnvelope, FaUsers } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';
import ReactQuill from 'react-quill';

const AdminNews = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('news');
    const [showModal, setShowModal] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'announcement',
        banner: '',
        isPublished: true
    });

    useEffect(() => {
        fetchNews();
        fetchSubscribers();
    }, []);

    const fetchNews = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseUrl}/api/admin/news`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNews(response.data);
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseUrl}/api/admin/news/newsletter/subscribers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscribers(response.data);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('user_id');
            
            const payload = {
                ...formData,
                author: userId
            };

            if (editingNews) {
                await axios.put(`${baseUrl}/api/admin/news/${editingNews._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('News updated successfully');
            } else {
                await axios.post(`${baseUrl}/api/admin/news`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('News created successfully');
            }

            setShowModal(false);
            setEditingNews(null);
            setFormData({
                title: '',
                content: '',
                category: 'announcement',
                banner: '',
                isPublished: true
            });
            fetchNews();
        } catch (error) {
            console.error('Error saving news:', error);
            toast.error(error.response?.data?.message || 'Failed to save news');
        }
    };

    const handleEdit = (item) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            content: item.content,
            category: item.category,
            banner: item.banner || '',
            isPublished: item.isPublished
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news item?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${baseUrl}/api/admin/news/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('News deleted successfully');
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            toast.error('Failed to delete news');
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'institutional':
                return 'bg-primary';
            case 'achievement':
                return 'bg-success';
            case 'announcement':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className={`page-section bg-${theme}`}>
<div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="section-heading text-uppercase mb-0">
                        <FaNewspaper className="me-2" />
                        News & Announcements Management
                    </h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingNews(null);
                            setFormData({
                                title: '',
                                content: '',
                                category: 'announcement',
                                banner: '',
                                isPublished: true
                            });
                            setShowModal(true);
                        }}
                    >
                        <FaPlus className="me-2" />
                        Add News
                    </button>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'news' ? 'active' : ''}`}
                            onClick={() => setActiveTab('news')}
                        >
                            <FaNewspaper className="me-2" />
                            News ({news.length})
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'subscribers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('subscribers')}
                        >
                            <FaUsers className="me-2" />
                            Subscribers ({subscribers.length})
                        </button>
                    </li>
                </ul>

                {activeTab === 'news' ? (
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : news.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Author</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {news.map((item) => (
                                                <tr key={item._id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {item.banner && (
                                                                <img 
                                                                    src={item.banner} 
                                                                    alt={item.title}
                                                                    className="me-2 rounded"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <h6 className="mb-0">{item.title}</h6>
                                                                <small className="text-muted">
                                                                    {item.content.substring(0, 50)}...
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getCategoryColor(item.category)}`}>
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td>{item.author?.name || 'Admin'}</td>
                                                    <td>
                                                        <span className={`badge ${item.isPublished ? 'bg-success' : 'bg-warning'}`}>
                                                            {item.isPublished ? 'Published' : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(item.createdAt)}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(item._id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <FaNewspaper size={50} className="text-muted mb-3" />
                                    <h4 className="text-muted">No news available</h4>
                                    <p className="text-muted">Create your first news item</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-4">
                                <FaEnvelope className="me-2" />
                                Newsletter Subscribers
                            </h5>
                            {subscribers.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Subscribed Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscribers.map((subscriber) => (
                                                <tr key={subscriber._id}>
                                                    <td>{subscriber.email}</td>
                                                    <td>
                                                        <span className={`badge ${subscriber.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                            {subscriber.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(subscriber.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <FaEnvelope size={50} className="text-muted mb-3" />
                                    <h4 className="text-muted">No subscribers yet</h4>
                                    <p className="text-muted">Newsletter subscription form is available on the home page</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingNews ? 'Edit News' : 'Add News'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <select
                                                className="form-select"
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                required
                                            >
                                                <option value="announcement">Announcement</option>
                                                <option value="institutional">Institutional</option>
                                                <option value="achievement">Alumni Achievement</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Banner Image URL</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                value={formData.banner}
                                                onChange={(e) => setFormData({...formData, banner: e.target.value})}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Content</label>
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.content}
                                                onChange={(content) => setFormData({...formData, content})}
                                                style={{ height: '200px', marginBottom: '50px' }}
                                            />
                                        </div>
                                        <div className="mb-3 form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="isPublished"
                                                checked={formData.isPublished}
                                                onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                                            />
                                            <label className="form-check-label" htmlFor="isPublished">
                                                Publish immediately
                                            </label>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {editingNews ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNews;

