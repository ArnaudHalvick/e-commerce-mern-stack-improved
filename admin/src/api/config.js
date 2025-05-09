/**
 * Admin API Configuration
 * Contains all API-related configuration for the admin dashboard
 */

// Get the environment
const isDevEnvironment = import.meta.env.DEV;

// Default protocol based on environment
const defaultProtocol = isDevEnvironment ? "http" : "https";

// Get the base API URL with environment-specific fallbacks
export const API_BASE_URL = (() => {
  // First check if explicitly set in environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development fallback
  if (isDevEnvironment) {
    return `${defaultProtocol}://localhost:4000`;
  }

  // Production fallback
  return `${defaultProtocol}://mernappshopper.xyz/api`;
})();

/**
 * Gets the base URL without the trailing "/api" suffix
 * Used for assets like images
 */
export const getBaseUrl = () => {
  // Remove any "/api" suffix
  let baseUrl = API_BASE_URL.replace(/\/api$/, "");

  // For images in production, use the main domain without port
  if (!isDevEnvironment) {
    baseUrl = baseUrl.replace(/:\d+$/, "");
  }

  return baseUrl;
};

/**
 * Joins URL segments correctly, handling slashes
 */
export const joinUrl = (baseUrl, path) => {
  if (!baseUrl) return path;
  if (!path) return baseUrl;

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Creates an API URL by joining the base URL with an API path
 */
export const getApiUrl = (path) => {
  const baseHasApi = API_BASE_URL.includes("/api");

  if (baseHasApi && path.startsWith("api/")) {
    path = path.substring(4);
  }

  return joinUrl(API_BASE_URL, path.startsWith("/") ? path : `/${path}`);
};

/**
 * Converts a relative image path to an absolute URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Return absolute URLs unchanged
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Ensure path starts with a slash
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return joinUrl(getBaseUrl(), normalizedPath);
};

export default {
  API_BASE_URL,
  getBaseUrl,
  joinUrl,
  getApiUrl,
  getImageUrl,
};
