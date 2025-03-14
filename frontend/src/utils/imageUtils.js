/**
 * Utility functions for handling image URLs
 */

// Get the base API URL from environment variables or fallback to localhost
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

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

  return `${API_BASE_URL}${normalizedPath}`;
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
