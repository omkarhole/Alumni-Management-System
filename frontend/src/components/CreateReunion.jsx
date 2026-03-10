import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/create-reunion.css';

const CreateReunion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    batch: new Date().getFullYear() - 5,
    description: '',
    eventDate: '',
    venue: '',
    virtualOption: {
      enabled: false,
      meetingLink: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('virtual')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        virtualOption: {
          ...prev.virtualOption,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.eventDate || !formData.venue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to create reunion');

      const data = await response.json();
      toast.success('Reunion created successfully!');
      navigate(`/reunion/${data.reunion._id}`);
    } catch (error) {
      console.error('Error creating reunion:', error);
      toast.error('Failed to create reunion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-reunion-container">
      <div className="create-reunion-form">
        <h1>Create a Class Reunion</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Reunion Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Class of 2018 Reunion"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="batch">Batch Year *</label>
            <input
              type="number"
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventDate">Event Date & Time *</label>
            <input
              type="datetime-local"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., Hotel Grand, Mumbai"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell everyone about your reunion plans..."
              rows="4"
            />
          </div>

          <div className="form-group virtual-section">
            <label>
              <input
                type="checkbox"
                name="virtual.enabled"
                checked={formData.virtualOption.enabled}
                onChange={handleChange}
              />
              Enable Virtual Attendance
            </label>

            {formData.virtualOption.enabled && (
              <div className="virtual-meeting-field">
                <label htmlFor="meetingLink">Meeting Link</label>
                <input
                  type="url"
                  id="meetingLink"
                  name="virtual.meetingLink"
                  value={formData.virtualOption.meetingLink}
                  onChange={handleChange}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Reunion'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/reunions')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReunion;
