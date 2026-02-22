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

// Admin API endpoint
export const baseUrl = `${apiUrl}/api/admin`;

// Auth endpoint
export const authUrl = `${apiUrl}/auth`;

// Admin API endpoint
export const oauthUrl = `${apiUrl}/api/oauth`;

// Student API endpoint
export const studentUrl = `${apiUrl}/api/student`;

// Contact endpoint (optional but recommended for clarity)
export const contactUrl = `${apiUrl}/api/contact`;

// Skills API endpoint
export const skillsUrl = `${apiUrl}/api/admin/skills`;
