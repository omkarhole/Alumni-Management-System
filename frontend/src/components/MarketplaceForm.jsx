import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaCloudUploadAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { baseUrl } from '../utils/globalurl';

const MarketplaceForm = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { listingId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Jobs',
    description: '',
    price: '',
    priceType: 'Fixed',
    contactEmail: '',
    location: '',
    phoneNumber: '',
    tags: [],
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState([]);

  const categories = ['Jobs', 'Services', 'Items', 'Space', 'Networking'];

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
    
    if (listingId) {
      fetchListing();
    } else {
      setFormData(prev => ({
        ...prev,
        contactEmail: user?.email || ''
      }));
    }
  }, [isLoggedIn, listingId, user]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/marketplace/${listingId}`
      );
      const listing = response.data;
      setFormData({
        title: listing.title,
        category: listing.category,
        description: listing.description,
        price: listing.price,
        priceType: listing.priceType,
        contactEmail: listing.contactEmail,
        location: listing.location,
        phoneNumber: listing.phoneNumber,
        tags: listing.tags,
        images: listing.images
      });
      setImagePreview(listing.images);
    } catch (err) {
      setError('Failed to load listing');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const formDataObj = new FormData();
        formDataObj.append('file', file);
        formDataObj.append('upload_preset', 'alumni_marketplace');

        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
          formDataObj
        );
        uploadedUrls.push(response.data.secure_url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setImagePreview(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError('Failed to upload images. Using placeholder URLs.');
      // For demo purposes, use placeholder URLs
      const placeholders = files.map((_, index) => 
        `https://via.placeholder.com/400x300?text=Image+${formData.images.length + index + 1}`
      );
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...placeholders]
      }));
      setImagePreview(prev => [...prev, ...placeholders]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!formData.title || !formData.description) {
        setError('Title and description are required');
        setLoading(false);
        return;
      }

      if (listingId) {
        // Update existing listing
        await axios.put(
          `${baseUrl}/api/v1/marketplace/${listingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/marketplace/${listingId}`);
      } else {
        // Create new listing
        const response = await axios.post(
          `${baseUrl}/api/v1/marketplace`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/marketplace/${response.data.listing._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save listing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {listingId ? 'Edit Listing' : 'Create New Listing'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter listing title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Price Type
                </label>
                <select
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Negotiable">Negotiable</option>
                  <option value="Free">Free</option>
                </select>
              </div>
            </div>

            {/* Price */}
            {formData.priceType !== 'Free' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your listing in detail"
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Enter tag and press Enter or click Add"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaPlus /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Images (up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <FaCloudUploadAlt className="text-5xl text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || formData.images.length >= 5}
                  className="opacity-0 w-0 h-0"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Click to upload images
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF up to {5 - formData.images.length} images left
                </p>
              </div>

              {/* Image Preview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreview.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : (listingId ? 'Update Listing' : 'Create Listing')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceForm;
