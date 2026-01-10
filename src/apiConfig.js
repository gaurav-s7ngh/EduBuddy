// src/apiConfig.js

// CHANGE THIS to your actual InfinityFree URL when you deploy!
// Example: const LIVE_API_URL = "http://edubuddy.epizy.com/api";
const LIVE_API_URL = "edubuddy.infinityfreeapp.com/api"; 

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const API_BASE_URL = isLocal ? "/api" : LIVE_API_URL;

// Helper to fix image paths
export const getImagePath = (url) => {
  if (!url) return '/avatar.png'; // Make sure this matches your default avatar path in public folder
  // If the URL is already absolute (starts with http), return it
  if (url.startsWith('http')) return url;
  
  // Clean up the path: remove leading slash if present to avoid double slashes
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  
  // If local, /api/uploads works. If production, http://site.com/api/uploads
  return `${API_BASE_URL}/${cleanPath}`.replace('//', '/').replace(':/', '://');
};