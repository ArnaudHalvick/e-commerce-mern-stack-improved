/**
 * Request sanitization middleware
 *
 * This file contains middleware for sanitizing request data
 * These are general-purpose sanitizers that can be applied to all routes
 */

const { body } = require("express-validator");

/**
 * General sanitization middleware for all requests
 * Sanitizes common fields that might be used for XSS or injection attacks
 * But excludes address fields from any sanitization to prevent issues
 */
const sanitizeRequest = [
  // Special handling for address fields
  (req, res, next) => {
    // Save the original address object before any sanitization
    if (req.body && req.body.address) {
      req.originalAddress = JSON.parse(JSON.stringify(req.body.address));
      console.log("Original address before sanitization:", req.originalAddress);
    }
    next();
  },

  // Trim all fields
  body("*").trim(),

  // Only escape fields that are NOT address-related
  body([
    "name",
    "email",
    "password",
    "currentPassword",
    "newPassword",
    "phone",
  ]).escape(),

  // Restore the original address if it exists
  (req, res, next) => {
    if (req.body && req.originalAddress) {
      req.body.address = req.originalAddress;
      console.log("Restored address after sanitization:", req.body.address);
    }
    next();
  },
];

/**
 * Sanitize specific fields but without escaping (useful for rich text fields)
 * Only trims whitespace
 */
const sanitizeFields = (fields) => [
  ...fields.map((field) => body(field).trim()),

  // Pass control to the next middleware
  (req, res, next) => next(),
];

module.exports = {
  sanitizeRequest,
  sanitizeFields,
};
