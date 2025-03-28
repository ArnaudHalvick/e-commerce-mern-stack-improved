// frontend/src/context/ErrorContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * ErrorContext - Provides global error state management and toast notifications
 */
const ErrorContext = createContext();

/**
 * Generate a unique toast ID
 * This ensures we don't have duplicate keys when multiple toasts are created in the same millisecond
 */
let uniqueToastId = 0;
const generateUniqueId = () => {
  const timestamp = Date.now();
  uniqueToastId++;
  return `${timestamp}-${uniqueToastId}`;
};

/**
 * ErrorProvider Component - Wraps the application to provide error handling capabilities
 */
export const ErrorProvider = ({ children }) => {
  // Array of active toast notifications
  const [toasts, setToasts] = useState([]);

  /**
   * Remove a specific toast by ID
   * @param {string} id - The ID of the toast to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Add a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast (error, warning, success, info)
   * @param {number} duration - How long to show the toast in ms
   */
  const addToast = useCallback(
    (message, type = "error", duration = 5000) => {
      const id = generateUniqueId();
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message, type, duration },
      ]);

      // Auto-remove toast after duration
      if (duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  /**
   * Show an error toast
   * @param {string} message - Error message to display
   * @param {number} duration - How long to show the toast in ms
   */
  const showError = useCallback(
    (message, duration = 5000) => {
      if (typeof message === "object") {
        // If an error object was passed instead of a string
        const errorMessage = message.message || JSON.stringify(message);
        return addToast(errorMessage, "error", duration);
      }
      return addToast(message, "error", duration);
    },
    [addToast]
  );

  /**
   * Show a success toast
   * @param {string} message - Success message to display
   * @param {number} duration - How long to show the toast in ms
   */
  const showSuccess = useCallback(
    (message, duration = 3000) => {
      return addToast(message, "success", duration);
    },
    [addToast]
  );

  /**
   * Show a warning toast
   * @param {string} message - Warning message to display
   * @param {number} duration - How long to show the toast in ms
   */
  const showWarning = useCallback(
    (message, duration = 4000) => {
      return addToast(message, "warning", duration);
    },
    [addToast]
  );

  /**
   * Show an info toast
   * @param {string} message - Info message to display
   * @param {number} duration - How long to show the toast in ms
   */
  const showInfo = useCallback(
    (message, duration = 3000) => {
      return addToast(message, "info", duration);
    },
    [addToast]
  );

  // Value provided by the context
  const value = {
    toasts,
    addToast,
    removeToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

/**
 * Custom hook to use the error context
 * @returns {Object} Error context value
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export default ErrorContext;
