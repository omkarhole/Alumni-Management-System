import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import defaultavatar from '../assets/uploads/defaultavatar.jpg';
import { toPublicUrl } from '../utils/globalurl';
import { 
  Building2, 
  Star, 
  MapPin,
  Phone,
  Globe,
  Mail,
  Gift,
  Award,
  Clock,
  ThumbsUp,
  ChevronRight,
  ExternalLink,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORY_LABELS = {
  technology: 'Technology',
  consulting: 'Consulting',
  finance: 'Finance',
  marketing: 'Marketing',
  healthcare: 'Healthcare',
  education: 'Education',
  retail: 'Retail',
  food: 'Food & Beverages',
  real_estate: 'Real Estate',
  legal: 'Legal',
  manufacturing: 'Manufacturing',
  hospitality: 'Hospitality',
  creative: 'Creative & Design',
  freelance: 'Freelance',
  other: 'Other'
};

const BusinessDetails = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, total: 0, pages: 0 });

  useEffect(() => {
    fetchBusiness();
    fetchReviews();
  }, [businessId, reviewsPagination.page]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/${businessId}`);
      const data = await response.json();

      if (response.ok) {
        setBusiness(data);
      } else {
        toast.error('Business not found');
        navigate('/businesses');
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Error loading business');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);
      const response = await fetch(`${API_URL}/api/business/${businessId}/reviews?page=${reviewsPagination.page}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setReviewsPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/business/${businessId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newReview)
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Review submitted successfully');
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', comment: '' });
        fetchReviews();
        fetchBusiness();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await fetch(`${API_URL}/api/business/reviews/${reviewId}/helpful`, {
        method: 'PATCH',
        credentials: 'include'
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const renderStars = (rating, interactive = false, onChange = () => {}) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-${interactive ? 'pointer' : 'default'} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onChange(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) return null;

  const isOwner = isLoggedIn && user?._id === business.user?._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/businesses" className="hover:text-blue-600">Businesses</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{business.businessName}</span>
        </div>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {business.logo ? (
                  <img
                    src={toPublicUrl(business.logo)}
                    alt={business.businessName}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{business.businessName}</h1>
                  {business.isVerified && (
                    <span className="text-blue-500" title="Verified Business">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  {business.isFeatured && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mb-2">{CATEGORY_LABELS[business.category] || business.category}</p>
                {business.tagline && <p className="text-gray-600 mb-3">{business.tagline}</p>}
                {renderStars(business.rating)}
                <p className="text-sm text-gray-500 mt-1">{business.totalReviews} reviews • {business.totalViews} views</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{business.description}</p>
            </div>

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.services.map((service, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                      {service.price && <p className="text-sm text-blue-600 mt-2 font-medium">{service.price}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
                {isLoggedIn && !isOwner && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Your Review</h3>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-700 mb-1">Rating</label>
                    {renderStars(newReview.rating, true, (star) => setNewReview(prev => ({ ...prev, rating: star })))}
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summarize your experience"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-700 mb-1">Review</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this business..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {reviewLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : reviews.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <img
                            src={toPublicUrl(review.user?.alumnus_bio?.avatar) || defaultavatar}
                            alt={review.user?.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{review.user?.name}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {renderStars(review.rating)}
                            {review.title && <h4 className="font-medium text-gray-900 mt-1">{review.title}</h4>}
                            <p className="text-gray-600 mt-1">{review.comment}</p>
                            <button
                              onClick={() => handleMarkHelpful(review._id)}
                              className="flex items-center gap-1 text-sm text-gray-500 mt-2 hover:text-blue-600"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Helpful ({review.isHelpful || 0})
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviewsPagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        onClick={() => setReviewsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={reviewsPagination.page === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-gray-600">{reviewsPagination.page} / {reviewsPagination.pages}</span>
                      <button
                        onClick={() => setReviewsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={reviewsPagination.page === reviewsPagination.pages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alumni Discount */}
            {business.hasAlumniDiscount && business.alumniDiscount && (
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-6 h-6" />
                  <h2 className="text-lg font-semibold">Alumni Discount</h2>
                </div>
                <h3 className="text-xl font-bold mb-2">{business.alumniDiscount.title}</h3>
                {business.alumniDiscount.description && (
                  <p className="text-green-100 mb-3">{business.alumniDiscount.description}</p>
                )}
                {business.alumniDiscount.percentage > 0 && (
                  <p className="text-3xl font-bold mb-3">{business.alumniDiscount.percentage}% OFF</p>
                )}
                {business.alumniDiscount.discountCode && (
                  <div className="bg-white/20 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-100">Use code:</p>
                    <p className="text-xl font-mono font-bold">{business.alumniDiscount.discountCode}</p>
                  </div>
                )}
                {business.alumniDiscount.terms && (
                  <p className="text-xs text-green-100">{business.alumniDiscount.terms}</p>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {business.location?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{business.location.address}</p>
                      {business.location.city && <p className="text-gray-600">{business.location.city}{business.location.state ? `, ${business.location.state}` : ''}</p>}
                      {business.location.country && <p className="text-gray-600">{business.location.country}</p>}
                    </div>
                  </div>
                )}
                {business.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${business.contact.phone}`} className="text-blue-600 hover:underline">
                      {business.contact.phone}
                    </a>
                  </div>
                )}
                {business.contact?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${business.contact.email}`} className="text-blue-600 hover:underline">
                      {business.contact.email}
                    </a>
                  </div>
                )}
                {business.contact?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a href={business.contact.website.startsWith('http') ? business.contact.website : `https://${business.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {business.contact?.linkedIn && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-gray-400" />
                    <a href={business.contact.linkedIn.startsWith('http') ? business.contact.linkedIn : `https://${business.contact.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Owner */}
            {business.user && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Owner</h2>
                <div className="flex items-center gap-3">
                  <img
                    src={toPublicUrl(business.user.alumnus_bio?.avatar) || defaultavatar}
                    alt={business.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{business.user.name}</p>
                    {business.user.alumnus_bio?.batch && (
                      <p className="text-sm text-gray-500">Batch of {business.user.alumnus_bio.batch}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
