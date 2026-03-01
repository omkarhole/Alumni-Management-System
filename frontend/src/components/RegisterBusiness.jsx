import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { businessUrl } from '../utils/globalurl';
import { 
  Building2, 
  MapPin,
  Phone,
  Globe,
  Mail,
  Gift,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'legal', label: 'Legal' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Other' }
];

const TEAM_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
];

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingBusiness, setExistingBusiness] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    tagline: '',
    category: '',
    subCategory: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    },
    contact: {
      phone: '',
      email: '',
      website: '',
      linkedIn: '',
      instagram: '',
      facebook: ''
    },
    services: [],
    hasAlumniDiscount: false,
    alumniDiscount: {
      title: '',
      description: '',
      discountCode: '',
      percentage: '',
      terms: ''
    },
    yearEstablished: '',
    teamSize: ''
  });

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Please login to register your business');
      navigate('/login');
      return;
    }
    if (user?.type !== 'alumnus') {
      toast.error('Only alumni can register businesses');
      navigate('/');
      return;
    }
    checkExistingBusiness();
  }, [isLoggedIn, user]);

  const checkExistingBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/my-business`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setExistingBusiness(data);
        setFormData({
          businessName: data.businessName || '',
          description: data.description || '',
          tagline: data.tagline || '',
          category: data.category || '',
          subCategory: data.subCategory || '',
          location: data.location || {
            address: '',
            city: '',
            state: '',
            country: '',
            pincode: ''
          },
          contact: data.contact || {
            phone: '',
            email: '',
            website: '',
            linkedIn: '',
            instagram: '',
            facebook: ''
          },
          services: data.services || [],
          hasAlumniDiscount: data.hasAlumniDiscount || false,
          alumniDiscount: data.alumniDiscount || {
            title: '',
            description: '',
            discountCode: '',
            percentage: '',
            terms: ''
          },
          yearEstablished: data.yearEstablished || '',
          teamSize: data.teamSize || ''
        });
      }
    } catch (error) {
      console.error('Error checking existing business:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else if (name.startsWith('alumniDiscount.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        alumniDiscount: { ...prev.alumniDiscount, [field]: value }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', price: '' }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        alumniDiscount: formData.hasAlumniDiscount ? {
          ...formData.alumniDiscount,
          percentage: formData.alumniDiscount.percentage ? parseInt(formData.alumniDiscount.percentage) : 0
        } : undefined
      };

      const url = existingBusiness 
        ? `${API_URL}/api/business/my-business`
        : `${API_URL}/api/business/register`;
      
      const method = existingBusiness ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(existingBusiness ? 'Business updated successfully!' : 'Business registered successfully!');
        navigate('/my-business');
      } else {
        toast.error(data.error || 'Failed to save business');
      }
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error('Error saving business');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || user?.type !== 'alumnus') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {existingBusiness ? 'Update Your Business' : 'Register Your Business'}
          </h1>
          <p className="text-gray-600">
            List your business in the Alumni Business Directory and connect with the alumni community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A short description of your business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={2000}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your business, products, and services..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Established
                  </label>
                  <input
                    type="number"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleChange}
                    min={1900}
                    max={new Date().getFullYear()}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Size
                  </label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select team size</option>
                    {TEAM_SIZES.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode/Zip
                  </label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Business email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="contact.website"
                  value={formData.contact.website}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="www.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="contact.linkedIn"
                  value={formData.contact.linkedIn}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LinkedIn profile URL"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Services</h2>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
            {formData.services.length > 0 ? (
              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">Service {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        placeholder="Service name"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', e.target.value)}
                        placeholder="Price (optional)"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No services added yet. Click "Add Service" to add your services.</p>
            )}
          </div>

          {/* Alumni Discount */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Alumni Discount</h2>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasAlumniDiscount"
                  checked={formData.hasAlumniDiscount}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="text-gray-700">Offer exclusive discount to alumni</span>
              </label>
            </div>
            {formData.hasAlumniDiscount && (
              <div className="space-y-4 pl-6 border-l-2 border-green-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Title
                  </label>
                  <input
                    type="text"
                    name="alumniDiscount.title"
                    value={formData.alumniDiscount.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 20% Alumni Discount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="alumniDiscount.description"
                    value={formData.alumniDiscount.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the discount offer"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Code
                    </label>
                    <input
                      type="text"
                      name="alumniDiscount.discountCode"
                      value={formData.alumniDiscount.discountCode}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., ALUMNI20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="alumniDiscount.percentage"
                      value={formData.alumniDiscount.percentage}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="alumniDiscount.terms"
                    value={formData.alumniDiscount.terms}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Terms and conditions for the discount"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              to="/my-business"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : (existingBusiness ? 'Update Business' : 'Register Business')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterBusiness;
