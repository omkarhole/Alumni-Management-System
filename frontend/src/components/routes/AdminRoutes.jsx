import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Admin Page Components
import AdminHome from '../../admin/AdminHome';
import AdminCourses from '../../admin/AdminCourses';
import AdminUsers from '../../admin/AdminUsers';
import AdminGallery from '../../admin/AdminGallery';
import AdminSettings from '../../admin/AdminSettings';
import AdminEvents from '../../admin/AdminEvents';
import AdminForum from '../../admin/AdminForum';
import AdminAlumni from '../../admin/AdminAlumni';
import AdminJobs from '../../admin/AdminJobs';
import AdminJobApplications from '../../admin/AdminJobApplications';
import AdminNews from '../../admin/AdminNews';
import AdminMentorship from '../../admin/AdminMentorship';
import AdminReferrals from '../../admin/AdminReferrals';
import ManageJobs from '../../admin/save/ManageJobs';
import ManageEvents from '../../admin/save/ManageEvents';
import ManageForum from '../../admin/save/ManageForum';
import ManageUser from '../../admin/save/ManageUser';
import ViewAlumni from '../../admin/view/ViewAlumni';

// Component mapping
const componentMap = {
  AdminHome,
  AdminCourses,
  AdminUsers,
  AdminGallery,
  AdminSettings,
  AdminEvents,
  AdminForum,
  AdminAlumni,
  AdminJobs,
  AdminJobApplications,
  AdminNews,
  AdminMentorship,
  AdminReferrals,
  ManageJobs,
  ManageEvents,
  ManageForum,
  ManageUser,
  ViewAlumni,
};

/**
 * AdminRoutes Component
 * Renders admin dashboard nested routes (for use within Dashboard parent via Outlet)
 */
const AdminRoutes = () => {
  const adminRoutes = [
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
    { path: "jobs/manage", component: "ManageJobs" },
    { path: "events/manage", component: "ManageEvents" },
    { path: "forum/manage", component: "ManageForum" },
    { path: "users/manage", component: "ManageUser" },
    { path: "alumni/view", component: "ViewAlumni" },
  ];

  return (
    <Routes>
      {adminRoutes.map((route, index) => {
        const Component = componentMap[route.component];
        return (
          <Route
            key={index}
            path={route.path}
            element={<Component />}
            index={route.index || false}
          />
        );
      })}
    </Routes>
  );
};

export default AdminRoutes;
