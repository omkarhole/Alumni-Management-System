const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const baseUrl = `${apiUrl}/api/admin`;
export const authUrl = `${apiUrl}/auth`;
export const studentUrl = `${apiUrl}/api/student`;
