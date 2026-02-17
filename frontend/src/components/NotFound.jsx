import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <section className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="card border-0 shadow-sm text-center p-4 p-md-5" style={{ maxWidth: '700px', width: '100%' }}>
        <div className="mb-3">
          <span className="badge text-bg-primary px-3 py-2">404</span>
        </div>
        <h1 className="h2 mb-2">Page Not Found</h1>
        <p className="text-muted mb-4">
          The page you requested does not exist. The URL may be outdated, moved, or typed incorrectly.
        </p>
        <p className="small text-muted mb-4 pb-1">
          Requested path: <code>{location.pathname}</code>
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          <Link to="/" className="btn btn-outline-secondary">Go Home</Link>
          <button onClick={() => navigate(-1)} className="btn btn-outline-dark">Go Back</button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
