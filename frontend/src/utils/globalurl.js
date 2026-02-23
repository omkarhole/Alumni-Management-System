// src/utils/globalurl.js

// Get API base URL from environment variable
// Falls back to localhost for development
const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "");

// Admin API endpoint
export const baseUrl = `${apiUrl}/api/admin`;

// Auth endpoint
export const authUrl = `${apiUrl}/auth`;

// Student API endpoint
export const studentUrl = `${apiUrl}/api/student`;

// Contact endpoint (optional but recommended for clarity)
export const contactUrl = `${apiUrl}/api/contact`;

// Skills API endpoint
export const skillsUrl = `${apiUrl}/api/admin/skills`;

// Achievements API endpoint
export const achievementsUrl = `${apiUrl}/api/admin/achievements`;

// Direct Messages API endpoint
export const messagesUrl = `${apiUrl}/api/dm`;
