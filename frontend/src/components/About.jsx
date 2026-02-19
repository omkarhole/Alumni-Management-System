import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { baseUrl } from '../utils/globalurl';

const About = () => {
  const [system, setSystem] = useState(null);


  useEffect(() => {
    // axios.get('http://localhost:3000/auth/settings')
    axios.get(`${baseUrl}/settings`)
      .then((res) => {
        const settings = Array.isArray(res.data)
          ? res.data.find((item) => item && typeof item === 'object')
          : res.data;
        setSystem(settings || null);
      })
      .catch((err) => console.log(err));
  }, []);


  return (
    <>
 <header className="masthead">
  <div className="container">
    {/* <div className="row align-items-center justify-content-center">
      <div className="col-lg-6 text-center">
        <img src={logo} className='aboutlogo img-fluid' alt="logo" />
      </div>
    </div> */}
    <div className="row mt-5  h-100 align-items-center justify-content-center text-center">
      <div className="col-lg-10 align-self-end mb-4" style={{ background: "#0000002e", borderRadius: "10px", padding: "20px" }}>
        <h2 className="text-uppercase text-white font-weight-bold">About Us.</h2>
        <hr className="divider my-4" />
        <p className="text-white-75 text-light mb-5">Paranox SIH.</p>
      </div>
    </div>
  </div>
</header>

      {system && (
        <section className="page-section">
          <div className="container">
            <h2 className='text-center'>{system.name || 'Alumni Management System'}</h2>
            <br />
            <p dangerouslySetInnerHTML={{ __html: system.about_content || '' }}></p>
          </div>
        </section>
      )}
    </>
  )
}

export default About;
