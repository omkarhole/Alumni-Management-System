import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ChevronRight, 
  Trash2, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/MyEvents.css';

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingEventId, setCancellingEventId] = useState(null);

  useEffect(() => {
    fetchMyRsvps();
  }, []);

  const fetchMyRsvps = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/event-calendar/my-rsvps`,
        { withCredentials: true }
      );
      setEvents(response.data);
      applyFilters(response.data, 'all');
    } catch (err) {
      setError('Failed to load your events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (eventList, filter) => {
    let filtered = eventList;

    if (filter === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.startDate) > new Date());
    } else if (filter === 'past') {
      filtered = filtered.filter(e => new Date(e.startDate) <= new Date());
    } else if (filter === 'confirmed') {
      filtered = filtered.filter(e => 
        e.rsvps.some(r => r.status === 'confirmed' && r.alumni._id === localStorage.getItem('userId'))
      );
    } else if (filter === 'waitlist') {
      filtered = filtered.filter(e => 
        e.rsvps.some(r => r.status === 'waitlist' && r.alumni._id === localStorage.getItem('userId'))
      );
    }

    setFilteredEvents(filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
  };

  const handleFilterChange = (newFilter) => {
    setSelectedFilter(newFilter);
    applyFilters(events, newFilter);
  };

  const handleCancelRsvp = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your RSVP?')) return;

    try {
      setCancellingEventId(eventId);
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/event-calendar/cancel-rsvp`,
        { eventId },
        { withCredentials: true }
      );

      setEvents(events.map(e => 
        e._id === eventId 
          ? { ...e, rsvps: e.rsvps.filter(r => r.alumni._id !== localStorage.getItem('userId')) }
          : e
      ));

      applyFilters(
        events.map(e => 
          e._id === eventId 
            ? { ...e, rsvps: e.rsvps.filter(r => r.alumni._id !== localStorage.getItem('userId')) }
            : e
        ),
        selectedFilter
      );

      toast.success('RSVP cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel RSVP');
      console.error(err);
    } finally {
      setCancellingEventId(null);
    }
  };

  const getUserRsvpStatus = (event) => {
    const userId = localStorage.getItem('userId');
    const userRsvp = event.rsvps.find(r => r.alumni._id === userId);
    return userRsvp?.status || null;
  };

  const isEventUpcoming = (eventDate) => {
    return new Date(eventDate) > new Date();
  };

  return (
    <div className="my-events-container">
      {/* Header */}
      <div className="my-events-header">
        <div>
          <h1>My Events</h1>
          <p className="subtitle">Manage your RSVPed events</p>
        </div>
        <button 
          className="btn-browse-events"
          onClick={() => navigate('/events')}
        >
          Browse More Events
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="my-events-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <Filter size={16} /> All Events
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleFilterChange('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'past' ? 'active' : ''}`}
            onClick={() => handleFilterChange('past')}
          >
            Past
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'waitlist' ? 'active' : ''}`}
            onClick={() => handleFilterChange('waitlist')}
          >
            Waitlist
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="my-events-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h2>No events found</h2>
            <p>You haven't RSVPed to any events yet</p>
            <button 
              className="btn-explore"
              onClick={() => navigate('/events')}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => {
              const rsvpStatus = getUserRsvpStatus(event);
              const isUpcoming = isEventUpcoming(event.startDate);

              return (
                <div 
                  key={event._id} 
                  className={`event-card ${rsvpStatus} ${isUpcoming ? 'upcoming' : 'past'}`}
                >
                  {/* Card Header */}
                  <div className="event-card-top">
                    {event.banner && (
                      <img src={event.banner} alt={event.title} className="event-card-image" />
                    )}
                    <div className="event-card-overlay">
                      <span className={`status-badge status-${rsvpStatus}`}>
                        {rsvpStatus === 'confirmed' ? '✓ Attending' : '⏳ Waitlist'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="event-card-body">
                    <div className="event-card-header-text">
                      <span className={`event-type-tag type-${event.eventType}`}>
                        {event.eventType}
                      </span>
                      <h3 className="event-card-title">{event.title}</h3>
                    </div>

                    {/* Event Details */}
                    <div className="event-card-details">
                      <div className="detail-row">
                        <Calendar size={16} className="detail-icon" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>

                      <div className="detail-row">
                        <Clock size={16} className="detail-icon" />
                        <span>
                          {new Date(event.startDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {event.eventMode === 'in-person' && event.location && (
                        <div className="detail-row">
                          <MapPin size={16} className="detail-icon" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {(event.eventMode === 'virtual' || event.eventMode === 'hybrid') && (
                        <div className="detail-row">
                          <span className="mode-badge">{event.eventMode === 'virtual' ? 'Online' : 'Hybrid'}</span>
                        </div>
                      )}

                      <div className="detail-row">
                        <Users size={16} className="detail-icon" />
                        <span>{event.confirmedCount}/{event.capacity} attending</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="event-card-actions">
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/event/${event._id}`)}
                      >
                        View Details <ChevronRight size={16} />
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelRsvp(event._id)}
                        disabled={cancellingEventId === event._id}
                        title="Cancel RSVP"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Past Event Indicator */}
                  {!isUpcoming && (
                    <div className="past-event-overlay">
                      <span>Past Event</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {events.length > 0 && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{events.length}</div>
            <div className="stat-label">Total RSVPs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {events.filter(e => e.rsvps.some(r => r.status === 'confirmed' && r.alumni._id === localStorage.getItem('userId'))).length}
            </div>
            <div className="stat-label">Confirmed Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {events.filter(e => e.rsvps.some(r => r.status === 'waitlist' && r.alumni._id === localStorage.getItem('userId'))).length}
            </div>
            <div className="stat-label">On Waitlist</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {events.filter(e => new Date(e.startDate) > new Date()).length}
            </div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
