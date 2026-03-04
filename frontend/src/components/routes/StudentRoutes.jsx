import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import from centralized config
import { studentRoutes } from '../../config/routes';

// Student Page Components
import StudentHome from '../../students/StudentHome';
import StudentJobs from '../../students/StudentJobs';
import StudentEvents from '../../students/StudentEvents';
import StudentForum from '../../students/StudentForum';
import StudentProfile from '../../students/StudentProfile';
import StudentsApplications from '../../students/StudentsApplications';

// Component mapping
const componentMap = {
  StudentHome,
  StudentJobs,
  StudentEvents,
  StudentForum,
  StudentProfile,
  StudentsApplications,
};

/**
 * StudentRoutes Component
 * Renders student dashboard nested routes (for use within StudentDashboard parent via Outlet)
 * Routes are imported from centralized config/routes.js
 */
const StudentRoutes = () => {
  return (
    <Routes>
      {studentRoutes.map((route, index) => {
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

export default StudentRoutes;
