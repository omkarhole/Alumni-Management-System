import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./styles/style.css";
import "react-toastify/dist/ReactToastify.css";
import Home from './components/Home';
import Footer from './components/Footer';
import Header from "./components/Header";
import AlumniList from "./components/AlumniList";
import Gallery from "./components/Gallery";
import Careers from "./components/Careers";
import Forum from "./components/Forum";
import About from "./components/About";
import Login from "./components/Login";;
import Signup from "./components/Signup";
import MyAccount from "./components/MyAccount";
import Dashboard from "./admin/Dashboard";
import AdminHome from "./admin/AdminHome";
import AdminCourses from "./admin/AdminCourses";
import AdminUsers from "./admin/AdminUsers";
import AdminGallery from "./admin/AdminGallery";
import AdminSettings from "./admin/AdminSettings";
import AdminEvents from "./admin/AdminEvents";
import AdminForum from "./admin/AdminForum";
import AdminAlumni from "./admin/AdminAlumni";
import AdminJobs from "./admin/AdminJobs";
import AdminJobApplications from "./admin/AdminJobApplications";
import ManageJobs from "./admin/save/ManageJobs";
import View_Event from "./components/view/View_Event";
import StudentDashboard from "./students/StudentDashboard";
import StudentHome from "./students/StudentHome";
import StudentJobs from "./students/StudentJobs";
import StudentEvents from "./students/StudentEvents";
import StudentForum from "./students/StudentForum";
import StudentProfile from "./students/StudentProfile";
import StudentsApplications from "./students/StudentsApplications";
import ManageEvents from "./admin/save/ManageEvents";
import View_Forum from "./components/view/View_Forum";
import ManageForum from "./admin/save/ManageForum";
import ManageUser from "./admin/save/ManageUser";
import ViewAlumni from "./admin/view/ViewAlumni";
import { AuthProvider, useAuth } from './AuthContext';
import ScrollToTop from "./components/ScrollToTop";
import Manage_Career from "./components/manage/Manage_Career";
import 'react-quill/dist/quill.snow.css';
import { ThemeProvider } from "./ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";


function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ScrollToTop />
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}


function AppRouter() {
  const { isAuthReady } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isStudentDashboardRoute = location.pathname.startsWith("/student-dashboard");

  if (!isAuthReady) {
    return null;
  }

  // useEffect(() => {
  //   const user = localStorage.getItem('user_type');
  //   // This effect is now handled in AuthProvider
  // }, []);

  // setTimeout(() => {
    
  // }, 1000);

  return (
    <>
      {!isDashboardRoute && !isStudentDashboardRoute && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<AlumniList />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/jobs" element={<Careers />} />
        <Route path="/forums" element={<Forum />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/dashboard" element={
          <PrivateRoute allow={['admin']}>
            <Dashboard />
          </PrivateRoute>
        } >
          <Route index element={<AdminHome />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="forum" element={<AdminForum />} />
          <Route path="alumnilist" element={<AdminAlumni />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="job-applications" element={<AdminJobApplications />} />
          <Route path="jobs/manage" element={<ManageJobs />} />
          <Route path="events/manage" element={<ManageEvents />} />
          <Route path="forum/manage" element={<ManageForum />} />
          <Route path="users/manage" element={<ManageUser />} />
          <Route path="alumni/view" element={<ViewAlumni />} />
        </Route>
        <Route path="events/view" element={<View_Event />} />
        <Route path="account" element={
          <PrivateRoute allow={['alumnus', 'student']}>
            <MyAccount />
          </PrivateRoute>
        } />
        <Route path="forum/view" element={<View_Forum />} />
        <Route path="jobs/add" element={<ManageJobs />} />
        {/* <Route path="jobs/add" element={<Manage_Career />} /> */}
        
        <Route path="/student-dashboard" element={
          <PrivateRoute allow={['student']}>
            <StudentDashboard />
          </PrivateRoute>
        }>
          <Route index element={<StudentHome />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="applications" element={<StudentsApplications />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="forum" element={<StudentForum />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboardRoute && !isStudentDashboardRoute && <Footer />}
    </>
  );
}

export default App;
