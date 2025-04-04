import { getImageUrl } from "../../../api/config";

/**
 * Get the appropriate image URL for a product image
 * @param {string} image - Image path or URL
 * @returns {string} - The properly formatted image URL
 */
export const getProductImageUrl = (image) => {
  if (!image) {
    return getImageUrl("/images/pink-placeholder.png");
  }

  // If the image is already a full URL, return it as is
  if (image.startsWith("http") || image.startsWith("https")) {
    return image;
  }

  // Use the main app's getImageUrl helper to get the proper URL
  return getImageUrl(image);
};

/**
 * Get a fallback image when no image is available
 * @returns {string} - The fallback image URL
 */
export const getPlaceholderImage = () => {
  return getImageUrl("/images/pink-placeholder.png");
};
