// src/utils/globalurl.js

// Get API base URL from environment variable
// Falls back to localhost for development
export const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "");

// Convert stored file paths (absolute, windows, or relative) into a browser-safe public URL.
export const toPublicUrl = (assetPath = "") => {
  if (!assetPath) return "";

  const normalized = String(assetPath).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const publicMatch = normalized.match(/public\/.*/i);
  if (publicMatch) {
    const rel = publicMatch[0].replace(/^public\//i, "public/");
    return `${apiUrl}/${rel.replace(/^\/+/, "")}`;
  }

  return `${apiUrl}/${normalized.replace(/^\/+/, "")}`;
};

/* =========================
   VERSIONED API ENDPOINTS (v1)
========================= */

// Base API v1 endpoint
export const apiV1Url = `${apiUrl}/api/v1`;

// Admin API endpoint (v1)
export const baseUrl = `${apiV1Url}/admin`;

// Auth endpoint (no versioning for backward compatibility)
export const authUrl = `${apiUrl}/auth`;

// OAuth endpoint (v1)
export const oauthUrl = `${apiV1Url}/oauth`;

// Student API endpoint (v1)
export const studentUrl = `${apiV1Url}/student`;

// Contact endpoint (v1)
export const contactUrl = `${apiV1Url}/contact`;

// Skills API endpoint (v1)
export const skillsUrl = `${apiV1Url}/admin/skills`;

// Achievements API endpoint (v1)
export const achievementsUrl = `${apiV1Url}/admin/achievements`;

// Direct Messages API endpoint (v1)
export const messagesUrl = `${apiV1Url}/dm`;

// Business API endpoint (v1)
export const businessUrl = `${apiV1Url}/business`;

// Badge API endpoint (v1)
export const badgeUrl = `${apiV1Url}/badges`;

// Courses API endpoint (v1)
export const coursesUrl = `${apiV1Url}/courses`;

// Event Calendar API endpoint (v1)
export const eventCalendarUrl = `${apiV1Url}/event-calendar`;

// Reunions API endpoint (v1)
export const reunionsUrl = `${apiV1Url}/reunions`;

/* =========================
   BACKWARD COMPATIBILITY (deprecated - use v1 endpoints above)
========================= */

// Admin API endpoint (deprecated)
export const adminUrl = `${apiUrl}/api/admin`;

// Student API endpoint (deprecated)
export const oldStudentUrl = `${apiUrl}/api/student`;

