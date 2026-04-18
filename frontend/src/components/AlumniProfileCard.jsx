import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  MapPin, 
  Briefcase, 
  Award,
  Sparkles,
  Heart
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import defaultavatar from '../assets/uploads/defaultavatar.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const messagesUrl = `${API_URL}/api/dm`;

/**
 * AlumniProfileCard Component
 * Displays a rich profile card with skills, endorsements, and connection button
 */
export const AlumniProfileCard = ({ alumni, onConnect }) => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!alumni) return null;

  const getAvatarUrl = () => {
    return alumni.avatar
      ? `${API_URL}/${alumni.avatar}`
      : defaultavatar;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await axios.post(
        `${messagesUrl}/messages`,
        {
          receiverId: alumni._id,
          content: `Hi ${alumni.name}, I'd like to connect with you!`
        },
        { withCredentials: true }
      );

      if (response.data.data) {
        toast.success('Connection initiated! Message sent.');
        if (onConnect) onConnect(alumni._id);
        // Navigate to direct chat
        setTimeout(() => {
          navigate(`/messages/${alumni._id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error(error.response?.data?.error || 'Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessageClick = () => {
    navigate(`/messages/${alumni._id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Background */}
      <div className="h-20 bg-gradient-to-r from-blue-400 to-blue-600"></div>

      {/* Avatar Section */}
      <div className="px-6 pb-4 -mt-10 relative z-10">
        <div className="flex justify-between items-start">
          <img
            src={getAvatarUrl()}
            alt={alumni.name}
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
          />
          {alumni.status === 1 && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-4">
        {/* Name and Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{alumni.name}</h3>
        
        {alumni.job_title && (
          <p className="text-sm text-blue-600 font-medium mb-3">{alumni.job_title}</p>
        )}

        {/* Company and Location */}
        <div className="space-y-2 mb-4">
          {alumni.company && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="truncate">{alumni.company}</span>
            </div>
          )}
          {alumni.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{alumni.location}</span>
            </div>
          )}
        </div>

        {/* Batch and Course */}
        <div className="bg-gray-50 rounded px-3 py-2 mb-4">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Batch {alumni.batch}</span>
            {alumni.course?.name && ` • ${alumni.course.name}`}
          </p>
        </div>

        {/* Bio */}
        {alumni.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{alumni.bio}</p>
        )}

        {/* Skills */}
        {alumni.skills && alumni.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {alumni.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
              {alumni.skills.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{alumni.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Endorsements and Interests */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {alumni.endorsementCount !== undefined && (
            <div className="bg-yellow-50 rounded px-3 py-2">
              <div className="flex items-center gap-1 mb-1">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-gray-700">
                  {alumni.endorsementCount}
                </span>
              </div>
              <p className="text-xs text-gray-600">Endorsements</p>
            </div>
          )}
          {alumni.interests && alumni.interests.length > 0 && (
            <div className="bg-purple-50 rounded px-3 py-2">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-gray-700">
                  {alumni.interests.length}
                </span>
              </div>
              <p className="text-xs text-gray-600">Interests</p>
            </div>
          )}
        </div>

        {/* Interest Tags */}
        {alumni.interests && alumni.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {alumni.interests.slice(0, 2).map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleMessageClick}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          title="View messages"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Message</span>
        </button>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors text-sm"
          title="Send connection request"
        >
          <Heart className="w-4 h-4" />
          <span className={isConnecting ? 'animate-pulse' : ''}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AlumniProfileCard;
