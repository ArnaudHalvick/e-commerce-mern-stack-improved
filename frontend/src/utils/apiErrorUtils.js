/**
 * Formats an error object for consistent error handling throughout the application
 * @param {Error|Object} error - The error object
 * @returns {Object} Standardized error object
 */
export const formatApiError = (error) => {
  // Already formatted error
  if (error.formattedError) {
    return error;
  }

  // Handle null or undefined error
  if (!error) {
    return {
      message: "An unexpected error occurred",
      status: 500,
      formattedError: true,
      fieldErrors: {},
      originalError: error,
    };
  }

  const formattedError = {
    message: "An unexpected error occurred",
    status: 500,
    formattedError: true,
    fieldErrors: {},
    originalError: error,
  };

  // Handle different error types
  if (error.response) {
    // Server responded with an error
    formattedError.status = error.response.status;

    // Extract error message from response
    if (error.response.data) {
      if (typeof error.response.data === "string") {
        formattedError.message = error.response.data || formattedError.message;
      } else if (error.response.data.message) {
        formattedError.message =
          error.response.data.message || formattedError.message;
      } else if (error.response.data.error) {
        formattedError.message =
          error.response.data.error || formattedError.message;
      }

      // Extract field validation errors if present
      if (error.response.data.errors) {
        formattedError.fieldErrors = error.response.data.errors;
      }
    }

    // Status-specific error messages
    switch (formattedError.status) {
      case 400:
        if (
          !formattedError.message ||
          formattedError.message === "An unexpected error occurred"
        ) {
          formattedError.message = "Invalid request";
        }
        break;
      case 401:
        formattedError.message =
          "Your session has expired. Please log in again";
        break;
      case 403:
        formattedError.message =
          "You do not have permission to access this resource";
        break;
      case 404:
        // Special handling for user not found errors in password recovery flow
        if (
          error.config &&
          error.config.url &&
          error.config.url.includes("forgot-password")
        ) {
          formattedError.message = "No account found with this email address";
        } else {
          formattedError.message =
            formattedError.message || "The requested resource was not found";
        }
        break;
      case 409:
        formattedError.message =
          "This request conflicts with the current state of the server";
        break;
      case 422:
        formattedError.message = "Validation error";
        break;
      case 429:
        formattedError.message = "Too many requests. Please try again later";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        formattedError.message = "Server error. Please try again later";
        break;
      default:
        // Keep the message from the server if available
        break;
    }
  } else if (error.request) {
    // Request made but no response received (network error)
    formattedError.message = "Network error. Please check your connection.";
    formattedError.status = 0;
  } else if (error.message) {
    // Something else happened while setting up the request
    formattedError.message = error.message;
  } else if (typeof error === "object" && Object.keys(error).length === 0) {
    // Empty error object case
    formattedError.message = "An unexpected error occurred";
  }

  return formattedError;
};

/**
 * Extracts field-specific errors from an API error response
 * @param {Object} error - The error object
 * @returns {Object} Field errors object
 */
export const extractFieldErrors = (error) => {
  if (!error) return {};

  const formattedError = formatApiError(error);
  return formattedError.fieldErrors || {};
};

/**
 * Returns a user-friendly error message based on error type
 * @param {Error|Object} error - The error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  const formattedError = formatApiError(error);
  return formattedError.message;
};
