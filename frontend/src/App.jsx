/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import SmoothWheelScroll from "./components/SmoothWheelScroll";
import PrivateRoute from "./components/PrivateRoute";

// Route Group Components
import PublicRoutes from "./components/routes/PublicRoutes";
import AdminRoutes from "./components/routes/AdminRoutes";
import StudentRoutes from "./components/routes/StudentRoutes";

// Dashboard Layouts
import Dashboard from "./admin/Dashboard";
import StudentDashboard from "./students/StudentDashboard";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Private Route Components
import MyAccount from "./components/MyAccount";
import JobRecommendations from "./components/JobRecommendations";

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
        <Route path="/*" element={<PublicRoutes />} />

        {/* Admin Dashboard with Nested Routes */}
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
    </>
  );
}

export default App;
