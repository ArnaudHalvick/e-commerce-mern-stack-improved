// backend/utils/errors/AppError.js

const logger = require("../common/logger");

/**
 * Custom error class for the application that extends the built-in Error object.
 * Allows for standardized error handling with additional properties like statusCode and isOperational.
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code for the error
   * @param {Object} errors - Optional validation errors object
   */
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    // Set status based on status code - 'fail' for 4xx errors, 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Operational errors are expected errors that we can predict and handle properly
    this.isOperational = true;

    // Add validation errors if provided
    if (errors) {
      this.errors = errors;
    }

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create an AppError instance and log it appropriately based on severity
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code for the error
   * @param {Object} context - Additional context for the error log
   * @param {Object} errors - Optional validation errors object
   * @returns {AppError} New AppError instance
   */
  static createAndLogError(message, statusCode, context = {}, errors = null) {
    // Log based on status code severity
    if (statusCode >= 500) {
      logger.error(message, { ...context, statusCode });
    } else if (statusCode >= 400) {
      logger.warn(message, { ...context, statusCode });
    } else {
      logger.info(message, { ...context, statusCode });
    }

    return new AppError(message, statusCode, errors);
  }
}

module.exports = AppError;
