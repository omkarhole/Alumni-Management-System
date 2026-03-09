import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [userRsvpStatus, setUserRsvpStatus] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/event-calendar/details/${eventId}`,
        { withCredentials: true }
      );
      setEvent(response.data);
      
      // Check user's RSVP status
      checkUserRsvpStatus(response.data);
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRsvpStatus = (eventData) => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userRsvp = eventData.rsvps.find(r => r.alumni._id === storedUserId);
      if (userRsvp) {
        setUserRsvpStatus(userRsvp.status);
      }
    }
  };

  const handleRsvp = async () => {
    try {
      setRsvpLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/event-calendar/rsvp`,
        { eventId, numberOfGuests },
        { withCredentials: true }
      );
      
      setEvent(response.data.event);
      setUserRsvpStatus(response.data.status);
      toast.success(response.data.message || 'Successfully updated RSVP');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP');
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    if (!window.confirm('Are you sure you want to cancel your RSVP?')) return;

    try {
      setRsvpLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/event-calendar/cancel-rsvp`,
        { eventId },
        { withCredentials: true }
      );
      
      setEvent(response.data.event);
      setUserRsvpStatus(null);
      toast.success('RSVP cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel RSVP');
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="loading-spinner">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-container">
        <button className="btn-back" onClick={() => navigate('/events')}>
          <ArrowLeft size={20} /> Back to Calendar
        </button>
        <div className="error-message">{error || 'Event not found'}</div>
      </div>
    );
  }

  const isRsvpDeadlinePassed = new Date() > new Date(event.rsvpDeadline);
  const isFull = event.confirmedCount >= event.capacity;
  const canRsvp = !userRsvpStatus && !isRsvpDeadlinePassed && (!isFull);

  return (
    <div className="event-details-container">
      {/* Header */}
      <div className="event-details-header">
        <button className="btn-back" onClick={() => navigate('/events')}>
          <ArrowLeft size={20} /> Back to Calendar
        </button>
      </div>

      {/* Main Content */}
      <div className="event-details-content">
        {/* Left Column - Event Info */}
        <div className="event-details-main">
          {/* Banner */}
          {event.banner && (
            <img src={event.banner} alt={event.title} className="event-banner" />
          )}

          {/* Title and Type */}
          <div className="event-title-section">
            <div className="event-type-badge-large">{event.eventType}</div>
            <h1 className="event-title">{event.title}</h1>
            <div className="event-organizer">
              by <strong>{event.organizer?.name || 'Alumni Team'}</strong>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="event-info-grid">
            <div className="info-card">
              <Calendar size={24} className="info-icon" />
              <div>
                <div className="info-label">Date & Time</div>
                <div className="info-value">
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="info-value">
                  {new Date(event.startDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {new Date(event.endDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="info-card">
              <MapPin size={24} className="info-icon" />
              <div>
                <div className="info-label">
                  {event.eventMode === 'in-person' ? 'Location' : 'Event Mode'}
                </div>
                <div className="info-value">
                  {event.eventMode === 'in-person' && event.location && (
                    <span>{event.location}</span>
                  )}
                  {event.eventMode === 'virtual' && (
                    <span className="mode-badge-inline">Virtual Event</span>
                  )}
                  {event.eventMode === 'hybrid' && (
                    <span className="mode-badge-inline">In-Person & Virtual</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-card">
              <Users size={24} className="info-icon" />
              <div>
                <div className="info-label">Attendees</div>
                <div className="info-value">
                  {event.confirmedCount} / {event.capacity} confirmed
                </div>
                {event.waitlistCount > 0 && (
                  <div className="info-subvalue">
                    {event.waitlistCount} on waitlist
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <Clock size={24} className="info-icon" />
              <div>
                <div className="info-label">RSVP Deadline</div>
                <div className="info-value">
                  {new Date(event.rsvpDeadline).toLocaleDateString()}
                </div>
                {isRsvpDeadlinePassed && (
                  <div className="info-subvalue deadline-passed">
                    Deadline passed
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="event-description-section">
            <h2>About The Event</h2>
            <p>{event.description}</p>
          </div>

          {/* Event Tags */}
          {event.eventTags && event.eventTags.length > 0 && (
            <div className="event-tags-section">
              <h3>Event Tags</h3>
              <div className="tags-list">
                {event.eventTags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Virtual Link */}
          {(event.eventMode === 'virtual' || event.eventMode === 'hybrid') && event.virtualLink && (
            <div className="virtual-link-section">
              <h3>Join Online</h3>
              <div className="virtual-link-card">
                <p className="virtual-link-url">{event.virtualLink}</p>
                <a href={event.virtualLink} target="_blank" rel="noopener noreferrer" className="btn-join-virtual">
                  Join Meeting
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - RSVP Card */}
        <div className="event-details-sidebar">
          <div className="rsvp-card">
            {/* Capacity Status */}
            <div className={`capacity-status ${isFull ? 'full' : ''}`}>
              {isFull ? (
                <div className="capacity-warning">
                  <AlertCircle size={20} />
                  <span>Event is Full</span>
                </div>
              ) : (
                <div className="capacity-available">
                  {event.availableSeats} seats available
                </div>
              )}
            </div>

            {/* User RSVP Status */}
            {userRsvpStatus && (
              <div className={`rsvp-status status-${userRsvpStatus}`}>
                <Check size={20} />
                <span>
                  {userRsvpStatus === 'confirmed' ? 'You are attending' : 'You are on waitlist'}
                </span>
              </div>
            )}

            {/* RSVP Controls */}
            {!userRsvpStatus ? (
              <div className="rsvp-form">
                <div className="form-group">
                  <label>Number of Guests (including you)</label>
                  <select
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                    className="guest-select"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>

                {isRsvpDeadlinePassed ? (
                  <button className="btn-rsvp disabled">RSVP Deadline Passed</button>
                ) : (
                  <button
                    className="btn-rsvp"
                    onClick={handleRsvp}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading ? 'RSVPing...' : isFull ? 'Join Waitlist' : 'RSVP to Event'}
                  </button>
                )}
              </div>
            ) : (
              <button
                className="btn-cancel-rsvp"
                onClick={handleCancelRsvp}
                disabled={rsvpLoading}
              >
                {rsvpLoading ? 'Cancelling...' : 'Cancel RSVP'}
              </button>
            )}

            {/* Share Event */}
            <div className="share-section">
              <button className="btn-share" onClick={copyToClipboard}>
                <Share2 size={16} />
                {copied ? 'Copied!' : 'Share Event'}
              </button>
            </div>
          </div>

          {/* Attendees Preview */}
          <div className="attendees-card">
            <h3>Attendees ({event.confirmedCount})</h3>
            <div className="attendees-list">
              {event.rsvps
                .filter(r => r.status === 'confirmed')
                .slice(0, 5)
                .map((rsvp, index) => (
                  <div key={index} className="attendee-item">
                    {rsvp.alumni?.avatar ? (
                      <img src={rsvp.alumni.avatar} alt={rsvp.alumni?.name} />
                    ) : (
                      <div className="avatar-placeholder">{rsvp.alumni?.name?.charAt(0) || '?'}</div>
                    )}
                    <span className="attendee-name">{rsvp.alumni?.name || 'Anonymous'}</span>
                  </div>
                ))}
            </div>
            {event.confirmedCount > 5 && (
              <div className="attendees-more">+{event.confirmedCount - 5} more attending</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
