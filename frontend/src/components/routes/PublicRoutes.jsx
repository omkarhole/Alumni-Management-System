import React from 'react';
import { Route } from 'react-router-dom';

// Page Components
import Home from '../Home';
import AlumniList from '../AlumniList';
import Gallery from '../Gallery';
import Careers from '../Careers';
import Mentorship from '../Mentorship';
import Forum from '../Forum';
import ViewTopic from '../view/View_Forum';
import News from '../News';
import About from '../About';
import Contact from '../Contact';
import TermsOfService from '../TermsOfService';
import PrivacyPolicy from '../PrivacyPolicy';
import Login from '../Login';
import Signup from '../Signup';
import OAuthCompleteSignup from '../OAuthCompleteSignup';
import ViewEvent from '../view/View_Event';
import BusinessDirectory from '../BusinessDirectory';
import BusinessDetails from '../BusinessDetails';

// Component mapping
const componentMap = {
  Home,
  AlumniList,
  Gallery,
  Careers,
  Mentorship,
  Forum,
  ViewTopic,
  News,
  About,
  Contact,
  TermsOfService,
  PrivacyPolicy,
  Login,
  Signup,
  OAuthCompleteSignup,
  ViewEvent,
  BusinessDirectory,
  BusinessDetails,
};

/**
 * PublicRoutes Component
 * Renders all public routes that are accessible to everyone
 */
const PublicRoutes = () => {
  const publicRoutes = [
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

  return (
    <>
      {publicRoutes.map((route, index) => {
        const Component = componentMap[route.component];
        return (
          <Route
            key={index}
            path={route.path}
            element={<Component />}
          />
        );
      })}
    </>
  );
};

export default PublicRoutes;
