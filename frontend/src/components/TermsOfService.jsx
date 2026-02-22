// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useTheme } from '../ThemeContext';
import { FiShield, FiFileText, FiUserCheck, FiAlertCircle } from 'react-icons/fi';

const TermsOfService = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-vh-100 py-5 ${isDark ? 'bg-dark text-white' : 'bg-light text-dark'}`} 
         style={{ background: isDark ? '#121212' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      
      <style>
        {`
          .terms-container {
            border-radius: 20px;
            background: ${isDark ? 'rgba(44, 44, 44, 0.6)' : 'rgba(255, 255, 255, 0.9)'};
            backdrop-filter: blur(10px);
            border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            padding: 3rem;
          }
          .section-title {
            color: #007bff;
            font-weight: 700;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .terms-text {
            line-height: 1.8;
            color: ${isDark ? '#adb5bd' : '#495057'};
            font-size: 1.05rem;
            margin-bottom: 2.5rem;
          }
          @media (max-width: 768px) {
            .terms-container { padding: 1.5rem; }
            .display-4 { font-size: 2.5rem; }
          }
        `}
      </style>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Section */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold">Terms of Service</h1>
              <p className="text-muted">Last Updated: February 2026</p>
              <div className="divider mx-auto bg-primary" style={{ width: '60px', height: '4px', borderRadius: '2px' }} />
            </div>

            <div className="terms-container">
              {/* Introduction */}
              <div className="mb-5">
                <h3 className="section-title"><FiFileText /> 1. Acceptance of Terms</h3>
                <p className="terms-text">
                  By accessing and using the CS PARANOX Alumni Management System, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our platform. These terms apply to all visitors, alumni, students, and administrative users.
                </p>
              </div>

              {/* User Conduct */}
              <div className="mb-5">
                <h3 className="section-title"><FiUserCheck /> 2. User Accounts & Conduct</h3>
                <p className="terms-text">
                  Users are responsible for maintaining the confidentiality of their account credentials. You agree not to engage in any activity that interferes with or disrupts the service, including the distribution of spam, harassment of other members, or posting of unauthorized content.
                </p>
                <ul className={`${isDark ? 'text-gray-400' : 'text-muted'} lh-lg mb-4`}>
                  <li>You must provide accurate and complete registration information.</li>
                  <li>Impersonating other alumni or faculty is strictly prohibited.</li>
                  <li>Harassment or hate speech in forums will result in immediate account suspension.</li>
                </ul>
              </div>

              {/* Data Privacy */}
              <div className="mb-5">
                <h3 className="section-title"><FiShield /> 3. Data Usage & Privacy</h3>
                <p className="terms-text">
                  Your privacy is important to us. Information collected through this system—including professional details and contact info—is used solely for institutional purposes, networking, and career support. We do not sell your personal data to third-party advertisers.
                </p>
              </div>

              {/* Limitations */}
              <div className="mb-5">
                <h3 className="section-title"><FiAlertCircle /> 4. Limitations of Liability</h3>
                <p className="terms-text">
                  CS PARANOX provides this platform &quot;as is&quot; without any warranties. While we strive to maintain a secure and error-free environment, we are not liable for any direct or indirect damages arising from your use of the alumni directory, career portal, or discussion forums.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mt-5 p-4 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25">
                <h5 className="fw-bold mb-3">Questions about our Terms?</h5>
                <p className="mb-0 opacity-75" style={{color: '#ffffff'}}>
                  If you have any questions regarding these terms, please contact our administration office at 
                  <a href="mailto:admin@paranox.edu" className="ms-2 fw-bold text-decoration-none" style={{ color: '#007bff' }}>
                    admin@paranox.edu
                  </a>
                </p>
              </div>
            </div>

            {/* Footer-link back to home */}
            <div className="text-center mt-5">
              <a href="/" className="btn btn-outline-primary px-4 py-2 rounded-pill shadow-sm">
                Return to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;