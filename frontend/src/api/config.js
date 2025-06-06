/**
 * Centralized API configuration
 * This file contains all API-related configuration and URL manipulation utilities
 */

// Get the environment
const isDevEnvironment =
  process.env.NODE_ENV === "development" ||
  process.env.REACT_APP_ENV === "development";

// Get default protocol from environment variable or fall back to environment-specific default
const defaultProtocol =
  process.env.REACT_APP_DEFAULT_PROTOCOL ||
  (isDevEnvironment ? "http" : "https");

// Get the base API URL from environment variables with environment-specific fallbacks
export const API_BASE_URL = (() => {
  // If explicitly set in environment variables, use that regardless of environment
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // As a fallback for development
  if (isDevEnvironment) {
    return `${defaultProtocol}://localhost:4000`;
  }

  // Production fallback
  return `${defaultProtocol}://mernappshopper.xyz/api`;
})();

/**
 * Gets the base URL without the trailing "/api" suffix and without the port for images.
 * @returns {string} The base URL for assets.
 */
export const getBaseUrl = () => {
  // Remove any "/api" suffix
  let baseUrl = API_BASE_URL.replace(/\/api$/, "");

  // For images in production, we want to use the main domain without the port
  if (process.env.NODE_ENV === "production") {
    // Replace the HTTPS port (e.g., :4443) with nothing for images
    baseUrl = baseUrl.replace(/:\d+$/, "");
  }

  return baseUrl;
};

/**
 * Joins URL segments correctly, handling slashes appropriately.
 * @param {string} baseUrl - The base URL.
 * @param {string} path - The path to append.
 * @returns {string} The properly joined URL.
 */
export const joinUrl = (baseUrl, path) => {
  if (!baseUrl) return path;
  if (!path) return baseUrl;

  // Remove trailing slash from baseUrl if it exists.
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  // Ensure path starts with a slash.
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Creates an API URL by joining the base URL with an API path.
 * Handles cases where the base URL already contains "/api".
 * @param {string} path - The API endpoint path (e.g. "products" or "auth/login").
 * @returns {string} The full API URL.
 */
export const getApiUrl = (path) => {
  // Check if the base URL already contains "/api"
  const baseHasApi = API_BASE_URL.includes("/api");

  // If path starts with api/ and baseUrl already includes /api, remove the prefix
  if (baseHasApi && path.startsWith("api/")) {
    path = path.substring(4);
  }

  // Ensure proper joining of URL segments
  return joinUrl(API_BASE_URL, path.startsWith("/") ? path : `/${path}`);
};

/**
 * Converts a relative image path to an absolute URL.
 * If the provided path is already absolute, it is returned as is.
 * @param {string} imagePath - The relative path of the image (e.g., "/images/product_1.png").
 * @returns {string|null} The absolute URL of the image, or null if no path is provided.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If the image path already has a protocol, return it unchanged.
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Ensure the image path starts with a slash.
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return joinUrl(getBaseUrl(), normalizedPath);
};

/**
 * Extracts the relative path from an absolute image URL.
 * @param {string} imageUrl - The absolute URL of the image.
 * @returns {string|null} The relative path of the image, or null if no URL is provided.
 */
export const getRelativeImagePath = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    // If it's already a relative path, return it.
    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }
    const url = new URL(imageUrl);
    // Return the pathname directly.
    return url.pathname;
  } catch (error) {
    return imageUrl; // Return as is if parsing fails.
  }
};
