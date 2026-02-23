import axios from 'axios';
import  { useEffect, useState } from 'react';
import { baseUrl } from '../utils/globalurl';
import { useTheme } from '../ThemeContext'; 
import { FiTarget, FiAward, FiGlobe, FiArrowDown } from 'react-icons/fi';
import imgcs from "../assets/uploads/imgcs.jpg";

const About = () => {
  const { theme } = useTheme();
  const [system, setSystem] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/settings`)
      .then((res) => setSystem(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .about-masthead {
            position: relative;
            min-height: 80vh; /* Increased height */
            display: flex;
            align-items: center;
            justify-content: center;
            background-attachment: fixed; /* Parallax effect */
            color: white;
            padding: 10rem 0;
          }

          .hero-title {
            font-size: 3rem; /* Reduced from 4.5rem */
            font-weight: 700; /* Slightly less heavy */
            letter-spacing: 2px; /* Increased spacing for a cleaner look */
            text-shadow: 0px 4px 8px rgba(0,0,0,0.2);
            margin-bottom: 1rem;
          }

          .hero-subtitle {
            font-size: 1.15rem; /* Slightly smaller for better contrast */
            max-width: 700px;
            margin: 0 auto;
            line-height: 1.6;
            font-weight: 300; /* Light weight for elegance */
            opacity: 0.9;
          }

          .hero-overlay {
            background: rgba(0, 0, 0, 0.45); /* Softened overlay */
            backdrop-filter: blur(8px); /* Increased blur for premium feel */
            padding: 3.5rem; /* Slightly tighter padding */
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            animation: fadeInUp 1s ease-out;
          }

          .hover-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: none;
            border-radius: 20px;
            background: ${theme === 'dark' ? '#2c2c2c' : '#ffffff'};
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }

          .hover-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          }

          .card-accent {
            height: 6px;
            width: 100%;
            background: linear-gradient(90deg, #007bff, #00d4ff);
            position: absolute;
            top: 0;
            left: 0;
          }

          .bg-gradient-about {
            background: ${theme === 'dark' ? '#1a1a1a' : 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)'};
            padding: 7rem 0;
          }

          .scroll-indicator {
            position: absolute;
            bottom: 30px;
            animation: bounce 2s infinite;
            font-size: 2rem;
            opacity: 0.7;
          }

          .hover-card:hover .icon-box {
            background: #007bff;
            color: white;

          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-10px);}
            60% {transform: translateY(-5px);}
          }
          
        `}
      </style>

      {/* Hero Header */}
      <header className="about-masthead" style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${imgcs})`, 
        backgroundPosition: "center", 
        backgroundRepeat: "no-repeat", 
        backgroundSize: "cover"
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <div className="hero-overlay">
                <h1 className="hero-title text-uppercase">About Paranox SIH</h1>
                <div className="divider my-4 bg-primary mx-auto" style={{ width: '80px', height: '4px', borderRadius: '2px' }} />
                <p className="hero-subtitle mb-0 text-white-75">
                  Empowering our legacy, building our future. We connect generations of excellence through a unified digital ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <FiArrowDown />
        </div>
      </header>

      {/* Mission Section */}
      <section className={`page-section bg-${theme} py-5 mt-5`}>
        <div className="container text-center">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <h2 className="section-heading text-uppercase font-weight-bold">Our Vision & Mission</h2>
              <p className="text-muted lead">
                Redefining how alumni stay connected with their roots.
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card hover-card h-100 p-5 position-relative border-0">
                <div className="card-accent"></div>
                <div className="card-body">
                  <div className="icon-box" style={{ width: '80px', height: '80px', background: '#007bff15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#007bff' }}>
                    <FiTarget size={35} />
                  </div>
                  <h4 className="font-weight-bold mb-3">Our Goal</h4>
                  <p className="text-muted">To digitize and streamline alumni relations, making it easier than ever to track and celebrate our graduates&apos; success.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card hover-card h-100 p-5 position-relative border-0">
                <div className="card-accent"></div>
                <div className="card-body">
                  <div className="icon-box" style={{ width: '80px', height: '80px', background: '#007bff15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#007bff' }}>
                    <FiGlobe size={35} />
                  </div>
                  <h4 className="font-weight-bold mb-3">Community</h4>
                  <p className="text-muted">Creating a global network where mentors and mentees connect to drive innovation and career advancement.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card hover-card h-100 p-5 position-relative border-0">
                <div className="card-accent"></div>
                <div className="card-body">
                  <div className="icon-box" style={{ width: '80px', height: '80px', background: '#007bff15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#007bff' }}>
                    <FiAward size={35} />
                  </div>
                  <h4 className="font-weight-bold mb-3">Impact</h4>
                  <p className="text-muted">Fostering institutional growth through alumni contributions, guest lectures, and collaborative projects.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic System Content Section */}
      <section className="bg-gradient-about">
        <div className="container">
          {system.length > 0 ? (
            <div className="card border-0 shadow-lg" style={{ borderRadius: '30px', overflow: 'hidden' }}>
              <div className="row g-0">
                <div className="col-md-4 bg-primary d-flex align-items-center justify-content-center p-5 text-white">
                  <div className="text-center">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>🚀</div>
                    <h2 className="font-weight-bold">System Profile</h2>
                    <p className="opacity-75">Platform Identity</p>
                  </div>
                </div>
                <div className="col-md-8 p-5 bg-white">
                  <h2 className="text-primary font-weight-bold mb-4">{system[0].name}</h2>
                  <div 
                    className="text-secondary" 
                    style={{ fontSize: '1.15rem', lineHeight: '1.9' }}
                    dangerouslySetInnerHTML={{ __html: system[0].about_content }} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="p-5 border rounded-3 bg-white shadow-sm">
                <h4 className="text-dark font-weight-bold">Welcome to our Alumni Portal</h4>
                <p className="text-muted">
                  We are currently updating our institutional profile. 
                  Please check back soon for detailed information about our mission and history.
                </p>
                <hr className="divider my-4" style={{maxWidth: '50px'}} />
                <p className="small text-uppercase tracking-wider">Paranox SIH Ecosystem</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default About;