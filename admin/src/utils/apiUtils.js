/**
 * Utility functions for API URLs in the admin panel
 */

// Get the default protocol from environment variable or use HTTPS as fallback
const defaultProtocol = import.meta.env.VITE_DEFAULT_PROTOCOL || "https";

// Get the base API URL from environment variables or construct fallback with default protocol
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || `${defaultProtocol}://localhost:4000/`;

console.log(`Admin panel using API URL: ${API_BASE_URL}`);
console.log(`Default protocol: ${defaultProtocol}`);

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
  // Add the api prefix if not already present
  const apiPath = path.startsWith("api/") ? path : `api/${path}`;
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
