import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const PrivateRoute = ({ children, allow = [] }) => {
  const { isAuthReady, isLoggedIn, isAdmin, isAlumnus, isStudent } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.length) {
    return children;
  }

  const roleAllowed =
    (allow.includes('admin') && isAdmin) ||
    (allow.includes('alumnus') && isAlumnus) ||
    (allow.includes('student') && isStudent);

  if (!roleAllowed) {
    if (isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    if (isStudent) {
      return <Navigate to="/student-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    children
  );
}

export default PrivateRoute;
