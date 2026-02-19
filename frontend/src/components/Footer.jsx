import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { GoVerified } from "react-icons/go";
import { Link } from 'react-router-dom';
import logo from "../assets/uploads/logo.png";

const Footer = () => {
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedTextColor = isDark ? 'text-gray-400' : 'text-muted';
  const bgColor = isDark ? 'bg-dark' : 'bg-light';
  const borderColor = isDark ? 'border-secondary' : 'border-gray-300';
  const iconColor = isDark ? '#6c757d' : '#6c757d';
  const linkHoverColor = isDark ? 'text-white' : 'text-primary';

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Alumni', path: '/alumni' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Forums', path: '/forums' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Terms of Service', path: '/terms' },
  ];

  const socialLinks = [
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className={`${bgColor} ${textColor} pt-5 pb-3`} style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
      <div className="container">
        {/* Main Footer Content */}
        <div className="row mb-4">
          {/* About Section */}
          <div className="col-12 col-md-6 col-lg-4 mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-3">
              <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '12px' }} />
              <h5 className="mb-0 font-weight-bold">CS PARANOX</h5>
            </div>
            <p className={`${mutedTextColor} mb-3`} style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Connecting alumni, students, and faculty through a unified platform. 
              Share experiences, find opportunities, and stay connected with your academic community.
            </p>
            {/* Social Media Icons */}
            <div className="d-flex gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`${mutedTextColor} ${linkHoverColor} transition-all`}
                  style={{ 
                    fontSize: '1.25rem', 
                    marginRight: '12px',
                    transition: 'color 0.3s ease, transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.color = isDark ? '#fff' : '#007bff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.color = iconColor;
                  }}
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="col-12 col-md-6 col-lg-4 mb-4 mb-lg-0">
            <h5 className="mb-3 font-weight-bold">Quick Links</h5>
            <ul className="list-unstyled mb-0">
              {quickLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.path} 
                    className={`${mutedTextColor} ${linkHoverColor} text-decoration-none`}
                    style={{ 
                      fontSize: '0.95rem',
                      transition: 'color 0.3s ease, padding-left 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.paddingLeft = '5px';
                      e.currentTarget.style.color = isDark ? '#fff' : '#007bff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.paddingLeft = '0';
                      e.currentTarget.style.color = isDark ? '#adb5bd' : '#6c757d';
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-12 col-md-12 col-lg-4">
            <h5 className="mb-3 font-weight-bold">Contact Us</h5>
            <div className="d-flex flex-column gap-3">
              {/* Phone */}
              <div className="d-flex align-items-start">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,123,255,0.1)',
                    minWidth: '40px',
                    marginRight: '12px'
                  }}
                >
                  <FaPhone style={{ color: '#007bff', fontSize: '1rem' }} />
                </div>
                <div>
                  <h6 className={`mb-1 ${textColor}`} style={{ fontSize: '0.9rem', fontWeight: '600' }}>Phone</h6>
                  <a 
                    href="tel:+918885858585" 
                    className={`${mutedTextColor} text-decoration-none`}
                    style={{ fontSize: '0.95rem' }}
                  >
                    (+91) 888-585-8585
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="d-flex align-items-start">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,123,255,0.1)',
                    minWidth: '40px',
                    marginRight: '12px'
                  }}
                >
                  <FaEnvelope style={{ color: '#007bff', fontSize: '1rem' }} />
                </div>
                <div>
                  <h6 className={`mb-1 ${textColor}`} style={{ fontSize: '0.9rem', fontWeight: '600' }}>Email</h6>
                  <a 
                    href="mailto:contact@paranox.edu" 
                    className={`${mutedTextColor} text-decoration-none`}
                    style={{ fontSize: '0.95rem' }}
                  >
                    contact@paranox.edu
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="d-flex align-items-start">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle mr-3"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,123,255,0.1)',
                    minWidth: '40px',
                    marginRight: '12px'
                  }}
                >
                  <FaMapMarkerAlt style={{ color: '#007bff', fontSize: '1rem' }} />
                </div>
                <div>
                  <h6 className={`mb-1 ${textColor}`} style={{ fontSize: '0.9rem', fontWeight: '600' }}>Address</h6>
                  <span className={`${mutedTextColor}`} style={{ fontSize: '0.95rem' }}>
                    India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className={`my-4 ${borderColor}`} style={{ opacity: 0.3 }} />

        {/* Copyright Section */}
        <div className="row align-items-center">
          <div className="col-12 col-md-6 text-center text-md-left mb-2 mb-md-0">
            <p className={`${mutedTextColor} mb-0`} style={{ fontSize: '0.875rem' }}>
              Copyright © {currentYear} CS PARANOX. All rights reserved.
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-right">
            <p className={`${mutedTextColor} mb-0`} style={{ fontSize: '0.875rem' }}>
              Developed with {'</>'} by{' '}
              <a
                href=""
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none font-weight-bold"
                style={{ color: '#03b3ff' }}
              >
                PARANOX
                <GoVerified style={{ fontSize: '12px', marginLeft: '2px', color: '#03b3ff' }} />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
