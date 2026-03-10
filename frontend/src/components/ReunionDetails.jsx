import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import MemoryWall from './MemoryWall';
import '../styles/reunion-details.css';

const ReunionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reunion, setReunion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showCommittee, setShowCommittee] = useState(false);

  useEffect(() => {
    fetchReunionDetails();
  }, [id]);

  const fetchReunionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/${id}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch reunion');

      const data = await response.json();
      setReunion(data);
      setIsAttending(data.attendees?.some(att => att._id === user?.id));
    } catch (error) {
      console.error('Error fetching reunion:', error);
      toast.error('Failed to load reunion details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    try {
      const endpoint = isAttending ? '/leave' : '/join';
      const url = `${import.meta.env.VITE_API_URL}/api/reunions${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reunionId: id }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to update RSVP');

      setIsAttending(!isAttending);
      toast.success(isAttending ? 'Left reunion' : 'Joined reunion');
      fetchReunionDetails();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    }
  };

  const isOrganizer = reunion?.organizers?.some(org => org.user._id === user?.id);

  if (loading) return <div className="loading">Loading...</div>;
  if (!reunion) return <div className="error">Reunion not found</div>;

  return (
    <div className="reunion-details">
      {reunion.banner && (
        <div className="banner-section">
          <img src={reunion.banner} alt={reunion.title} className="banner" />
        </div>
      )}

      <div className="details-container">
        <div className="header-section">
          <div className="title-area">
            <h1>{reunion.title}</h1>
            <p className="batch">Batch {reunion.batch}</p>
            <span className={`status ${reunion.status}`}>{reunion.status}</span>
          </div>
          <button
            className={`rsvp-btn ${isAttending ? 'attending' : ''}`}
            onClick={handleRSVP}
          >
            {isAttending ? '✓ Attending' : 'RSVP'}
          </button>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>📅 Date & Time</h3>
            <p>{new Date(reunion.eventDate).toLocaleString()}</p>
          </div>

          <div className="info-card">
            <h3>📍 Location</h3>
            <p>{reunion.venue}</p>
            {reunion.virtualOption?.enabled && (
              <a href={reunion.virtualOption.meetingLink} target="_blank" rel="noopener noreferrer" className="link">
                Join Virtual Meeting
              </a>
            )}
          </div>

          <div className="info-card">
            <h3>👥 Attendees</h3>
            <p>{reunion.attendees?.length || 0} people attending</p>
          </div>

          <div className="info-card">
            <h3>💰 Budget</h3>
            <p>
              ₹{reunion.budget?.collected} / ₹{reunion.budget?.total}
            </p>
          </div>
        </div>

        {reunion.description && (
          <div className="description-section">
            <h2>About</h2>
            <p>{reunion.description}</p>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="nav-btn"
            onClick={() => setShowMemories(!showMemories)}
          >
            {showMemories ? '← Back' : '📸 View Memories'}
          </button>
          <button
            className="nav-btn"
            onClick={() => setShowCommittee(!showCommittee)}
          >
            {showCommittee ? '← Back' : '👥 Committee'}
          </button>
        </div>

        {showMemories && <MemoryWall reunionId={id} />}

        {showCommittee && (
          <div className="committee-section">
            <h2>Reunion Committee</h2>
            <div className="committee-list">
              {reunion.organizers?.map((organizer) => (
                <div key={organizer._id} className="committee-member">
                  {organizer.user.avatar && (
                    <img
                      src={organizer.user.avatar}
                      alt={organizer.user.name}
                      className="avatar"
                    />
                  )}
                  <div className="member-info">
                    <h4>{organizer.user.name}</h4>
                    <p className="role">{organizer.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {isOrganizer && (
              <button
                className="manage-btn"
                onClick={() => navigate(`/reunion/${id}/manage`)}
              >
                Manage Committee
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReunionDetails;
