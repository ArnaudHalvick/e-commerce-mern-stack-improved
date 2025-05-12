import { useCallback } from "react";
import { useToast } from "../toast/hooks/useToast";

/**
 * Custom hook for consistent error handling across the application
 *
 * @returns {Object} Error handling methods
 */
const useErrorHandler = () => {
  const { showErrorToast } = useToast();

  /**
   * Handle API or general errors with appropriate UI feedback
   *
   * @param {Error} error - The error object
   * @param {Object} options - Options for handling the error
   * @param {Function} [options.logError] - Function to log the error (default: console.error)
   * @param {boolean} [options.rethrow=false] - Whether to rethrow the error
   * @returns {void}
   */
  const handleError = useCallback(
    (error, { logError = console.error, rethrow = false } = {}) => {
      // Get a user-friendly error message
      let errorMessage = "An unexpected error occurred";

      if (error?.response?.data?.message) {
        // Handle API error responses
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Handle standard Error objects
        errorMessage = error.message;
      }

      // Log the error
      if (logError) {
        logError("Error:", error);
      }

      // Show a toast notification
      showErrorToast(errorMessage, { duration: 5000 });

      // Rethrow the error if requested
      if (rethrow) {
        throw error;
      }
    },
    [showErrorToast]
  );

  /**
   * Create a function that throws an error when called (useful for testing ErrorBoundary)
   *
   * @param {string} message - The error message
   * @returns {Function} A function that throws an error when called
   */
  const createErrorThrower = useCallback((message = "This is a demo error") => {
    return () => {
      throw new Error(message);
    };
  }, []);

  return {
    handleError,
    createErrorThrower,
  };
};

export default useErrorHandler;
