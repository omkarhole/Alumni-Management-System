import React from 'react';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const { theme } = useTheme();

  // Compute theme-dependent values
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedTextColor = isDark ? 'text-light' : 'text-muted';
  const bgColor = isDark ? 'bg-dark' : 'bg-light';
  const cardBgColor = isDark ? 'bg-secondary' : 'bg-light';

  return (
    <>
      <header className="masthead">
        <div className="container-fluid h-100">
          <div className="row h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-8 align-self-end mb-4 page-title">
              <h1 className="text-white">Terms of Service</h1>
              <hr className="divider my-4" />
              <p className="text-white-75">
                Please read these terms carefully before using our platform.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className={`page-section ${bgColor}`}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              
              {/* 1. Introduction */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>1. Introduction</h2>
                <p className={mutedTextColor}>
                  Welcome to the Alumni Management System. By accessing or using our platform,
                  you agree to be bound by these Terms of Service. If you do not agree with
                  any part of these terms, please do not use our services.
                </p>
                <p className={mutedTextColor}>
                  Last Updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* 2. User Responsibilities */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>2. User Responsibilities</h2>
                <p className={mutedTextColor}>
                  As a user of our platform, you agree to:
                </p>
                <ul className={mutedTextColor}>
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                  <li>Use the platform in compliance with all applicable laws and regulations</li>
                  <li>Respect the intellectual property rights of others</li>
                </ul>
              </div>

              {/* 3. Account Usage */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>3. Account Usage</h2>
                <p className={mutedTextColor}>
                  You are responsible for all activities that occur under your account.
                  We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
                <h5 className={`${textColor} mt-3`}>Account Termination</h5>
                <p className={mutedTextColor}>
                  You may terminate your account at any time by contacting us. We may terminate
                  or suspend your account for violations of these terms without prior notice.
                </p>
              </div>

              {/* 4. Content Policy */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>4. Content Policy</h2>
                <p className={mutedTextColor}>
                  Users are prohibited from posting content that:
                </p>
                <ul className={mutedTextColor}>
                  <li>Is illegal, harmful, or offensive</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains malware or malicious code</li>
                  <li>Violates privacy or confidentiality</li>
                  <li>Is spam or unsolicited advertising</li>
                </ul>
                <p className={mutedTextColor}>
                  We reserve the right to remove any content that violates this policy.
                </p>
              </div>

              {/* 5. Privacy Reference */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>5. Privacy</h2>
                <p className={mutedTextColor}>
                  Your privacy is important to us. Please review our Privacy Policy to
                  understand how we collect, use, and protect your personal information.
                </p>
                <p className={mutedTextColor}>
                  By using our platform, you consent to the collection and use of your
                  information as described in our Privacy Policy.
                </p>
              </div>

              {/* 6. Limitation of Liability */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>6. Limitation of Liability</h2>
                <p className={mutedTextColor}>
                  The Alumni Management System is provided "as is" without warranties of any kind.
                  We are not liable for any damages arising from your use of the platform, including:
                </p>
                <ul className={mutedTextColor}>
                  <li>Direct, indirect, incidental, or consequential damages</li>
                  <li>Loss of data or profits</li>
                  <li>Service interruptions or errors</li>
                  <li>Unauthorized access to your account</li>
                </ul>
              </div>

              {/* 7. Contact Information */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>7. Contact Information</h2>
                <p className={mutedTextColor}>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className={`p-4 rounded ${cardBgColor}`}>
                  <p className={`mb-2 ${textColor}`}>
                    <strong>Email:</strong> contact@paranox.edu
                  </p>
                  <p className={`mb-2 ${textColor}`}>
                    <strong>Phone:</strong> (+91) 888-585-8585
                  </p>
                  <p className={`mb-0 ${textColor}`}>
                    <strong>Address:</strong> India
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsOfService;
