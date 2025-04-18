/**
 * Request sanitization middleware
 *
 * This file contains middleware for sanitizing request data
 * These are general-purpose sanitizers that can be applied to all routes
 */

const { body } = require("express-validator");

/**
 * Helper to recursively sanitize only string values in nested objects
 * - Preserves object structure
 * - Only sanitizes string primitive values
 * - Does not affect arrays or objects
 *
 * @param {Object} obj - The object to sanitize
 * @param {Function} sanitizer - The sanitization function (e.g., trim, escape)
 * @returns {Object} - Sanitized object with structure preserved
 */
const deepSanitizeStrings = (obj, sanitizer) => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitizeStrings(item, sanitizer));
  }

  // Handle objects
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizer(value);
    } else if (typeof value === "object" && value !== null) {
      result[key] = deepSanitizeStrings(value, sanitizer);
    } else {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Trim string helper
 */
const trimString = (str) => str.trim();

/**
 * Escape string helper (for XSS prevention)
 */
const escapeString = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * General sanitization middleware for all requests
 * Sanitizes common fields that might be used for XSS or injection attacks
 * Preserves nested structure for address and shipping fields
 */
const sanitizeRequest = [
  // Pre-process request body to preserve complex objects
  (req, res, next) => {
    if (req.body) {
      // Preserve original structure before any sanitization
      req.originalBody = JSON.parse(JSON.stringify(req.body));

      // Apply deep string trimming to all fields
      req.body = deepSanitizeStrings(req.body, trimString);
    }
    next();
  },

  // Use express-validator to sanitize simple fields
  body([
    "name",
    "email",
    "password",
    "currentPassword",
    "newPassword",
    "phone",
    "message",
    "feedback",
    "searchQuery",
  ]).escape(),

  // Post-process to make sure address and shipping fields remain intact
  (req, res, next) => {
    if (req.body && req.originalBody) {
      // Restore complex objects that should not be escaped
      ["address", "shippingInfo", "shippingAddress"].forEach((key) => {
        if (
          req.originalBody[key] &&
          typeof req.originalBody[key] === "object"
        ) {
          req.body[key] = deepSanitizeStrings(
            req.originalBody[key],
            trimString
          );
        }
      });

      // Clean up
      delete req.originalBody;
    }
    next();
  },
];

/**
 * Sanitize specific fields but without escaping (useful for rich text fields)
 * Only trims whitespace
 */
const sanitizeFields = (fields) => [
  // Middle flag to avoid running the standard sanitizer
  (req, res, next) => {
    req.skipStandardSanitization = true;
    next();
  },

  ...fields.map((field) => body(field).trim()),

  // Pass control to the next middleware
  (req, res, next) => next(),
];

module.exports = {
  sanitizeRequest,
  sanitizeFields,
  deepSanitizeStrings,
};
