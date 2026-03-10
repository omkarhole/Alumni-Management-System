import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/reunions.css';

const Reunions = () => {
  const [reunions, setReunions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReunions();
  }, [page, filter]);

  const fetchReunions = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? '' : filter;
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/reunions`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 12);
      if (status) url.searchParams.append('status', status);

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch reunions');

      const data = await response.json();
      setReunions(data.reunions);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching reunions:', error);
      toast.error('Failed to load reunions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  if (loading) {
    return <div className="loading">Loading reunions...</div>;
  }

  return (
    <div className="reunions-container">
      <div className="reunions-header">
        <h1>Class Reunions</h1>
        <Link to="/create-reunion" className="create-btn">
          + Create Reunion
        </Link>
      </div>

      <div className="filter-section">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All Reunions
        </button>
        <button
          className={`filter-btn ${filter === 'planning' ? 'active' : ''}`}
          onClick={() => handleFilterChange('planning')}
        >
          Planning
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => handleFilterChange('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </button>
      </div>

      {reunions.length === 0 ? (
        <div className="empty-state">
          <p>No reunions found. Be the first to create one!</p>
          <Link to="/create-reunion" className="create-btn-large">
            Create Reunion
          </Link>
        </div>
      ) : (
        <>
          <div className="reunions-grid">
            {reunions.map((reunion) => (
              <div key={reunion._id} className="reunion-card">
                {reunion.banner && (
                  <div className="reunion-banner">
                    <img src={reunion.banner} alt={reunion.title} />
                  </div>
                )}
                <div className="reunion-content">
                  <h3>{reunion.title}</h3>
                  <p className="batch">Batch {reunion.batch}</p>
                  <div className="reunion-info">
                    <span className="date">
                      📅 {new Date(reunion.eventDate).toLocaleDateString()}
                    </span>
                    <span className="location">📍 {reunion.venue}</span>
                  </div>
                  <div className="reunion-stats">
                    <span>{reunion.attendees?.length || 0} Attending</span>
                    <span className={`status ${reunion.status}`}>{reunion.status}</span>
                  </div>
                  <Link
                    to={`/reunion/${reunion._id}`}
                    className="view-details-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reunions;
