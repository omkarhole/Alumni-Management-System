import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaHeart, FaRegHeart, FaMapMarkerAlt, FaEye, FaPhone, FaEnvelope, FaTag, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';

const MarketplaceDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/marketplace/${listingId}`);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${baseUrl}/api/v1/marketplace/${listingId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(!isLiked);
      fetchListing();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleContactClick = async () => {
    if (!listing.user) return;
    
    try {
      setContacting(true);
      const token = localStorage.getItem('token');
      
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
      setContacting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${baseUrl}/api/v1/marketplace/${listingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/marketplace');
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing');
      }
    }
  };

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

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price, priceType) => {
    if (priceType === 'Free') return 'Free';
    if (priceType === 'Negotiable') return `$${price} (Negotiable)`;
    return `$${price}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Listing not found</h1>
          <Link to="/marketplace" className="text-blue-600 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = isLoggedIn && user && listing.user._id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/marketplace"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-6"
        >
          <FaArrowLeft /> Back to Marketplace
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Image Carousel */}
          <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaTag className="text-6xl text-gray-400" />
              </div>
            )}

            <button
              onClick={handleToggleLike}
              className="absolute top-6 right-6 bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
            >
              {isLiked ? (
                <FaHeart className="text-2xl text-red-500" />
              ) : (
                <FaRegHeart className="text-2xl text-gray-600" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(listing.category)}`}>
                    {listing.category}
                  </span>
                  {listing.featured && (
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  {listing.verified && (
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {listing.title}
                </h1>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    to={`/marketplace/edit/${listingId}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(listing.price, listing.priceType)}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              {listing.location && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" /> Location
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{listing.location}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaCalendarAlt /> Posted
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{formatDate(listing.createdAt)}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaEye /> Views
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{listing.views}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaHeart /> Likes
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{listing.likes?.length || 0}</p>
              </div>
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h3>
              <div className="flex items-center gap-4">
                {listing.user?.alumnus_bio?.avatar ? (
                  <img
                    src={listing.user.alumnus_bio.avatar}
                    alt={listing.user.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600"></div>
                )}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {listing.user?.name}
                  </h4>
                  {listing.user?.alumnus_bio?.batch && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Batch {listing.user.alumnus_bio.batch}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-300">{listing.contactEmail}</p>
                </div>
                {listing.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-green-600" />
                    <p className="text-gray-600 dark:text-gray-300">{listing.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && isLoggedIn && (
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Send Message to Seller
              </button>
            )}

            {!isLoggedIn && (
              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all text-center block"
              >
                Login to Contact Seller
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Seller
            </h3>
            
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <strong>Email:</strong>
                <br />
                {listing.contactEmail}
              </p>
              {listing.phoneNumber && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Phone:</strong>
                  <br />
                  {listing.phoneNumber}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContactClick}
                disabled={contacting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {contacting ? 'Sending...' : 'Send Message'}
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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

export default MarketplaceDetail;
