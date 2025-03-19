/**
 * Custom error class for the application that extends the built-in Error object.
 * Allows for standardized error handling with additional properties like statusCode and isOperational.
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code for the error
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Set status based on status code - 'fail' for 4xx errors, 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Operational errors are expected errors that we can predict and handle properly
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
