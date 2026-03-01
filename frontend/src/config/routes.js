/**
 * Route Configuration
 * Centralized route definitions for the application
 * Split into: public routes, admin routes, student routes, and private routes
 */

// Public Routes - accessible to everyone
export const publicRoutes = [
  { path: "/", component: "Home", exact: true },
  { path: "/alumni", component: "AlumniList", exact: true },
  { path: "/gallery", component: "Gallery", exact: true },
  { path: "/jobs", component: "Careers", exact: true },
  { path: "/mentorship", component: "Mentorship", exact: true },
  { path: "/forums", component: "Forum", exact: true },
  { path: "/forum/view", component: "ViewTopic", exact: true },
  { path: "/news", component: "News", exact: true },
  { path: "/about", component: "About", exact: true },
  { path: "/contact", component: "Contact", exact: true },
  { path: "/terms", component: "TermsOfService", exact: true },
  { path: "/privacy", component: "PrivacyPolicy", exact: true },
  { path: "/login", component: "Login", exact: true },
  { path: "/signup", component: "Signup", exact: true },
  { path: "/oauth/complete-signup", component: "OAuthCompleteSignup", exact: true },
  { path: "/events/view", component: "ViewEvent", exact: true },
  { path: "/businesses", component: "BusinessDirectory", exact: true },
  { path: "/business/:businessId", component: "BusinessDetails", exact: true },
];

// Admin Routes - nested under /dashboard
export const adminRoutes = [
  { path: "", component: "AdminHome", index: true },
  { path: "courses", component: "AdminCourses" },
  { path: "users", component: "AdminUsers" },
  { path: "gallery", component: "AdminGallery" },
  { path: "settings", component: "AdminSettings" },
  { path: "events", component: "AdminEvents" },
  { path: "forum", component: "AdminForum" },
  { path: "alumnilist", component: "AdminAlumni" },
  { path: "jobs", component: "AdminJobs" },
  { path: "job-applications", component: "AdminJobApplications" },
  { path: "referrals", component: "AdminReferrals" },
  { path: "businesses", component: "AdminBusinesses" },
  { path: "jobs/manage", component: "ManageJobs" },
  { path: "events/manage", component: "ManageEvents" },
  { path: "forum/manage", component: "ManageForum" },
  { path: "users/manage", component: "ManageUser" },
  { path: "alumni/view", component: "ViewAlumni" },
];

// Student Routes - nested under /student-dashboard
export const studentRoutes = [
  { path: "", component: "StudentHome", index: true },
  { path: "jobs", component: "StudentJobs" },
  { path: "applications", component: "StudentsApplications" },
  { path: "events", component: "StudentEvents" },
  { path: "forum", component: "StudentForum" },
  { path: "profile", component: "StudentProfile" },
];

// Private Routes - require authentication
export const privateRoutes = [
  { 
    path: "/account", 
    component: "MyAccount", 
    roles: ["alumnus", "student"] 
  },
  { 
    path: "/job-recommendations", 
    component: "JobRecommendations", 
    roles: ["admin", "alumnus", "student"] 
  },
  { 
    path: "/register-business", 
    component: "RegisterBusiness", 
    roles: ["alumnus"] 
  },
  { 
    path: "/my-business", 
    component: "MyBusiness", 
    roles: ["alumnus"] 
  },
];

// Route Groups for easy import
export const routeGroups = {
  public: publicRoutes,
  admin: adminRoutes,
  student: studentRoutes,
  private: privateRoutes
};
