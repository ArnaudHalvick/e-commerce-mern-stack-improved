/**
 * Centralized API configuration
 * This file contains all API-related configuration and URL manipulation utilities
 */

// Get the base API URL from environment variables or fallback to localhost.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Gets the base URL without the trailing "/api" suffix.
 * Uses a regex to remove the "/api" at the end if it exists.
 * @returns {string} The base URL for assets.
 */
export const getBaseUrl = () => {
  return API_BASE_URL.replace(/\/api$/, "");
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
  // Check if the base URL already contains "/api".
  const baseHasApi = API_BASE_URL.includes("/api");

  // Adjust the API path based on whether the base already has "/api".
  let apiPath = path;
  if (baseHasApi && path.startsWith("api/")) {
    // Remove "api/" prefix from the path if base URL already has "/api".
    apiPath = path.substring(4);
  } else if (!baseHasApi && !path.startsWith("api/")) {
    // Add "api/" prefix if not present and base doesn't have it.
    apiPath = `api/${path}`;
  }

  // Ensure proper joining of URL segments.
  return joinUrl(
    API_BASE_URL,
    apiPath.startsWith("/") ? apiPath : `/${apiPath}`
  );
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
    console.error("Error extracting relative image path:", error);
    return imageUrl; // Return as is if parsing fails.
  }
};
