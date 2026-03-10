import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import '../styles/memory-wall.css';

const MemoryWall = ({ reunionId }) => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMemories();
  }, [reunionId, page]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/${reunionId}/memories?page=${page}&limit=12`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch memories');

      const data = await response.json();
      setMemories(data.memories);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMemory = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      // Note: In a real implementation, you'd handle file uploads here
      // This is a simplified version - add cloudinary/image upload logic as needed

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/${reunionId}/memories`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption,
            photos: [] // Placeholder for actual file uploads
          }),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to add memory');

      toast.success('Memory added successfully!');
      setCaption('');
      setShowUploadForm(false);
      fetchMemories();
    } catch (error) {
      console.error('Error uploading memory:', error);
      toast.error('Failed to add memory');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (memoryId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/memories/${memoryId}/like`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to like memory');

      fetchMemories();
    } catch (error) {
      console.error('Error liking memory:', error);
      toast.error('Failed to like memory');
    }
  };

  const handleAddComment = async (memoryId, commentText) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/memories/${memoryId}/comment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText }),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to add comment');

      fetchMemories();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reunions/memories/${memoryId}`,
          {
            method: 'DELETE',
            credentials: 'include'
          }
        );

        if (!response.ok) throw new Error('Failed to delete memory');

        toast.success('Memory deleted');
        fetchMemories();
      } catch (error) {
        console.error('Error deleting memory:', error);
        toast.error('Failed to delete memory');
      }
    }
  };

  if (loading) return <div className="loading">Loading memories...</div>;

  return (
    <div className="memory-wall">
      <h2>Memory Wall</h2>

      <button
        className="add-memory-btn"
        onClick={() => setShowUploadForm(!showUploadForm)}
      >
        {showUploadForm ? '✕ Cancel' : '+ Add Memory'}
      </button>

      {showUploadForm && (
        <form className="memory-upload-form" onSubmit={handleUploadMemory}>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share your memory... What makes this reunion special?"
            rows="3"
          />
          <div className="form-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Share Memory'}
            </button>
          </div>
        </form>
      )}

      <div className="memories-gallery">
        {memories.length === 0 ? (
          <div className="empty-state">
            <p>No memories yet. Be the first to share!</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div key={memory._id} className="memory-card">
              <div className="memory-header">
                <img
                  src={memory.user?.avatar || '/default-avatar.png'}
                  alt={memory.user?.name}
                  className="avatar"
                />
                <div className="user-info">
                  <h4>{memory.user?.name}</h4>
                  <span className="timestamp">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {memory.photos?.length > 0 && (
                <div className="memory-photos">
                  {memory.photos.map((photo, idx) => (
                    <img key={idx} src={photo.url} alt="Memory" />
                  ))}
                </div>
              )}

              {memory.caption && <p className="memory-caption">{memory.caption}</p>}

              <div className="memory-actions">
                <button
                  className="like-btn"
                  onClick={() => handleLike(memory._id)}
                >
                  ❤️ {memory.likes?.length || 0}
                </button>
                <span className="comment-count">💬 {memory.comments?.length || 0}</span>

                {memory.user?._id === user?.id && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMemory(memory._id)}
                  >
                    🗑️
                  </button>
                )}
              </div>

              {memory.comments?.length > 0 && (
                <div className="comments-section">
                  {memory.comments.map((comment, idx) => (
                    <div key={idx} className="comment">
                      <strong>{comment.user?.name}:</strong> {comment.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryWall;
