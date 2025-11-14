import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [participatedEvents, setParticipatedEvents] = useState(new Set());
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${baseUrl}/events`, { withCredentials: true });
      setEvents(res.data);
      // Check participation from the commits array in each event
      const participated = new Set();
      res.data.forEach(event => {
        // Check if current user is in the commits array
        const isParticipated = event.commits?.some(
          commit => commit.user === userId || commit.user?._id === userId
        );
        if (isParticipated) {
          participated.add(event._id);
        }
      });
      setParticipatedEvents(participated);
    } catch (err) {
      console.log(err);
      toast.error('Failed to load events');
    }
  };

  const handleParticipate = async (eventId) => {
    try {
      await axios.post(
        `${baseUrl}/api/events/participate`,
        { event_id: eventId, user_id: userId },
        { withCredentials: true }
      );
      toast.success('Successfully joined the event!');
      setParticipatedEvents(prev => new Set([...prev, eventId]));
      // Refresh events to get updated commits count
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to join event');
    }
  };


  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(timestamp).toLocaleDateString('en-US', options);
  };

  // Function to truncate the content and remove HTML tags
  const CutContent = (content, maxLength) => {
    const strippedContent = content.replace(/<[^>]+>/g, ''); // Remove HTML tags
    if (strippedContent.length > maxLength) {
      return strippedContent.substring(0, maxLength) + '...';
    }
    return strippedContent;
  };

  return (
    <div className="container-fluid">
      <ToastContainer position="top-center" />
      <div className="col-lg-12">
        <div className="row mb-4 mt-4">
          <div className="col-md-12"></div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <b>List of Events</b>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-condensed table-bordered table-hover">
                    <thead>
                      <tr>
                        <th className="text-center">#</th>
                        <th className="">Schedule</th>
                        <th className="">Title</th>
                        <th className="">Description</th>
                        <th className="">Commited To Participate</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.length > 0 ? <>
                        {events.map((event, index) => {
                          const hasParticipated = participatedEvents.has(event._id);
                          return (
                            <tr key={event._id || index}>
                              <td className="text-center">{index + 1}</td>
                              <td>{formatDate(event.schedule)}</td>
                              <td>{event.title}</td>
                              <td>{CutContent(event.content, 50)}</td>
                              <td>{event.commits?.length || 0}</td>
                              <td className="text-center">
                                {hasParticipated ? (
                                  <span className="badge bg-success">Joined ✓</span>
                                ) : (
                                  <button
                                    onClick={() => handleParticipate(event._id)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Join Event
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}</> : <>
                        <tr>
                          <td colSpan={6} className="text-center">No Event Available</td>
                        </tr>
                      </>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEvents;
