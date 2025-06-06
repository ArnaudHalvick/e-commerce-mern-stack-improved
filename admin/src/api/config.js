/**
 * Admin API Configuration
 * Contains all API-related configuration for the admin dashboard
 */

// Check for runtime config first (from Docker container)
const RUNTIME_CONFIG =
  typeof window !== "undefined" ? window.RUNTIME_CONFIG : null;

// Determine if we're running in a Docker container (only for local development)
const IS_LOCAL_DOCKER =
  import.meta.env.DEV && import.meta.env.VITE_IS_DOCKER === "true";

// Get API URL from runtime config, environment variables, or local default
export const API_URL =
  // Use runtime config first (for production)
  RUNTIME_CONFIG?.apiUrl ||
  // Then environment variable
  import.meta.env.VITE_API_URL ||
  // Default fallback
  "http://localhost:4001";

// Get host location
export const HOST_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : RUNTIME_CONFIG?.hostUrl || API_URL;

export const ADMIN_API_PATH =
  import.meta.env.VITE_ADMIN_API_PATH || "/api/admin";

// Construct full API base URL
export const API_BASE_URL = API_URL;

// Authentication endpoints - use same domain to avoid CORS
export const AUTH_ENDPOINTS = {
  LOGIN: `${ADMIN_API_PATH}/auth/login`,
  LOGOUT: `${ADMIN_API_PATH}/auth/logout`,
  VERIFY: `${ADMIN_API_PATH}/auth/verify`,
  REFRESH_TOKEN: `${ADMIN_API_PATH}/auth/refresh-token`,
};

// Product endpoints
export const PRODUCT_ENDPOINTS = {
  GET_ALL: `${ADMIN_API_PATH}/products`,
  GET_BY_ID: (id) => `${ADMIN_API_PATH}/products/${id}`,
  GET_BY_SLUG: (slug) => `${ADMIN_API_PATH}/products/slug/${slug}`,
  CREATE: `${ADMIN_API_PATH}/products`,
  UPDATE: (id) => `${ADMIN_API_PATH}/products/${id}`,
  DELETE: (id) => `${ADMIN_API_PATH}/products/${id}`,
  PERMANENT_DELETE: (id) => `${ADMIN_API_PATH}/products/${id}/permanent`,
  RESTORE: (id) => `${ADMIN_API_PATH}/products/${id}/restore`,
  TOGGLE_AVAILABILITY: (id) =>
    `${ADMIN_API_PATH}/products/${id}/toggle-availability`,
  UPLOAD_IMAGES: `${ADMIN_API_PATH}/products/upload`,
  DELETE_IMAGES: `${ADMIN_API_PATH}/products/images`,
  GET_IMAGES: `${ADMIN_API_PATH}/products/images`,
};

// Order endpoints
export const ORDER_ENDPOINTS = {
  GET_ALL: `${ADMIN_API_PATH}/orders`,
  GET_BY_ID: (id) => `${ADMIN_API_PATH}/orders/${id}`,
  UPDATE_STATUS: (id) => `${ADMIN_API_PATH}/orders/${id}/status`,
};

// Users endpoints
export const USER_ENDPOINTS = {
  GET_ALL: `${ADMIN_API_PATH}/users`,
  GET_BY_ID: (id) => `${ADMIN_API_PATH}/users/${id}`,
  UPDATE: (id) => `${ADMIN_API_PATH}/users/${id}`,
  DISABLE: (id) => `${ADMIN_API_PATH}/users/${id}/disable`,
  ENABLE: (id) => `${ADMIN_API_PATH}/users/${id}/enable`,
};

/**
 * Gets the base URL without the trailing "/api" suffix
 * Used for assets like images
 */
export const getBaseUrl = () => {
  // In local Docker container dev environment, use the full VITE_API_URL for images
  if (IS_LOCAL_DOCKER) {
    return import.meta.env.VITE_API_URL;
  }

  // In browser, always use current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Remove any "/api" suffix
  let baseUrl = API_BASE_URL.replace(/\/api$/, "");

  // For images in production, use the main domain without port
  if (!import.meta.env.DEV) {
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
  AUTH_ENDPOINTS,
  PRODUCT_ENDPOINTS,
  ORDER_ENDPOINTS,
  USER_ENDPOINTS,
};
