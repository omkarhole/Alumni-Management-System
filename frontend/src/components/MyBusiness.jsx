import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { toPublicUrl } from '../utils/globalurl';
import { 
  Building2, 
  MapPin,
  Phone,
  Globe,
  Mail,
  Gift,
  Star,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Award,
  MessageCircle
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

const MyBusiness = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Please login to view your business');
      navigate('/login');
      return;
    }
    if (user?.type !== 'alumnus') {
      toast.error('Only alumni can access this page');
      navigate('/');
      return;
    }
    fetchMyBusiness();
  }, [isLoggedIn, user]);

  const fetchMyBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/my-business`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBusiness(data);
      } else if (response.status === 404) {
        setBusiness(null);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Error loading business');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/business/my-business/status`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchMyBusiness();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating || 0})</span>
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

  if (!isLoggedIn || user?.type !== 'alumnus') {
    return null;
  }

  // No business registered yet
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Business Registered</h1>
            <p className="text-gray-600 mb-6">
              You haven't registered a business yet. List your business in the Alumni Business Directory and connect with the alumni community.
            </p>
            <Link
              to="/register-business"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Building2 className="w-5 h-5" />
              Register Your Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Business</h1>
            <p className="text-gray-600">Manage your business listing</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/business/${business._id}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </Link>
            <Link
              to="/register-business"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit Business
            </Link>
          </div>
        </div>

        {/* Status Banner */}
        {!business.isActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <EyeOff className="w-5 h-5" />
              <span className="font-medium">Your business is currently hidden from the directory</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                {business.logo ? (
                  <img
                    src={toPublicUrl(business.logo)}
                    alt={business.businessName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{business.businessName}</h2>
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
                  <p className="text-gray-500">{CATEGORY_LABELS[business.category] || business.category}</p>
                  {business.tagline && <p className="text-gray-600 mt-1">{business.tagline}</p>}
                  {renderStars(business.rating)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{business.description}</p>
            </div>

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {business.services.map((service, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                      {service.price && <p className="text-sm text-blue-600 mt-2 font-medium">{service.price}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{business.totalViews}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{business.totalReviews}</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{business.rating || 0}</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Toggle */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Visibility</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {business.isActive ? (
                    <>
                      <Eye className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Hidden</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    business.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50`}
                >
                  {actionLoading ? 'Updating...' : (business.isActive ? 'Hide' : 'Show')}
                </button>
              </div>
            </div>

            {/* Alumni Discount */}
            {business.hasAlumniDiscount && business.alumniDiscount && (
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-6 h-6" />
                  <h3 className="font-semibold">Alumni Discount</h3>
                </div>
                <h4 className="text-lg font-bold mb-2">{business.alumniDiscount.title}</h4>
                {business.alumniDiscount.percentage > 0 && (
                  <p className="text-3xl font-bold mb-2">{business.alumniDiscount.percentage}% OFF</p>
                )}
                {business.alumniDiscount.discountCode && (
                  <div className="bg-white/20 rounded-lg p-2 text-center">
                    <p className="text-sm text-green-100">Code: </p>
                    <p className="text-xl font-mono font-bold">{business.alumniDiscount.discountCode}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {business.location?.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">
                      {business.location.city}{business.location.country ? `, ${business.location.country}` : ''}
                    </span>
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
                    <a 
                      href={business.contact.website.startsWith('http') ? business.contact.website : `https://${business.contact.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBusiness;
