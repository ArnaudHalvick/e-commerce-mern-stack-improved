// frontend/src/hooks/useAsync.js

import { useState, useCallback } from "react";
import { useError } from "../context/ErrorContext";

/**
 * Custom hook for handling asynchronous operations with loading and error states
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Options for customizing behavior
 * @returns {Object} - States and function for executing the async operation
 */
const useAsync = (asyncFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  // Default options
  const defaultOptions = {
    showErrorToast: true,
    showSuccessToast: false,
    successMessage: "Operation completed successfully",
    onSuccess: null,
    onError: null,
  };

  // Merge options
  const config = { ...defaultOptions, ...options };

  /**
   * Execute the async function with error handling
   * @param {...any} args - Arguments to pass to the async function
   * @returns {Promise} - Promise that resolves to the result of the async function
   */
  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const result = await asyncFunction(...args);
        setData(result);

        // Show success toast if configured
        if (config.showSuccessToast) {
          showSuccess(
            typeof config.successMessage === "function"
              ? config.successMessage(result)
              : config.successMessage
          );
        }

        // Call success callback if provided
        if (config.onSuccess) {
          config.onSuccess(result);
        }

        return result;
      } catch (err) {
        // Set error state
        setError(err);

        // Show error toast if configured
        if (config.showErrorToast) {
          showError(err.message || "An error occurred");
        }

        // Call error callback if provided
        if (config.onError) {
          config.onError(err);
        }

        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, config, showError, showSuccess]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
};

export default useAsync;
