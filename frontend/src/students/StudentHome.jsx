import React, { useState, useEffect } from 'react';
import { FaUsers , FaBriefcase} from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import { RiSuitcaseFill } from "react-icons/ri";
import { MdForum } from "react-icons/md";
import axios from "axios";
import { studentUrl } from '../utils/globalurl';

const InfoCard = ({ title, count, Icon, className }) => (
  <div className="col-xxl-4 col-xl-6">
    <div className={`card info-card ${className}`}>
      <div className="card-body">
      <h5 className="card-title" dangerouslySetInnerHTML={{ __html: title }}></h5>
        <div className="d-flex align-items-center justify-content-center justify-content-sm-start  ">
          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
            <Icon />
          </div>
          <div className="ps-3">
            <h6>{count}</h6>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudentHome = () => {
   const [counts, setCounts] = useState({
      forums: 0,
      jobs: 0,
      upevents: 0,
      applications:0
    });
     useEffect(() => {
    axios.get(`${studentUrl}/dashboard/counts`, { withCredentials: true })
      .then((res) => {
        console.log("Counts data:", res.data);
        setCounts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching counts:", err);
        // Don't show alert for 401 errors (just not authenticated)
        if (err.response?.status !== 401) {
          console.error('Failed to fetch counts');
        }
      });
  }, []);

  return (
      <>
        <section className="section dashboard cutommargin p-3  ">
            <div className="row">
              <div className="col-lg-10 m-2">
                <div className="row">
                  <InfoCard title={`Available Jobs <span>| Total</span>`} count={counts.jobs} Icon={FaUsers} className="customers-card" />
                  <InfoCard title="My Applications <span>| Total</span>" count={counts.applications} Icon={MdForum} className="sales-card" />
                  <InfoCard title="Forum Topic <span>| Now</span>" count={counts.forums} Icon={FaBriefcase} className="revenue-card" />
                  <InfoCard title="Upcoming Events <span>| Total</span>" count={counts.upevents} Icon={IoCalendar} className="purple-card" />
                </div>
              </div>
            </div>
          </section>
        </>
  )
}

export default StudentHome
