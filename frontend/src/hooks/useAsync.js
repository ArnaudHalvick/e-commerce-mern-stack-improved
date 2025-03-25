// frontend/src/hooks/useAsync.js

import { useState, useCallback, useMemo } from "react";
import { useError } from "../context/ErrorContext";

// Define default options outside the hook to keep the reference stable
const DEFAULT_OPTIONS = {
  showErrorToast: true,
  showSuccessToast: false,
  successMessage: "Operation completed successfully",
  onSuccess: null,
  onError: null,
};

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

  // Merge options and memoize the config to prevent re-creation on every render
  const config = useMemo(() => {
    return { ...DEFAULT_OPTIONS, ...options };
  }, [options]);

  /**
   * Execute the async function with error handling
   * @param {...any} args - Arguments to pass to the async function
   * @returns {Promise} - Promise that resolves to the result of the async function or null on error
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

        // Return null instead of rejecting - this prevents the error from propagating
        // while still indicating that the operation failed
        return { error: err, handled: true, success: false };
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
