/**
 * Error handling utilities
 * Centralized functions for error handling, formatting, and display
 */

/**
 * Parse and format error messages from API responses
 * @param {Object|Error} error - Error object from API response or thrown error
 * @returns {Object} Formatted error object with message, type, and details
 */
export const parseApiError = (error) => {
  // Default error response
  const formattedError = {
    message: "An unexpected error occurred. Please try again later.",
    type: "unknown",
    status: 500,
    details: null,
    fieldErrors: null,
  };

  // Check if it's a network error
  if (error.message === "Network Error") {
    return {
      ...formattedError,
      message:
        "Unable to connect to the server. Please check your network connection.",
      type: "network",
    };
  }

  // If error was already processed
  if (error.originalError) {
    return error;
  }

  // Handle axios errors or other errors with response property
  if (error.response) {
    const { status, data } = error.response;
    formattedError.status = status;

    switch (status) {
      case 400:
        formattedError.type = "validation";
        formattedError.message =
          data.message || "Invalid request. Please check your inputs.";
        break;
      case 401:
        formattedError.type = "auth";
        formattedError.message =
          data.message || "Authentication failed. Please log in again.";
        break;
      case 403:
        formattedError.type = "permission";
        formattedError.message =
          data.message || "You don't have permission to access this resource.";
        break;
      case 404:
        formattedError.type = "notFound";
        formattedError.message =
          data.message || "The requested resource was not found.";
        break;
      case 422:
        formattedError.type = "validation";
        formattedError.message =
          data.message || "Validation error. Please check your inputs.";
        // Extract field errors if available
        if (data.errors && Array.isArray(data.errors)) {
          formattedError.fieldErrors = {};
          data.errors.forEach((err) => {
            formattedError.fieldErrors[err.param] = err.msg;
          });
        }
        break;
      case 429:
        formattedError.type = "rateLimit";
        formattedError.message =
          data.message || "Too many requests. Please try again later.";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        formattedError.type = "server";
        formattedError.message =
          data.message || "Server error. Please try again later.";
        break;
      default:
        formattedError.message = data.message || formattedError.message;
    }

    // Add detailed error information if available
    if (data.details) {
      formattedError.details = data.details;
    }
  } else if (error.request) {
    // Request was made but no response received
    formattedError.type = "network";
    formattedError.message = "No response from server. Please try again later.";
  } else if (error.message) {
    // Error was thrown with a message
    formattedError.message = error.message;
  }

  return formattedError;
};

/**
 * Format validation errors for use with form libraries
 * @param {Object} apiErrors - Field errors from API
 * @returns {Object} Formatted errors object compatible with form libraries
 */
export const formatValidationErrors = (apiErrors) => {
  if (!apiErrors || !apiErrors.fieldErrors) {
    return {};
  }

  return apiErrors.fieldErrors;
};

/**
 * Check if an error is a specific type
 * @param {Object} error - Error object
 * @param {string} type - Error type to check for
 * @returns {boolean} True if error matches the specified type
 */
export const isErrorType = (error, type) => {
  if (!error) return false;
  return error.type === type;
};

/**
 * Get appropriate HTTP status text
 * @param {number} status - HTTP status code
 * @returns {string} HTTP status text
 */
export const getStatusText = (status) => {
  switch (status) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 422:
      return "Unprocessable Entity";
    case 429:
      return "Too Many Requests";
    case 500:
      return "Internal Server Error";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    case 504:
      return "Gateway Timeout";
    default:
      return "Unknown Error";
  }
};

/**
 * Generate user-friendly error message
 * @param {Object} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (!error) {
    return "An unexpected error occurred. Please try again later.";
  }

  // If we already have a user-friendly message
  if (error.message) {
    return error.message;
  }

  // Generate message based on error type
  switch (error.type) {
    case "network":
      return "Unable to connect to the server. Please check your network connection.";
    case "auth":
      return "Authentication failed. Please log in again.";
    case "permission":
      return "You don't have permission to access this resource.";
    case "notFound":
      return "The requested resource was not found.";
    case "validation":
      return "Please check your inputs and try again.";
    case "server":
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again later.";
  }
};
