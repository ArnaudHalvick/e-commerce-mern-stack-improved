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
 */
const sanitizeRequest = [
  // Exemple sur quelques champs courants – tu peux adapter selon ton app
  body("*").trim().escape(),

  // Pass control to the next middleware
  (req, res, next) => next(),
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
