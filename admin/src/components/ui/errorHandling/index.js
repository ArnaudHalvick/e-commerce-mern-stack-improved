import Alert from "./Alert";
import ErrorBoundary from "./ErrorBoundary";
import Toast from "./toast/Toast";
import ToastProvider from "./toast/ToastProvider";
import { useToast } from "./toast/ToastHooks";
import { ToastContext } from "./toast/ToastContext";

/**
 * Utility function to handle errors consistently
 *
 * @param {Error} error - The error object
 * @param {Object} options - Options for handling the error
 * @param {Function} options.showToast - Function to show a toast notification (from useToast)
 * @param {Function} [options.logError] - Function to log the error (default: console.error)
 * @param {boolean} [options.rethrow=false] - Whether to rethrow the error
 * @returns {void}
 */
const handleError = (
  error,
  { showToast, logError = console.error, rethrow = false } = {}
) => {
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

  // Show a toast notification if showToast function is provided
  if (showToast) {
    showToast({
      message: errorMessage,
      variant: "error",
      duration: 5000,
    });
  }

  // Rethrow the error if requested
  if (rethrow) {
    throw error;
  }
};

/**
 * Utility to create an error throwing function for demo purposes
 * (useful for testing ErrorBoundary)
 *
 * @param {string} message - The error message
 * @returns {Function} A function that throws an error when called
 */
const createErrorThrower = (message = "This is a demo error") => {
  return () => {
    throw new Error(message);
  };
};

export {
  Alert,
  ErrorBoundary,
  Toast,
  ToastProvider,
  ToastContext,
  useToast,
  handleError,
  createErrorThrower,
};
