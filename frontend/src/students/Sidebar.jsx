
import { FaHome, FaUserGraduate, FaUsers, FaImage, FaBriefcase, FaBriefcaseMedical, FaFileAlt, FaCalendarAlt, FaComments, FaUser } from "react-icons/fa";

import { Link, useLocation } from 'react-router-dom';
import React from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {

     const location = useLocation();
        const isActive = (path) => {
            return location.pathname === path ? 'navactive' : '';
        };
        
  return (
      <aside id="sidebar" className={`sidebar ${isOpen ? 'open' : ''}`}>
            <ul className="sidebar-nav" id="sidebar-nav">
               <li onClick={toggleSidebar} className="nav-item">
                    <Link className={`nav-link ${isActive("/student-dashboard")}`} to="/student-dashboard">
                        <FaHome />
                        <span className="ms-1">Dashboard</span>
                    </Link>
                </li>
                <li onClick={toggleSidebar} className="nav-item">
                    <Link  className={`nav-link ${isActive("/student-dashboard/jobs")}`} to="/student-dashboard/jobs">
                        <FaBriefcase />
                        <span className='ms-1'>Browse Jobs</span>
                    </Link>
                </li>
                 <li onClick={toggleSidebar} className="nav-item">
                    <Link className={`nav-link ${isActive("/student-dashboard/applications")}`} to="/student-dashboard/applications">
                        <FaFileAlt />
                        <span className='ms-1'>My Applications</span>
                    </Link>
                </li>
                <hr />
                 <li onClick={toggleSidebar} className="nav-item">
                    <Link className={`nav-link ${isActive("/student-dashboard/events")}`} to="/student-dashboard/events">
                        <FaCalendarAlt />
                        <span className='ms-1'>Events</span>
                    </Link>
                </li>
                <li onClick={toggleSidebar} className="nav-item">
                    <Link className={`nav-link ${isActive("/student-dashboard/forum")}`} to="/student-dashboard/forum">
                        <FaComments />
                        <span className='ms-1'>Forum</span>
                    </Link>
                </li>
               <li onClick={toggleSidebar} className="nav-item">
                    <Link className={`nav-link ${isActive("/student-dashboard/profile")}`} to="/student-dashboard/profile">
                        <FaUser />
                        <span className='ms-1'>My Profile</span>
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className={`nav-link ${isActive("/dashboard/settings")}`} to={"/dashboard/settings"}>
                        <IoSettingsSharp />
                        <span className='ms-1'>Settings</span>
                    </Link>
                </li> */}
            </ul>
        </aside>
  )
}

export default Sidebar