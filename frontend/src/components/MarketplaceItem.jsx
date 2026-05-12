import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaEye, FaPhone, FaEnvelope, FaTag, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '../utils/globalurl';

const MarketplaceItem = ({ listing, isLiked, onToggleLike }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      'Jobs': 'bg-blue-100 text-blue-800',
      'Services': 'bg-green-100 text-green-800',
      'Items': 'bg-purple-100 text-purple-800',
      'Space': 'bg-orange-100 text-orange-800',
      'Networking': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-500',
      'Inactive': 'bg-gray-500',
      'Sold': 'bg-red-500',
      'Archived': 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatPrice = (price, priceType) => {
    if (priceType === 'Free') return 'Free';
    if (priceType === 'Negotiable') return `$${price} (Negotiable)`;
    return `$${price}`;
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleContactClick = async () => {
    if (!listing.user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Send direct message
      await axios.post(
        `${baseUrl}/api/v1/dm`,
        {
          recipientId: listing.user._id,
          message: `Hi, I'm interested in your marketplace listing: "${listing.title}"`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowContactModal(false);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaTag className="text-4xl text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 ${getStatusColor(listing.status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
          {listing.status}
        </div>

        {/* Featured Badge */}
        {listing.featured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={() => onToggleLike(listing._id)}
          className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-gray-600 text-lg" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(listing.category)}`}>
            {listing.category}
          </span>
          {listing.verified && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/marketplace/${listing._id}`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600">
            {listing.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Location */}
        {listing.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <FaMapMarkerAlt className="text-red-500" />
            <span>{listing.location}</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(listing.price, listing.priceType)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <FaEye />
            <span>{listing.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <FaHeart />
            <span>{listing.likes?.length || 0} likes</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt />
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Posted by</p>
          <div className="flex items-center gap-2">
            {listing.user?.alumnus_bio?.avatar ? (
              <img
                src={listing.user.alumnus_bio.avatar}
                alt={listing.user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600"></div>
            )}
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {listing.user?.name}
              </p>
              {listing.user?.alumnus_bio?.batch && (
                <p className="text-xs text-gray-500">Batch {listing.user.alumnus_bio.batch}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/marketplace/${listing._id}`}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={() => setShowContactModal(true)}
            className="flex-1 bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-1"
          >
            <FaEnvelope className="text-sm" /> Contact
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Seller
            </h3>
            
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Email:</strong> {listing.contactEmail}
              </p>
              {listing.phoneNumber && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Phone:</strong> {listing.phoneNumber}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContactClick}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceItem;
