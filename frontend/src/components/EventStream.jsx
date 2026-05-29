import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSocket } from '../SocketContext';

const EventStream = ({ eventId: propEventId, viewerCount: propViewerCount }) => {
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId;

  const { socket } = useSocket();
  const attachedEventIdRef = useRef(null);

  const [streamUrl, setStreamUrl] = useState('');
  const [streamPassword, setStreamPassword] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerCount, setViewerCount] = useState(propViewerCount ?? 0);

  const apiBase = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);

  useEffect(() => {
    if (!eventId) return;

    const fetchStream = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await axios.get(`${apiBase}/api/v1/stream/sessions/${eventId}/url`, {
          withCredentials: true,
        });

        setPlatform(res.data.platform);
        setStreamUrl(res.data.meetingUrl);
        setStreamPassword(res.data.meetingPassword || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stream');
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [eventId, apiBase]);

  useEffect(() => {
    if (!socket || !eventId) return;

    if (attachedEventIdRef.current === eventId.toString()) {
      return;
    }

    attachedEventIdRef.current = eventId.toString();

    const handler = (payload) => {
      if (payload?.eventId?.toString() !== eventId.toString()) return;
      setViewerCount(payload.viewerCount ?? 0);
    };

    socket.on('streamViewerCount', handler);

    // Join stream room to receive counts
    socket.emit('joinStream', { eventId });

    return () => {
      socket.off('streamViewerCount', handler);
      socket.emit('leaveStream', { eventId });

      if (attachedEventIdRef.current === eventId.toString()) {
        attachedEventIdRef.current = null;
      }
    };
  }, [socket, eventId]);

  if (loading) {
    return (
      <div className="event-stream">
        <div className="event-stream-loading">Loading live stream...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-stream">
        <div className="event-stream-error">{error}</div>
      </div>
    );
  }

  // Generic CTA (embedding depends on provider). For now, open in new tab.
  return (
    <div className="event-stream">
      <div className="event-stream-header">
        <div>
          <h3 style={{ marginBottom: 6 }}>Live Stream</h3>
          {platform ? <div className="event-stream-platform">Platform: {platform}</div> : null}
        </div>
        <div className="event-stream-viewers">{viewerCount} watching</div>
      </div>

      {streamUrl ? (
        <>
          <div className="event-stream-actions">
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-join-stream"
            >
              Join Stream
            </a>
          </div>

          {streamPassword ? (
            <div className="event-stream-password">
              <strong>Meeting Password:</strong> {streamPassword}
            </div>
          ) : null}

          {/* Placeholder player; provider embed integration can be added later */}
          <div className="event-stream-player-placeholder">
            <div className="event-stream-player-title">Stream player</div>
            <div className="event-stream-player-subtitle">
              Provider embed will be integrated after Zoom/Meet integration.
            </div>
          </div>
        </>
      ) : (
        <div className="event-stream-error">Stream not available yet.</div>
      )}
    </div>
  );
};

export default EventStream;

