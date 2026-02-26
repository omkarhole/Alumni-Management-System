/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import SmoothWheelScroll from "./components/SmoothWheelScroll";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./components/Home";
import AlumniList from "./components/AlumniList";
import Gallery from "./components/Gallery";
import Messages from "./components/Messages";
import DirectChat from "./components/DirectChat";
import Careers from "./components/Careers";
import Mentorship from "./components/Mentorship";
import Forum from "./components/Forum";
import ViewTopic from "./components/view/View_Forum";
import News from "./components/News";
import About from "./components/About";
import Contact from "./components/Contact";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import OAuthCompleteSignup from "./components/OAuthCompleteSignup";
import MyAccount from "./components/MyAccount";
import NotFound from "./components/NotFound";
import ViewEvent from "./components/view/View_Event";

// Dashboard Layouts
import Dashboard from "./admin/Dashboard";
import StudentDashboard from "./students/StudentDashboard";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Private Route Components
import MyAccount from "./components/MyAccount";
import JobRecommendations from "./components/JobRecommendations";
import Chatbot from "./components/Chatbot";

// Not Found
import NotFound from "./components/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ScrollToTop />
          <SmoothWheelScroll />
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
      <ToastContainer
        position="top-center"
        hideProgressBar
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<AlumniList />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/jobs" element={<Careers />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/forums" element={<Forum />} />
        <Route path="/forum/view" element={<ViewTopic />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/oauth/complete-signup" element={<OAuthCompleteSignup />} />
        <Route path="/events/view" element={<ViewEvent />} />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allow={["admin"]}>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="*" element={<AdminRoutes />} />
        </Route>

        {/* Student Dashboard with Nested Routes */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute allow={["student"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        >
          <Route path="*" element={<StudentRoutes />} />
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

        <Route
          path="/job-recommendations"
          element={
            <PrivateRoute allow={["admin", "alumnus", "student"]}>
              <JobRecommendations />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideLayout && <Footer />}
      <Chatbot />
    </>
  );
}

export default App;
