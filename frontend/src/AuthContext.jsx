import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { authUrl, baseUrl, studentUrl } from './utils/globalurl';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAlumnus, setIsAlumnus] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

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

  const login = (userType) => {
    const type = userType || localStorage.getItem('user_type');
    applyRoleState(type);
  };

  const logout = () => {
    clearStoredUser();
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

      await axios.get(probeUrl, { withCredentials: true });
      return true;
    };

    axios.get(`${authUrl}/session`, { withCredentials: true })
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
        applyRoleState(userType);
      })
      .catch(async (err) => {
        if (!active) return;

        const isSessionRouteMissing = err?.response?.status === 404;

        if (isSessionRouteMissing) {
          try {
            const isSessionValid = await verifyLegacySession(cachedType);
            if (!active) return;

            if (isSessionValid) {
              applyRoleState(cachedType);
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

    return () => {
      active = false;
    };
  }, []);



  return (
    <AuthContext.Provider value={{ isAdmin, isAlumnus, isStudent, isLoggedIn, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
