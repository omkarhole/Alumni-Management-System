import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./components/Home";
import AlumniList from "./components/AlumniList";
import Gallery from "./components/Gallery";
import Messages from "./components/Messages";
import DirectChat from "./components/DirectChat";
import Careers from "./components/Careers";
import Forum from "./components/Forum";
import About from "./components/About";
import Contact from "./components/Contact";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MyAccount from "./components/MyAccount";
import NotFound from "./components/NotFound";
import Achievements from "./components/Achievements";

// Admin
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
import AdminNews from "./admin/AdminNews";
import AdminMentorship from "./admin/AdminMentorship";
import AdminReferrals from "./admin/AdminReferrals";

import ManageJobs from "./admin/save/ManageJobs";
import ManageEvents from "./admin/save/ManageEvents";
import ManageForum from "./admin/save/ManageForum";
import ManageUser from "./admin/save/ManageUser";
import ViewAlumni from "./admin/view/ViewAlumni";

// Students
import StudentDashboard from "./students/StudentDashboard";
import StudentHome from "./students/StudentHome";
import StudentJobs from "./students/StudentJobs";
import StudentEvents from "./students/StudentEvents";
import StudentForum from "./students/StudentForum";
import StudentProfile from "./students/StudentProfile";
import StudentsApplications from "./students/StudentsApplications";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

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

  const hideLayout =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/student-dashboard");

  if (!isAuthReady) return null;

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
{/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<AlumniList />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/jobs" element={<Careers />} />
        <Route path="/forums" element={<Forum />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
<Route path="/achievements" element={<Achievements />} />

        {/* Direct Messages */}
        <Route
          path="/messages"
          element={
            <PrivateRoute allow={["alumnus", "student", "admin"]}>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/:userId"
          element={
            <PrivateRoute allow={["alumnus", "student", "admin"]}>
              <DirectChat />
            </PrivateRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allow={["admin"]}>
              <Dashboard />
            </PrivateRoute>
          }
        >
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
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="jobs/manage" element={<ManageJobs />} />
          <Route path="events/manage" element={<ManageEvents />} />
          <Route path="forum/manage" element={<ManageForum />} />
          <Route path="users/manage" element={<ManageUser />} />
          <Route path="alumni/view" element={<ViewAlumni />} />
        </Route>

        {/* Student Dashboard */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute allow={["student"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="applications" element={<StudentsApplications />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="forum" element={<StudentForum />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Account (Student + Alumnus) */}
        <Route
          path="/account"
          element={
            <PrivateRoute allow={["alumnus", "student"]}>
              <MyAccount />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
