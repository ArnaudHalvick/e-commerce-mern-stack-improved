/**
 * Image handling utilities
 * Functions for image processing, optimization, and URL handling
 */

import { getImageUrl, getRelativeImagePath } from "../api/config";

export { getImageUrl, getRelativeImagePath };

/**
 * Get appropriate alt text for an image
 * @param {Object} product - Product object
 * @returns {string} Alt text for the image
 */
export const getImageAlt = (product) => {
  if (!product) return "Product image";
  return `${product.name || "Product"} ${
    product.category ? `- ${product.category}` : ""
  }`;
};

/**
 * Get a placeholder image URL for when product image is not available
 * @param {string} size - Size of the placeholder (small, medium, large)
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (size = "medium") => {
  const sizes = {
    small: "/images/placeholders/product-placeholder-small.png",
    medium: "/images/placeholders/product-placeholder-medium.png",
    large: "/images/placeholders/product-placeholder-large.png",
  };
  return getImageUrl(sizes[size] || sizes.medium);
};

/**
 * Add image size suffix to an image URL
 * @param {string} imageUrl - Original image URL
 * @param {string} size - Size suffix to add (small, medium, large)
 * @returns {string} Modified image URL with size suffix
 */
export const getImageWithSize = (imageUrl, size = "medium") => {
  if (!imageUrl) return getPlaceholderImage(size);

  // If it's already a relative path
  if (imageUrl.startsWith("/")) {
    const parts = imageUrl.split(".");
    if (parts.length > 1) {
      const extension = parts.pop();
      return getImageUrl(`${parts.join(".")}-${size}.${extension}`);
    }
    return getImageUrl(imageUrl);
  }

  // If it's an absolute URL
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const parts = pathname.split(".");
    if (parts.length > 1) {
      const extension = parts.pop();
      url.pathname = `${parts.join(".")}-${size}.${extension}`;
      return url.toString();
    }
    return imageUrl;
  } catch {
    return imageUrl;
  }
};

/**
 * Check if an image URL is valid
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} Promise resolving to true if image is valid
 */
export const isImageValid = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
