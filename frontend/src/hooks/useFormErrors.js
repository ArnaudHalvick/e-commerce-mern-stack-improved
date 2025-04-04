import { useState } from "react";
import useErrorRedux from "./useErrorRedux";

/**
 * Custom hook for handling form errors
 * @param {Object} initialErrors - Initial error state
 * @returns {Object} Form error state and helper functions
 */
const useFormErrors = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors);
  const { showError } = useErrorRedux();

  /**
   * Set a specific field error
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  const setFieldError = (field, message) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  /**
   * Clear a specific field error
   * @param {string} field - Field name to clear
   */
  const clearFieldError = (field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  /**
   * Clear all form errors
   */
  const clearAllErrors = () => {
    setErrors({});
  };

  /**
   * Set multiple field errors at once
   * @param {Object} errorObject - Object with field names as keys and error messages as values
   */
  const setMultipleErrors = (errorObject) => {
    setErrors((prev) => ({
      ...prev,
      ...errorObject,
    }));
  };

  /**
   * Handle API errors by displaying toast and setting form errors
   * @param {Error} error - Error object from API call
   * @param {boolean} showToast - Whether to show a toast notification
   */
  const handleApiError = (error, showToast = true) => {
    // Extract error message
    const errorMessage = error.message || "An unexpected error occurred";

    // Handle specific error cases
    if (error.status === 404) {
      // Special handling for forgot password 404 errors
      if (
        error.config &&
        error.config.url &&
        error.config.url.includes("/forgot-password")
      ) {
        setFieldError("email", "No account found with this email address");
      } else {
        // For other 404 errors, set a general error
        setFieldError("general", errorMessage);
      }
    } else if (error.status === 400) {
      // For validation errors, set a general error if no field errors are provided
      if (!error.fieldErrors || Object.keys(error.fieldErrors).length === 0) {
        setFieldError("general", errorMessage);
      }
    } else {
      // For other errors, set a general error
      setFieldError("general", errorMessage);
    }

    // Show toast notification if enabled
    if (showToast) {
      showError(errorMessage);
    }

    // If error contains field-specific validation errors, set them
    if (error.fieldErrors) {
      setMultipleErrors(error.fieldErrors);
    }

    return errorMessage;
  };

  /**
   * Check if there are any errors
   * @returns {boolean} True if there are errors
   */
  const hasErrors = () => Object.keys(errors).length > 0;

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setMultipleErrors,
    handleApiError,
    hasErrors,
  };
};

export default useFormErrors;
