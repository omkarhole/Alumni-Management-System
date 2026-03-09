import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock } from 'lucide-react';
import '../styles/EventCalendar.css';

const EventCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedEventMode, setSelectedEventMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch events for the current month
  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/event-calendar/calendar-view`,
        { params: { month, year } }
      );
      setEvents(response.data);
      applyFilters(response.data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (eventList) => {
    let filtered = eventList;

    if (selectedEventType !== 'all') {
      filtered = filtered.filter(e => e.eventType === selectedEventType);
    }

    if (selectedEventMode !== 'all') {
      filtered = filtered.filter(e => e.eventMode === selectedEventMode);
    }

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    applyFilters(events);
  }, [selectedEventType, selectedEventMode, events]);

  // Calendar generation
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return events.filter(e => new Date(e.startDate).toDateString() === dateStr);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="event-calendar-container">
      <div className="calendar-header">
        <h1>Alumni Events Calendar</h1>
        <button 
          className="btn-create-event"
          onClick={() => navigate('/create-event')}
        >
          + Create Event
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="calendar-filters">
        <div className="filter-group">
          <label>Event Type:</label>
          <select 
            value={selectedEventType} 
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="reunion">Reunion</option>
            <option value="networking">Networking</option>
            <option value="webinar">Webinar</option>
            <option value="social">Social</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Event Mode:</label>
          <select 
            value={selectedEventMode} 
            onChange={(e) => setSelectedEventMode(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Modes</option>
            <option value="in-person">In-Person</option>
            <option value="virtual">Virtual</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="calendar-content">
        {/* Calendar View */}
        <div className="calendar-main">
          <div className="calendar-navigation">
            <button onClick={previousMonth} className="nav-btn">
              <ChevronLeft size={20} />
            </button>
            <h2>{monthName}</h2>
            <button onClick={nextMonth} className="nav-btn">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            {/* Week day headers */}
            <div className="week-header">
              {weekDays.map(day => (
                <div key={day} className="week-day">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="calendar-days">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isToday = 
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div 
                    key={index} 
                    className={`calendar-day ${day ? 'active' : 'empty'} ${isToday ? 'today' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="day-number">{day}</div>
                        <div className="day-events">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event._id}
                              className="event-dot"
                              onClick={() => navigate(`/event/${event._id}`)}
                              title={event.title}
                            >
                              <span className={`event-indicator type-${event.eventType}`}></span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="event-more">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="events-list-sidebar">
          <h3>Events ({filteredEvents.length})</h3>
          
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="no-events">No events found for this month</div>
          ) : (
            <div className="events-scroll">
              {filteredEvents.map(event => (
                <div 
                  key={event._id} 
                  className="event-card-sidebar"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  <div className="event-card-header">
                    <h4>{event.title}</h4>
                    <span className={`event-badge type-${event.eventType}`}>
                      {event.eventType}
                    </span>
                  </div>

                  <div className="event-card-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {event.eventMode === 'in-person' && event.location && (
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {(event.eventMode === 'virtual' || event.eventMode === 'hybrid') && (
                      <div className="detail-item">
                        <span className="mode-badge virtual">Online</span>
                      </div>
                    )}

                    <div className="detail-item">
                      <Users size={16} />
                      <span>
                        {event.confirmedCount}/{event.capacity} attending
                      </span>
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <button className="btn-view-details">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
