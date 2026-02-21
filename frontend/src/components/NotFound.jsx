import React from 'react';
import { FaBriefcase, FaSearch } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <section
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden px-3"
      style={{ background: 'linear-gradient(140deg, #f5fbff 0%, #eef4ff 55%, #fef8f2 100%)' }}
    >
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '300px',
          height: '300px',
          background: 'rgba(13, 110, 253, 0.10)',
          top: '-120px',
          right: '-80px',
          filter: 'blur(2px)',
        }}
      />
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '240px',
          height: '240px',
          background: 'rgba(255, 193, 7, 0.12)',
          bottom: '-110px',
          left: '-70px',
          filter: 'blur(2px)',
        }}
      />

      <div
        className="card border-0 shadow-lg text-center p-4 p-md-5 position-relative"
        style={{ maxWidth: '760px', width: '100%', borderRadius: '1.25rem' }}
      >
        <div className="d-flex justify-content-center mb-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{ width: '76px', height: '76px', background: '#e7f1ff', color: '#0d6efd', fontSize: '1.8rem' }}
          >
            <FaBriefcase />
          </div>
        </div>

        <div className="mb-2">
          <span className="badge text-bg-primary px-3 py-2 fs-6">404</span>
        </div>
        <h1 className="h2 mb-2 fw-bold">That opportunity is no longer here</h1>
        <p className="text-muted mb-3">
          The page may have moved or the link is no longer valid. Let us get you back to active listings.
        </p>
        <p className="small text-muted mb-4">
          Requested path: <code>{location.pathname}</code>
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Link to="/jobs" className="btn btn-primary px-3">
            <FaSearch className="me-2" />
            Browse Jobs
          </Link>
          <Link to="/" className="btn btn-outline-secondary px-3">Go Home</Link>
          <button onClick={() => navigate(-1)} className="btn btn-outline-dark px-3">Go Back</button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
