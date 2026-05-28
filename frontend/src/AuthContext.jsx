import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from './api/client';
import { authUrl, baseUrl, studentUrl } from './utils/globalurl';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAlumnus, setIsAlumnus] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  const applyRoleState = (userType) => {
    const type = (userType || '').toLowerCase();
    setIsAdmin(type === 'admin');
    setIsAlumnus(type === 'alumnus');
    setIsStudent(type === 'student');
    setIsLoggedIn(Boolean(type));
  };

  const clearStoredUser = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_name');
    localStorage.removeItem('alumnus_id');
  };

  const setAuthUser = (userId, userType, userName) => {
    const type = (userType || '').toLowerCase();
    const id = userId || '';
    const name = userName || '';

    setUser(id || type || name ? { id, type, name } : null);
    applyRoleState(type);
  };

  const login = (userType) => {
    setAuthUser(
      localStorage.getItem('user_id'),
      userType || localStorage.getItem('user_type'),
      localStorage.getItem('user_name')
    );
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
    applyRoleState('');
  };

  useEffect(() => {
    let active = true;
    const cachedType = (localStorage.getItem('user_type') || '').toLowerCase();

    const verifyLegacySession = async (userType) => {
      if (!userType) return false;

      const probeUrlMap = {
        admin: `${baseUrl}/dashboard/counts`,
        student: `${studentUrl}/dashboard/counts`,
        alumnus: `${baseUrl}/jobs`
      };

      const probeUrl = probeUrlMap[userType];
      if (!probeUrl) return false;

      try {
        await apiClient.get(probeUrl);
        return true;
      } catch {
        return false;
      }
    };

    // Check session status using centralized client
    apiClient.get(`${authUrl}/session`)
      .then((res) => {
        if (!active) return;
        const { userId, userType, userName } = res.data || {};
        if (userType) {
          localStorage.setItem('user_type', userType);
        }
        if (userId) {
          localStorage.setItem('user_id', userId);
          localStorage.setItem('alumnus_id', userId);
        }
        if (userName) {
          localStorage.setItem('user_name', userName);
        }
        setAuthUser(userId, userType, userName);
      })
      .catch(async (err) => {
        if (!active) return;

        const isSessionRouteMissing = err?.response?.status === 404;

        if (isSessionRouteMissing) {
          try {
            const isSessionValid = await verifyLegacySession(cachedType);
            if (!active) return;

            if (isSessionValid) {
              setAuthUser(
                localStorage.getItem('user_id'),
                cachedType,
                localStorage.getItem('user_name')
              );
              return;
            }
          } catch (_) {
            // Fall through to clear stale auth state.
          }
        }

        clearStoredUser();
        applyRoleState('');
      })
      .finally(() => {
        if (!active) return;
        setIsAuthReady(true);
      });

    // Listen for auth errors from the API client interceptor
    const handleAuthError = () => {
      if (active) {
        clearStoredUser();
        setUser(null);
        applyRoleState('');
      }
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      active = false;
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);



  return (
    <AuthContext.Provider value={{ isAdmin, isAlumnus, isStudent, isLoggedIn, isAuthReady, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
