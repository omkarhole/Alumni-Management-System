import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAlumnus, setIsAlumnus] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  useEffect(() => {
    const user = localStorage.getItem('user_type')?.toLowerCase();
    if (user === 'admin') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      setIsAlumnus(false);
      setIsStudent(false);
    } else if (user === 'alumnus') {
      setIsAdmin(false);
      setIsLoggedIn(true);
      setIsAlumnus(true);
      setIsStudent(false);
    } else if (user === 'student') {
      setIsAdmin(false);
      setIsLoggedIn(true);
      setIsAlumnus(false);
      setIsStudent(true);
    } 
  }, [login]);



  return (
    <AuthContext.Provider value={{ isAdmin, isAlumnus, isStudent, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
