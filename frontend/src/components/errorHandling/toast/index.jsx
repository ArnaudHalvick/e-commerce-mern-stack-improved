import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Format error message for better UX
 * @param {string|Error} error - The error message or object
 * @returns {string} Formatted error message
 */
const formatErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  // Handle string errors
  if (typeof error === "string") {
    // Check for timeout-related errors
    if (error.includes("timeout") || error.includes("timed out")) {
      return "Request timed out. Please try again later.";
    }
    return error;
  }

  // Handle error objects
  if (error.message) {
    // Check for timeout-related errors
    if (
      error.message.includes("timeout") ||
      error.message.includes("timed out")
    ) {
      return "Request timed out. Please try again later.";
    }

    // Check for offline errors
    if (
      error.message.includes("Network Error") ||
      error.message.includes("Failed to fetch")
    ) {
      return "Network error. Please check your internet connection.";
    }

    return error.message;
  }

  // Handle axios error responses
  if (error.response && error.response.data) {
    const { data } = error.response;
    return data.message || data.error || JSON.stringify(data);
  }

  return "An unexpected error occurred";
};

/**
 * Show an error toast notification
 * @param {string|Error} error - The error message or object
 */
export const showError = (error) => {
  const formattedMessage = formatErrorMessage(error);

  toast.error(formattedMessage, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show an info toast notification
 * @param {string} message - The message to display
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - The message to display
 */
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
