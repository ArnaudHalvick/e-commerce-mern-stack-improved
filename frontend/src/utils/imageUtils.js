/**
 * Utility functions for handling image URLs
 */

// Get the base API URL from environment variables or fallback to localhost
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Gets the base URL without the /api suffix
 * @returns {string} The base URL for assets
 */
export const getBaseUrl = () => {
  // Remove '/api' from the end if it exists
  return API_BASE_URL.endsWith("/api")
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;
};

/**
 * Joins URL segments correctly, handling slashes appropriately
 * @param {string} baseUrl - The base URL
 * @param {string} path - The path to append
 * @returns {string} The properly joined URL
 */
export const joinUrl = (baseUrl, path) => {
  if (!baseUrl) return path;
  if (!path) return baseUrl;

  // Normalize base URL - remove trailing slash if exists
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Normalize path - ensure it starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Join them with exactly one slash
  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Creates an API URL by joining the base URL with an API path
 * @param {string} path - The API endpoint path (e.g. "products" or "auth/login")
 * @returns {string} The full API URL
 */
export const getApiUrl = (path) => {
  // Check if the base URL already contains /api
  const baseHasApi = API_BASE_URL.includes("/api");

  // Remove "api/" prefix from path if the base already has /api
  let apiPath = path;
  if (baseHasApi && path.startsWith("api/")) {
    apiPath = path.substring(4);
  } else if (!baseHasApi && !path.startsWith("api/")) {
    // Add the api prefix if not already present and base doesn't have it
    apiPath = `api/${path}`;
  }

  return joinUrl(
    API_BASE_URL,
    apiPath.startsWith("/") ? apiPath : `/${apiPath}`
  );
};

/**
 * Converts a relative image path to an absolute URL
 * @param {string} imagePath - The relative path of the image (e.g., "/images/product_1.png")
 * @returns {string} The absolute URL of the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If the image path already has a protocol and domain, return it as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Make sure the path starts with a slash
  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return joinUrl(getBaseUrl(), normalizedPath);
};

/**
 * Extracts the relative path from an absolute image URL
 * @param {string} imageUrl - The absolute URL of the image
 * @returns {string} The relative path of the image
 */
export const getRelativeImagePath = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    // If it's already a relative path, return it
    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }

    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");

    // Join all parts after the domain
    return `/${pathParts.slice(1).join("/")}`;
  } catch (error) {
    console.error("Error extracting relative image path:", error);
    return imageUrl; // Return as is if parsing fails
  }
};
