import React from 'react';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              <h1 className="text-white">Privacy Policy</h1>
              <hr className="divider my-4" />
              <p className="text-white-75">
                Your privacy is important to us. Learn how we protect your information.
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
                  This Privacy Policy outlines how the Alumni Management System collects, uses, 
                  discloses, and safeguards your information when you use our platform. We are 
                  committed to protecting your personal information and giving you control over 
                  how your data is used.
                </p>
                <p className={mutedTextColor}>
                  Last Updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* 2. Information We Collect */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>2. Information We Collect</h2>
                <p className={mutedTextColor}>
                  We collect the following types of information:
                </p>
                <ul className={mutedTextColor}>
                  <li><strong>Personal Information:</strong> Name, email address, phone number, 
                    graduation year, major, and other contact information you provide</li>
                  <li><strong>Profile Information:</strong> Profile picture, bio, work experience, 
                    and education history</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform</li>
                  <li><strong>Communication Data:</strong> Messages you send through our platform</li>
                  <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
                </ul>
              </div>

              {/* 3. How We Use Your Information */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>3. How We Use Your Information</h2>
                <p className={mutedTextColor}>
                  We use your information for the following purposes:
                </p>
                <ul className={mutedTextColor}>
                  <li>To provide and maintain our services</li>
                  <li>To notify you about changes to our services</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information so that we can improve our services</li>
                  <li>To monitor the usage of our services</li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>To connect alumni with each other for networking opportunities</li>
                  <li>To facilitate mentorship programs and career services</li>
                </ul>
              </div>

              {/* 4. Data Protection */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>4. Data Protection</h2>
                <p className={mutedTextColor}>
                  We implement appropriate technical and organizational security measures to protect 
                  your personal information against unauthorized access, alteration, disclosure, or 
                  destruction. These measures include:
                </p>
                <ul className={mutedTextColor}>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data storage practices</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p className={mutedTextColor}>
                  While we strive to protect your personal information, no method of transmission 
                  over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>

              {/* 5. Third-Party Services */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>5. Third-Party Services</h2>
                <p className={mutedTextColor}>
                  Our platform may contain links to third-party websites, services, or applications 
                  that are not operated by us. We have no control over and assume no responsibility 
                  for the content, privacy policies, or practices of any third-party sites or services.
                </p>
                <p className={mutedTextColor}>
                  We may also use third-party service providers to help us operate our business and 
                  administer activities on our behalf, such as hosting services, analytics, and email 
                  delivery. These third parties may have access to your personal information only to 
                  perform these tasks on our behalf.
                </p>
              </div>

              {/* 6. Your Rights */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>6. Your Rights</h2>
                <p className={mutedTextColor}>
                  You have the following rights regarding your personal information:
                </p>
                <ul className={mutedTextColor}>
                  <li><strong>Right to Access:</strong> You can request copies of your personal information</li>
                  <li><strong>Right to Rectification:</strong> You can request that we correct any information 
                    you believe is inaccurate</li>
                  <li><strong>Right to Erasure:</strong> You can request that we erase your personal information 
                    under certain conditions</li>
                  <li><strong>Right to Restrict Processing:</strong> You can request that we restrict the 
                    processing of your information</li>
                  <li><strong>Right to Data Portability:</strong> You can request that we transfer your 
                    information to another organization</li>
                  <li><strong>Right to Object:</strong> You can object to our processing of your personal information</li>
                </ul>
                <p className={mutedTextColor}>
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </div>

              {/* 7. Cookies Policy */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>7. Cookies Policy</h2>
                <p className={mutedTextColor}>
                  We use cookies and similar tracking technologies to track the activity on our service 
                  and hold certain information. Cookies are files with a small amount of data that may 
                  include an anonymous unique identifier.
                </p>
                <p className={mutedTextColor}>
                  We use the following types of cookies:
                </p>
                <ul className={mutedTextColor}>
                  <li><strong>Essential Cookies:</strong> Required for the operation of our platform</li>
                  <li><strong>Analytics Cookies:</strong> To help us understand how users interact with our platform</li>
                  <li><strong>Functionality Cookies:</strong> To remember your preferences and settings</li>
                  <li><strong>Advertising Cookies:</strong> To deliver relevant advertisements</li>
                </ul>
                <p className={mutedTextColor}>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is 
                  being sent. However, if you do not accept cookies, you may not be able to use some 
                  portions of our service.
                </p>
              </div>

              {/* 8. Changes to This Policy */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>8. Changes to This Policy</h2>
                <p className={mutedTextColor}>
                  We may update our Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last Updated" date 
                  at the top of this policy.
                </p>
                <p className={mutedTextColor}>
                  You are advised to review this Privacy Policy periodically for any changes. Changes 
                  to this Privacy Policy are effective when they are posted on this page.
                </p>
              </div>

              {/* 9. Contact Information */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>9. Contact Information</h2>
                <p className={mutedTextColor}>
                  If you have any questions about this Privacy Policy, please contact us:
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

              {/* 10. Links to Terms of Service */}
              <div className="mb-5">
                <h2 className={`${textColor} mb-3`}>10. Related Policies</h2>
                <p className={mutedTextColor}>
                  Please also review our <Link to="/terms" className="text-decoration-none" style={{ color: '#007bff' }}>Terms of Service</Link> 
                  {' '}which outlines the terms and conditions governing your use of our platform.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
