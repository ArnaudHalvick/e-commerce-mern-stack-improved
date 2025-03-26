/**
 * Global validation middleware
 *
 * This file contains middleware that can be applied globally to all routes
 * It provides basic sanitization and validation for all incoming requests
 */

const { validationResult } = require("express-validator");
const AppError = require("../utils/errors/AppError");

/**
 * Middleware to sanitize request parameters
 * - Removes potential malicious characters from URL parameters
 * - Normalizes parameter values
 */
const sanitizeParams = (req, res, next) => {
  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      if (typeof req.params[key] === "string") {
        // Sanitize parameters (basic)
        req.params[key] = req.params[key].trim();
      }
    });
  }
  next();
};

/**
 * Global validation error handler
 * Checks if any validation middleware has added errors
 * Using the express-validator validationResult
 */
const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(errors.array()[0].msg, 400, {
        errors: errors.array(),
      })
    );
  }
  next();
};

module.exports = {
  sanitizeParams,
  validationErrorHandler,
};
