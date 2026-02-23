// eslint-disable-next-line no-unused-vars
import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { GoVerified } from "react-icons/go";
import { Link } from 'react-router-dom';
import logo from "../assets/uploads/logo.png";

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Alumni Directory', path: '/alumni' },
    { name: 'Photo Gallery', path: '/gallery' },
    { name: 'Career Opportunities', path: '/jobs' },
    { name: 'Community Forums', path: '/forums' },
    { name: 'About Us', path: '/about' },
    { name: 'Terms Of Service', path: '/terms'}
  ];

  // Logic to split links into two columns
  const half = Math.ceil(quickLinks.length / 2);
  const leftColLinks = quickLinks.slice(0, half);
  const rightColLinks = quickLinks.slice(half);

  const socialLinks = [
    { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  const contactInfo = [
    { 
      icon: <FaPhone />, 
      title: 'Phone', 
      value: '(+91) 888-585-8585', 
      link: 'tel:+918885858585' 
    },
    { 
      icon: <FaEnvelope />, 
      title: 'Email', 
      value: 'contact@paranox.edu', 
      link: 'mailto:contact@paranox.edu' 
    },
    { 
      icon: <FaMapMarkerAlt />, 
      title: 'Address', 
      value: '123 University Ave, Tech City, TC 12345', 
      link: '#' 
    },
  ];

  return (
    <footer className={`pt-5 pb-3 ${isDark ? 'bg-dark text-white' : 'bg-light text-dark'}`} 
            style={{ borderTop: isDark ? '1px solid #343a40' : '1px solid #dee2e6' }}>
      
      <style>
        {`
          .footer-link {
            transition: all 0.3s ease;
            color: ${isDark ? '#adb5bd' : '#6c757d'} !important;
          }
          .footer-link:hover {
            color: #03b3ff !important;
            padding-left: 5px;
            text-decoration: none;
          }
          .social-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
            transition: all 0.3s ease;
            color: ${isDark ? '#adb5bd' : '#6c757d'};
          }
          .social-icon:hover {
            background: #007bff;
            color: white !important;
            transform: translateY(-3px);
          }
          .contact-circle {
            width: 40px;
            height: 40px;
            min-width: 40px;
            background: ${isDark ? 'rgba(3, 179, 255, 0.1)' : 'rgba(0, 123, 255, 0.1)'};
            color: #007bff;
          }
        `}
      </style>

      <div className="container">
        <div className="row gy-4">
          {/* Brand Section */}
          <div className="col-lg-4 col-md-12">
            <div className="d-flex align-items-center mb-3">
              <img src={logo} alt="CS Paranox Logo" className="rounded-circle me-3" style={{ width: '45px', height: '45px' }} />
              <h5 className="mb-0 fw-bold letter-spacing-1">CS PARANOX</h5>
            </div>
            <p className="small lh-lg mb-4 opacity-75" style={{ maxWidth: '350px' }}>
              Empowering the academic community by bridging the gap between alumni, students, and faculty through a unified digital network.
            </p>
            <div className="d-flex gap-2 mb-4">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label={social.label}>
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section - Now Split into 2 columns */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-4 text-uppercase small">Quick Navigation</h6>
            <div className="row">
              <div className="col-6">
                <ul className="list-unstyled">
                  {leftColLinks.map((link, idx) => (
                    <li key={idx} className="mb-2">
                      <Link to={link.path} className="footer-link small d-inline-block text-decoration-none">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-6">
                <ul className="list-unstyled">
                  {rightColLinks.map((link, idx) => (
                    <li key={idx} className="mb-2">
                      <Link to={link.path} className="footer-link small d-inline-block text-decoration-none">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-4 text-uppercase small">Get In Touch</h6>
            <div className="d-flex flex-column gap-3">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="d-flex align-items-center">
                  <div className="contact-circle rounded-circle d-flex align-items-center justify-content-center me-3">
                    {info.icon}
                  </div>
                  <div>
                    <p className="small fw-bold mb-0">{info.title}</p>
                    {info.link !== '#' ? (
                      <a href={info.link} className="small text-decoration-none opacity-75 hover-opacity-100 transition-all text-reset">
                        {info.value}
                      </a>
                    ) : (
                      <span className="small opacity-75">{info.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <hr className="mt-5 mb-4 opacity-10" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small opacity-50 mb-md-0">
              © {currentYear} <span className="fw-bold">CS PARANOX</span>. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="small opacity-50 mb-0">
              Crafted with <span className="text-danger">❤</span> by{' '}
              <a
                href=""
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none fw-bold"
                style={{ color: '#03b3ff' }}
              >
                PARANOX
                <GoVerified className="ms-1" style={{ fontSize: '12px' }} />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;