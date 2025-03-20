/**
 * URL Utilities
 *
 * This module provides utilities for working with URLs across different environments
 */

/**
 * Get the frontend URL with a fallback to a default value
 * @returns {string} The frontend URL with proper protocol
 */
const getFrontendUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Ensure the URL has a protocol
  if (
    !frontendUrl.startsWith("http://") &&
    !frontendUrl.startsWith("https://")
  ) {
    return `http://${frontendUrl}`;
  }

  return frontendUrl;
};

/**
 * Join base URL with a path, ensuring there's exactly one slash between them
 * @param {string} baseUrl - The base URL
 * @param {string} path - The path to append
 * @returns {string} The properly joined URL
 */
const joinUrl = (baseUrl, path) => {
  // Remove trailing slash from baseUrl if it exists
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${base}/${cleanPath}`;
};

/**
 * Create a verification URL for email
 * @param {string} token - The verification token
 * @returns {string} The full verification URL
 */
const createVerificationUrl = (token) => {
  const frontendUrl = getFrontendUrl();
  return joinUrl(frontendUrl, `verify-email?token=${token}`);
};

/**
 * Create a password reset URL
 * @param {string} token - The password reset token
 * @returns {string} The full password reset URL
 */
const createPasswordResetUrl = (token) => {
  const frontendUrl = getFrontendUrl();
  return joinUrl(frontendUrl, `reset-password/${token}`);
};

module.exports = {
  getFrontendUrl,
  joinUrl,
  createVerificationUrl,
  createPasswordResetUrl,
};
