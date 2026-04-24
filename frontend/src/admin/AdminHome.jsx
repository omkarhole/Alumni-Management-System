import { FaUsers , FaBriefcase} from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import { RiSuitcaseFill } from "react-icons/ri";
import { MdForum } from "react-icons/md";
import PropTypes from 'prop-types';
import useDashboard from '../hooks/useDashboard';

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

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  Icon: PropTypes.elementType.isRequired,
  className: PropTypes.string.isRequired,
};

const AdminHome = () => {
  const { counts } = useDashboard('admin');

  return (
    <>
      <section className="section dashboard cutommargin p-3  ">
        <div className="row">
          <div className="col-lg-10 m-2">
            <div className="row">
              <InfoCard title={`Alumni <span>| Total</span>`} count={counts.alumni} Icon={FaUsers} className="customers-card" />
              <InfoCard title="Forum Topics <span>| Total</span>" count={counts.forums} Icon={MdForum} className="sales-card" />
              <InfoCard title="Posted Jobs <span>| Now</span>" count={counts.jobs} Icon={FaBriefcase} className="revenue-card" />
                <InfoCard title="Upcoming Events <span>| Total</span>" count={counts.upevents} Icon={IoCalendar} className="purple-card" />
                <InfoCard title="Students <span>| Total</span>" count={counts.students} Icon={RiSuitcaseFill} className="students-card" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminHome;
