// backend/utils/urlUtils.js

/**
 * URL Utilities
 *
 * This module provides utilities for working with URLs across different environments
 */

const logger = require("./logger");

/**
 * Get the frontend URL with a fallback to a default value
 * @returns {string} The frontend URL with proper protocol
 */
const getFrontendUrl = () => {
  const env = process.env.NODE_ENV || "development";

  // Log all relevant environment variables for debugging
  logger.debug(`[urlUtils] Environment details:
    NODE_ENV: ${env}
    FRONTEND_URL from env: ${process.env.FRONTEND_URL || "not set"}
    Current working directory: ${process.cwd()}
  `);

  const frontendUrl =
    process.env.FRONTEND_URL ||
    (env === "development" ? "http://localhost:3000" : "https://159.65.230.12");

  // Log the frontend URL for debugging
  logger.debug(`[urlUtils] Using frontend URL: ${frontendUrl} (env: ${env})`);

  // Also log to console for immediate visibility during development
  if (env === "development") {
    console.log(`[urlUtils] Using frontend URL: ${frontendUrl} (env: ${env})`);
  }

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
 * @param {Object} options - Optional parameters
 * @param {string} options.email - Email address to include in the URL
 * @param {boolean} options.isEmailChange - Whether this is for an email change
 * @returns {string} The full verification URL
 */
const createVerificationUrl = (token, options = {}) => {
  const frontendUrl = getFrontendUrl();
  let url = `verify-email?token=${token}`;

  // Add email as a query parameter if provided
  if (options.email) {
    url += `&email=${encodeURIComponent(options.email)}`;
  }

  // Add isEmailChange flag if true
  if (options.isEmailChange) {
    url += `&isEmailChange=true`;
  }

  const finalUrl = joinUrl(frontendUrl, url);

  // Log the created URL for debugging
  logger.debug(`[urlUtils] Created verification URL: ${finalUrl}`);

  // Also log to console for immediate visibility during development
  if (process.env.NODE_ENV === "development") {
    console.log(`[urlUtils] Created verification URL: ${finalUrl}`);
  }

  return finalUrl;
};

/**
 * Create a password reset URL
 * @param {string} token - The password reset token
 * @returns {string} The full password reset URL
 */
const createPasswordResetUrl = (token) => {
  const frontendUrl = getFrontendUrl();
  const finalUrl = joinUrl(frontendUrl, `reset-password/${token}`);

  // Log the created URL for debugging
  logger.debug(`[urlUtils] Created password reset URL: ${finalUrl}`);

  // Also log to console for immediate visibility during development
  if (process.env.NODE_ENV === "development") {
    console.log(`[urlUtils] Created password reset URL: ${finalUrl}`);
  }

  return finalUrl;
};

module.exports = {
  getFrontendUrl,
  joinUrl,
  createVerificationUrl,
  createPasswordResetUrl,
};
