/**
 * Centralized Axios Client for API communication
 * Features:
 * - Automatic credential handling
 * - Environment-based base URL configuration
 * - MongoDB _id to id field mapping
 * - Token refresh interceptor
 * - Global error handling
 */

import axios from 'axios';
import { apiV1Url } from '../utils/globalurl';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: apiV1Url || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor to handle MongoDB _id to id mapping
 * Converts _id fields to id for consistency with frontend
 */
apiClient.interceptors.response.use(
  (response) => {
    // Transform response data to map _id -> id
    if (response.data) {
      response.data = transformIds(response.data);
    }
    return response;
  },
  (error) => {
    // Handle auth errors (401, 403)
    if (error.response?.status === 401) {
      // Token expired or invalid - attempt refresh or redirect to login
      handleAuthError(error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Request interceptor to add auth token if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Token is automatically sent via cookies (withCredentials: true)
    // If you need to add Bearer token from localStorage, uncomment:
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Recursively transform MongoDB _id fields to id for compatibility
 * @param {any} data - Data to transform (object, array, or primitive)
 * @returns {any} Transformed data with _id -> id mapping
 */
function transformIds(data) {
  if (Array.isArray(data)) {
    return data.map((item) => transformIds(item));
  }

  if (data !== null && typeof data === 'object') {
    const transformed = {};
    for (const [key, value] of Object.entries(data)) {
      // Map _id to id, keep original _id for reference if needed
      if (key === '_id') {
        transformed.id = value;
        transformed._id = value;
      } else {
        transformed[key] = transformIds(value);
      }
    }
    return transformed;
  }

  return data;
}

/**
 * Handle authentication errors
 * @param {Error} error - The error that occurred
 */
function handleAuthError(error) {
  // Clear stored auth data
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_type');
  localStorage.removeItem('user_name');
  localStorage.removeItem('alumnus_id');
  localStorage.removeItem('auth_token');

  // Dispatch custom event for AuthContext to listen to
  window.dispatchEvent(new CustomEvent('auth-error', { detail: error }));

  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * Refresh auth token (if using JWT in localStorage)
 * Call this when token is about to expire
 */
export const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    handleAuthError(error);
    throw error;
  }
};

export default apiClient;
