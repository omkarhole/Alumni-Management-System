import axios from 'axios';
import { useEffect, useState } from 'react';
import { baseUrl } from '../utils/globalurl';

const About = () => {
  const [system, setSystem] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/settings`)
      .then((res) => {
        setSystem(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <header className="masthead" style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="row h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-10 mb-4" style={{ background: "rgba(0, 0, 0, 0.4)", borderRadius: "15px", padding: "40px" }}>
              <h1 className="text-uppercase text-white font-weight-bold">About Our Alumni Network</h1>
              <hr className="divider my-4 border-white" />
              <p className="text-white mb-5 lead">
                Connecting generations of excellence. Paranox SIH bridges the gap between the past and the future of our institution.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Mission Section */}
      <section className="page-section bg-light" id="about">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="mt-0">Our Mission</h2>
              <hr className="divider my-4" />
              <p className="text-muted mb-4">
                The <strong>Alumni Management System</strong> is a dedicated full-stack platform designed to help our educational institution maintain lifelong relationships with our graduates. Our goal is to foster a vibrant community where networking, career growth, and institutional support thrive in one centralized hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users / Purpose Grid */}
      <section className="page-section">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="p-3">
                <h4 className="font-weight-bold">For Alumni</h4>
                <p className="text-muted">Rediscover old classmates, find mentorship opportunities, and stay updated on institutional milestones.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h4 className="font-weight-bold">For Students</h4>
                <p className="text-muted">Access a powerful network of professionals for career guidance, job referrals, and real-world advice.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h4 className="font-weight-bold">For The Institution</h4>
                <p className="text-muted">Maintain an accurate database, track graduate success stories, and manage reunions with ease.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content from Database */}
      {system.length > 0 && (
        <section className="page-section bg-dark text-white">
          <div className="container">
            <h2 className='text-center'>{system[0].name} - System Update</h2>
            <br />
            {/* Using dangerouslySetInnerHTML only for trusted admin content */}
            <div 
              className="about-dynamic-content"
              dangerouslySetInnerHTML={{ __html: system[0].about_content }} 
            />
          </div>
        </section>
      )}
    </>
  );
};

export default About;