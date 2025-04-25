// frontend/src/hooks/useAsync.js

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import useErrorRedux from "../hooks/useErrorRedux";

// Define default options outside the hook to keep the reference stable
const DEFAULT_OPTIONS = {
  showErrorToast: true,
  showSuccessToast: false,
  successMessage: "Operation completed successfully",
  onSuccess: null,
  onError: null,
  // Default timeout of 20 seconds - slightly longer than axios timeout to ensure axios handles it first
  timeout: 20000,
  timeoutMessage:
    "The request is taking longer than expected. Please try again.",
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
  const { showError, showSuccess } = useErrorRedux();

  // Ref to store timeout id for cleanup
  const timeoutRef = useRef(null);

  // Ref to track if the component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try {
        setLoading(true);
        setError(null);

        // Set up timeout to prevent infinite loading
        if (config.timeout > 0) {
          timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setLoading(false);
              const timeoutError = new Error(config.timeoutMessage);
              timeoutError.isTimeout = true;
              setError(timeoutError);

              if (config.showErrorToast) {
                showError(config.timeoutMessage);
              }

              if (config.onError) {
                config.onError(timeoutError);
              }
            }
          }, config.timeout);
        }

        const result = await asyncFunction(...args);

        // Clear timeout upon successful completion
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Don't update state if component unmounted
        if (!isMountedRef.current) return { success: false, aborted: true };

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
        // Clear timeout upon error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Don't update state if component unmounted
        if (!isMountedRef.current)
          return { success: false, aborted: true, error: err };

        // Set error state
        setError(err);

        // Show error toast if configured
        if (config.showErrorToast) {
          // Handle network and timeout errors with more user-friendly messages
          if (err.isNetworkError) {
            showError(
              "Unable to connect to the server. Please check your internet connection."
            );
          } else if (err.isTimeout) {
            showError("Request timed out. Please try again later.");
          } else {
            showError(err.message || "An error occurred");
          }
        }

        // Call error callback if provided
        if (config.onError) {
          config.onError(err);
        }

        // Return error object instead of rejecting - this prevents the error from propagating
        // while still indicating that the operation failed
        return { error: err, handled: true, success: false };
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
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
