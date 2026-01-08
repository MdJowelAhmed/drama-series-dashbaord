// Base URL for API/server images
const API_BASE_URL = "http://72.62.164.122:5000";
// const API_BASE_URL = "https://rakibur5003.binarybards.online";
// const API_BASE_URL = "http://10.10.7.48:5003";

// CDN base URL for Bunny.net
// const CDN_BASE_URL = "yoga-app.b-cdn.net";
const CDN_BASE_URL = "http://72.62.164.122:5000";
/**
 * Get proper image URL from path
 * Handles both full URLs and relative paths
 * 
 * @param {string} path - Image path or URL
 * @returns {string} - Complete image URL
 */
export const getImageUrl = (path) => {
  if (!path || typeof path !== "string") {
    return "";
  }

  // Already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // CDN URL without protocol (e.g., "yoga-app.b-cdn.net/thumbnails/xxx.jpg")
  if (path.includes("b-cdn.net") || path.includes("bunnycdn")) {
    return `https://${path}`;
  }

  // Relative path - prepend API base URL
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Get video or thumbnail URL from CDN or API
 * Handles various URL formats for video thumbnails and video URLs
 * 
 * @param {string} url - Video/thumbnail URL
 * @returns {string} - Complete URL with protocol
 */
export function getVideoAndThumbnail(url) {
  if (!url) return "";

  // Already has http/https protocol
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Bunny CDN URL without protocol
  if (url.includes("b-cdn.net") || url.includes("bunnycdn") || url.includes("mediadelivery.net")) {
    return `https://${url}`;
  }

  // Relative path - use API base URL
  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  // Assume it needs https:// prefix
  return `https://${url}`;
}

/**
 * Build thumbnail URL for Bunny CDN
 * Format: yoga-app.b-cdn.net/thumbnails/[videoId].jpg
 * 
 * @param {string} videoId - The video ID
 * @param {string} extension - File extension (default: jpg)
 * @returns {string} - Complete thumbnail URL
 */
export function buildThumbnailUrl(videoId, extension = "jpg") {
  if (!videoId) return "";
  return `https://${CDN_BASE_URL}/thumbnails/${videoId}.${extension}`;
}

/**
 * Build video embed URL for Bunny Stream
 * 
 * @param {string} libraryId - Bunny library ID
 * @param {string} videoId - Video ID
 * @returns {string} - Embed URL
 */
export function buildVideoEmbedUrl(libraryId, videoId) {
  if (!libraryId || !videoId) return "";
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
}

/**
 * Check if URL is a valid Bunny CDN URL
 * 
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isBunnyCdnUrl(url) {
  if (!url) return false;
  return url.includes("b-cdn.net") || url.includes("bunnycdn") || url.includes("mediadelivery.net");
}

export default {
  getImageUrl,
  getVideoAndThumbnail,
  buildThumbnailUrl,
  buildVideoEmbedUrl,
  isBunnyCdnUrl,
  API_BASE_URL,
  CDN_BASE_URL,
};
