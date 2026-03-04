import React from 'react';
import { Route } from 'react-router-dom';

// Import from centralized config
import { publicRoutes } from '../../config/routes';

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
import VerificationRequest from '../VerificationRequest';
import Leaderboard from '../Leaderboard';


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
  VerificationRequest,
  Leaderboard,
};

/**
 * PublicRoutes Component
 * Renders all public routes that are accessible to everyone
 * Routes are imported from centralized config/routes.js
 */
const PublicRoutes = () => {
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
